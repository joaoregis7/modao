import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
registerSW({ immediate: true });

// Detect mobile standalone mode (when opened from Home Screen on iPhone or Android)
if (typeof window !== 'undefined') {
  const checkStandalone = () => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    if (isStandalone) {
      document.documentElement.classList.add('is-standalone');
    }
  };
  checkStandalone();
  try {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
  } catch {}
}

createRoot(document.getElementById('root')!).render(<App />);
