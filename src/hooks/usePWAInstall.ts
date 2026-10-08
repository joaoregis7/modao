import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global state to capture beforeinstallprompt at module load time (never missed by race conditions)
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptSubscribers = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

let isGlobalInstalled = false;
const installSubscribers = new Set<(installed: boolean) => void>();

if (typeof window !== 'undefined') {
  // Check standalone mode initially
  try {
    isGlobalInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  } catch {}

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptSubscribers.forEach((fn) => fn(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    isGlobalInstalled = true;
    globalDeferredPrompt = null;
    promptSubscribers.forEach((fn) => fn(null));
    installSubscribers.forEach((fn) => fn(true));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      isGlobalInstalled ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua));
  });

  useEffect(() => {
    const handlePromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
    };
    const handleInstallChange = (installed: boolean) => {
      setIsInstalled(installed);
    };

    promptSubscribers.add(handlePromptChange);
    installSubscribers.add(handleInstallChange);

    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      promptSubscribers.delete(handlePromptChange);
      installSubscribers.delete(handleInstallChange);
    };
  }, [deferredPrompt]);

  const install = useCallback(async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (!promptToUse) return false;
    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        isGlobalInstalled = true;
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
    } catch (e) {
      console.warn('PWA install prompt error', e);
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}
