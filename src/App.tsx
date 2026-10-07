/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayerModal } from './components/player/FullPlayerModal';
import { CarModeView } from './components/player/CarModeView';
import { QueueDrawer } from './components/player/QueueDrawer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { HomeView } from './components/views/HomeView';
import { FavoritesView } from './components/views/FavoritesView';
import { AllTracksView } from './components/views/AllTracksView';
import { StationDetailView } from './components/views/StationDetailView';
import { ArtistDetailView } from './components/views/ArtistDetailView';
import { PlaylistDetailView } from './components/views/PlaylistDetailView';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });
  const {
    togglePlayPause,
    nextTrack,
    previousTrack,
    closeFullPlayer,
    isFullPlayerOpen,
    closeCarMode,
    isCarMode,
    closeQueue,
    isQueueOpen,
  } = useAudioPlayer();
  const mainScrollRef = React.useRef<HTMLElement>(null);

  // Scroll to top on view changes
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Global keyboard shortcuts for desktop & accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        nextTrack();
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        previousTrack();
      } else if (e.code === 'Escape') {
        if (isFullPlayerOpen) closeFullPlayer();
        else if (isQueueOpen) closeQueue();
        else if (isCarMode) closeCarMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, nextTrack, previousTrack, closeFullPlayer, isFullPlayerOpen, isQueueOpen, closeQueue, isCarMode, closeCarMode]);

  // Render current view
  const renderView = () => {
    switch (currentView.type) {
      case 'home':
        return <HomeView onNavigate={setCurrentView} />;
      case 'search':
        return <AllTracksView onNavigate={setCurrentView} />;
      case 'favorites':
        return <FavoritesView onNavigate={setCurrentView} />;
      case 'all_tracks':
        return (
          <AllTracksView
            initialSearchQuery={currentView.searchQuery}
            initialGenre={currentView.genre}
            onNavigate={setCurrentView}
          />
        );
      case 'station':
        return <StationDetailView stationId={currentView.stationId} onNavigate={setCurrentView} />;
      case 'artist':
        return <ArtistDetailView artistId={currentView.artistId} onNavigate={setCurrentView} />;
      case 'playlist':
        return <PlaylistDetailView playlistId={currentView.playlistId} onNavigate={setCurrentView} />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#121212] text-[#FAF7F2] flex flex-col selection:bg-[#C98A2E] selection:text-black overflow-hidden">
      {/* Upper Layout: Desktop Sidebar + Scrollable Content View */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex flex-col h-full shrink-0">
          <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#121212]">
          <Header currentView={currentView} onNavigate={setCurrentView} />

          <main
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 pb-32 md:pb-10 scroll-smooth"
          >
            <div className="max-w-7xl mx-auto w-full">
              {renderView()}
            </div>
          </main>
        </div>
      </div>

      {/* Persistent Audio Player (Desktop Dock & Mobile Floating Bar) */}
      <MiniPlayer />

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Modals & Overlays */}
      <FullPlayerModal />
      <QueueDrawer />
      <CarModeView />
    </div>
  );
};

export default function App() {
  return (
    <AudioPlayerProvider>
      <MainAppContent />
    </AudioPlayerProvider>
  );
}
