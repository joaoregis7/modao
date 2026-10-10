import { Track } from '../types';
import { AudioStorage } from './audioStorage';

type AudioEventCallback = () => void;
type TimeUpdateCallback = (currentTime: number, duration: number) => void;

class AudioEngine {
  private accessEnabled = false;
  private audioCtx: AudioContext | null = null;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 200;
  private volume: number = 0.9;
  
  // Synthesizer scheduler
  private synthTimerId: number | null = null;
  private synthStep: number = 0;
  private masterGainNode: GainNode | null = null;

  // Real HTML5 audio fallback/primary
  private htmlAudio: HTMLAudioElement | null = null;
  private useHtmlAudio: boolean = false;

  // Listeners
  private onPlayCallbacks: AudioEventCallback[] = [];
  private onPauseCallbacks: AudioEventCallback[] = [];
  private onEndCallbacks: AudioEventCallback[] = [];
  private onTimeUpdateCallbacks: TimeUpdateCallback[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.htmlAudio = new Audio();
      this.htmlAudio.preload = 'none';

      this.htmlAudio.addEventListener('loadedmetadata', () => {
        if (this.htmlAudio && !isNaN(this.htmlAudio.duration) && this.htmlAudio.duration > 0) {
          this.duration = this.htmlAudio.duration;
          this.notifyTimeUpdate();
        }
      });

      this.htmlAudio.addEventListener('timeupdate', () => {
        if (this.useHtmlAudio && this.htmlAudio) {
          this.currentTime = this.htmlAudio.currentTime;
          this.notifyTimeUpdate();
        }
      });

      this.htmlAudio.addEventListener('ended', () => {
        if (this.useHtmlAudio) {
          this.isPlaying = false;
          this.notifyEnd();
        }
      });

      this.htmlAudio.addEventListener('error', () => {
        // Fallback to web audio synth if remote URL fails
        if (this.isPlaying && this.currentTrack) {
          this.useHtmlAudio = false;
          this.startProceduralSynth();
        }
      });
    }
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGainNode = this.audioCtx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.htmlAudio) {
      try {
        this.htmlAudio.volume = this.volume;
      } catch {}
    }
    if (this.masterGainNode && this.audioCtx) {
      try {
        this.masterGainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setAccessEnabled(enabled: boolean): void {
    this.accessEnabled = enabled;
    if (!enabled) this.pause();
  }

  public async playTrack(track: Track, startPosition?: number): Promise<void> {
    if (!this.accessEnabled) return;
    // 1. Stop any currently active audio or procedurally generated synth immediately
    if (this.synthTimerId) {
      clearInterval(this.synthTimerId);
      this.synthTimerId = null;
    }
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      try {
        this.htmlAudio.currentTime = 0;
      } catch {}
    }

    this.currentTrack = track;
    this.duration = track.duration || 200;
    // Guaranteed to start at position (defaults to 0 for every new track)
    this.currentTime = startPosition !== undefined ? startPosition : 0;
    this.synthStep = Math.floor(this.currentTime * 4);

    // Immediately notify all listeners that currentTime is 0:00
    this.notifyTimeUpdate();

    this.initAudioContext();

    // 2. Check if real MP3 was downloaded to local phone storage (IndexedDB)
    try {
      const localBlobUrl = await AudioStorage.getLocalAudioUrl(track.id);
      if (!this.accessEnabled) return;
      if (localBlobUrl && this.htmlAudio) {
        this.htmlAudio.src = localBlobUrl;
        try {
          this.htmlAudio.volume = this.volume;
        } catch {}
        try {
          this.htmlAudio.currentTime = this.currentTime;
        } catch {}
        const playPromise = this.htmlAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          if (!this.accessEnabled) return;
          this.useHtmlAudio = true;
          this.isPlaying = true;
          this.notifyPlay();
          return;
        }
      }
    } catch {
      // If offline blob fails to play, smoothly fall through
    }

    // 2b. Check if audio is cached in CacheStorage (PWA offline download)
    try {
      if (typeof window !== 'undefined' && 'caches' in window && track.audioUrl) {
        const cache = await caches.open('radio-modao-media-v1');
        const matched = await cache.match(track.audioUrl);
        if (!this.accessEnabled) return;
        if (matched) {
          const blob = await matched.blob();
          if (!this.accessEnabled) return;
          const cachedBlobUrl = URL.createObjectURL(blob);
          if (this.htmlAudio) {
            this.htmlAudio.src = cachedBlobUrl;
            try {
              this.htmlAudio.volume = this.volume;
            } catch {}
            try {
              this.htmlAudio.currentTime = this.currentTime;
            } catch {}
            const playPromise = this.htmlAudio.play();
            if (playPromise !== undefined) {
              await playPromise;
              if (!this.accessEnabled) return;
              this.useHtmlAudio = true;
              this.isPlaying = true;
              this.notifyPlay();
              return;
            }
          }
        }
      }
    } catch {
      // Continue to network streaming
    }

    // 3. If online audioUrl or /musicas/ folder audio is available, stream via HTML audio
    if (!this.accessEnabled) return;
    const audioSource = track.audioUrl || (track.id.startsWith('custom-') ? undefined : `/musicas/${track.id}.mp3`);
    if (audioSource && this.htmlAudio) {
      try {
        this.htmlAudio.src = audioSource;
        try {
          this.htmlAudio.volume = this.volume;
        } catch {}
        try {
          this.htmlAudio.currentTime = this.currentTime;
        } catch {}
        const playPromise = this.htmlAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          if (!this.accessEnabled) return;
          this.useHtmlAudio = true;
          this.isPlaying = true;
          this.notifyPlay();
          return;
        }
      } catch (err) {
        // If file not found in /musicas/ or remote fails, seamlessly fall back to built-in Brazilian Viola synth
        this.useHtmlAudio = false;
      }
    }

    // Default & reliable: Built-in Sertanejo Viola & Accordion procedurally synthesized performance
    if (!this.accessEnabled) return;
    this.useHtmlAudio = false;
    this.isPlaying = true;
    this.startProceduralSynth();
    this.notifyPlay();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    if (this.synthTimerId) {
      clearInterval(this.synthTimerId);
      this.synthTimerId = null;
    }
    this.notifyPause();
  }

  public resume(): void {
    if (!this.accessEnabled) return;
    if (!this.currentTrack) return;
    this.initAudioContext();

    if (this.useHtmlAudio && this.htmlAudio) {
      this.htmlAudio.play().catch(() => {
        if (!this.accessEnabled) return;
        this.useHtmlAudio = false;
        this.isPlaying = true;
        this.startProceduralSynth();
        this.notifyPlay();
      });
      this.isPlaying = true;
      this.notifyPlay();
    } else {
      this.isPlaying = true;
      this.startProceduralSynth();
      this.notifyPlay();
    }
  }

  public seek(seconds: number): void {
    const target = Math.max(0, Math.min(this.duration, seconds));
    this.currentTime = target;
    this.synthStep = Math.floor(target * 4);

    if (this.useHtmlAudio && this.htmlAudio) {
      this.htmlAudio.currentTime = target;
    }
    this.notifyTimeUpdate();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  // --- Procedural Sertanejo Viola & Sanfona Synthesis Engine ---
  private startProceduralSynth(): void {
    if (this.synthTimerId) {
      clearInterval(this.synthTimerId);
    }

    const bpm = this.currentTrack?.bpm || 100;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes tick

    this.synthTimerId = window.setInterval(() => {
      if (!this.isPlaying) return;

      this.currentTime += intervalMs / 1000;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.notifyTimeUpdate();
        this.pause();
        this.notifyEnd();
        return;
      }

      this.synthStep++;
      this.playSynthStep(this.synthStep);
      this.notifyTimeUpdate();
    }, intervalMs);
  }

  private playSynthStep(step: number): void {
    if (!this.audioCtx || !this.masterGainNode) return;

    // Harmonic Key Setup
    const key = this.currentTrack?.musicalKey || 'G';
    const keyFrequencies: Record<string, { root: number; third: number; fifth: number; octave: number; bass: number }> = {
      'G': { bass: 98.0, root: 196.0, third: 246.94, fifth: 293.66, octave: 392.0 },
      'D': { bass: 73.42, root: 146.83, third: 185.0, fifth: 220.0, octave: 293.66 },
      'A': { bass: 110.0, root: 220.0, third: 277.18, fifth: 330.0, octave: 440.0 },
      'E': { bass: 82.41, root: 164.81, third: 207.65, fifth: 246.94, octave: 329.63 },
      'C': { bass: 65.41, root: 130.81, third: 164.81, fifth: 196.0, octave: 261.63 },
      'F': { bass: 87.31, root: 174.61, third: 220.0, fifth: 261.63, octave: 349.23 },
      'Bb': { bass: 116.54, root: 233.08, third: 293.66, fifth: 349.23, octave: 466.16 },
    };

    const harmony = keyFrequencies[key] || keyFrequencies['G'];
    const now = this.audioCtx.currentTime;

    // Sertanejo Rhythm pattern: Bass on beat 1 and 3, plucked viola arpeggio & strum on upbeats
    const beatPosition = step % 16;

    // 1. Warm Acoustic Bass Note (Root / Fifth alternation)
    if (beatPosition === 0 || beatPosition === 8) {
      const bassFreq = beatPosition === 0 ? harmony.bass : harmony.bass * 1.5;
      this.playPluckedString(bassFreq, now, 0.4, 0.35);
    }

    // 2. Viola Caipira Dual-string Pluck (Rich double strings: octaves & unisons)
    if (beatPosition % 2 === 0) {
      const notes = [harmony.root, harmony.third, harmony.fifth, harmony.octave];
      const melodyFreq = notes[(Math.floor(step / 2)) % notes.length];
      
      // Typical Viola Caipira chorus effect: primary string + octave higher thin string
      this.playViolaNote(melodyFreq, now, 0.22, 0.2);
      this.playViolaNote(melodyFreq * 2, now, 0.15, 0.08); // high sympathetic octave
    }

    // 3. Vintage Accordion (Sanfona) Sustained Swell on downbeats
    if (beatPosition === 0 || beatPosition === 8) {
      this.playAccordionChord(harmony, now, 0.8, 0.12);
    }
  }

  private playPluckedString(freq: number, time: number, duration: number, gainLevel: number): void {
    if (!this.audioCtx || !this.masterGainNode) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + duration);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playViolaNote(freq: number, time: number, duration: number, gainLevel: number): void {
    if (!this.audioCtx || !this.masterGainNode) return;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Acoustic bright steel string timbre
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.002, time); // slight chorus detune

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.Q.setValueAtTime(1.8, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.25, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private playAccordionChord(harmony: { root: number; third: number; fifth: number }, time: number, duration: number, gainLevel: number): void {
    if (!this.audioCtx || !this.masterGainNode) return;

    const frequencies = [harmony.root, harmony.third, harmony.fifth];
    frequencies.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 1.001 * (1 + idx * 0.002), time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.15, time + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // --- Subscriptions ---
  public onPlay(cb: AudioEventCallback): () => void {
    this.onPlayCallbacks.push(cb);
    return () => {
      this.onPlayCallbacks = this.onPlayCallbacks.filter(c => c !== cb);
    };
  }

  public onPause(cb: AudioEventCallback): () => void {
    this.onPauseCallbacks.push(cb);
    return () => {
      this.onPauseCallbacks = this.onPauseCallbacks.filter(c => c !== cb);
    };
  }

  public onEnded(cb: AudioEventCallback): () => void {
    this.onEndCallbacks.push(cb);
    return () => {
      this.onEndCallbacks = this.onEndCallbacks.filter(c => c !== cb);
    };
  }

  public onTimeUpdate(cb: TimeUpdateCallback): () => void {
    this.onTimeUpdateCallbacks.push(cb);
    return () => {
      this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter(c => c !== cb);
    };
  }

  private notifyPlay() {
    this.onPlayCallbacks.forEach(cb => cb());
  }

  private notifyPause() {
    this.onPauseCallbacks.forEach(cb => cb());
  }

  private notifyEnd() {
    this.onEndCallbacks.forEach(cb => cb());
  }

  private notifyTimeUpdate() {
    this.onTimeUpdateCallbacks.forEach(cb => cb(this.currentTime, this.duration));
  }
}

export const audioEngine = new AudioEngine();
