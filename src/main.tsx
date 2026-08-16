import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party cross-origin script errors (e.g. Disqus analytics / ad network blocks)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Cross-origin external script errors or disqus tracking errors
    if (
      event.message === 'Script error.' ||
      (event.filename && (event.filename.includes('disqus') || event.filename.includes('leaflet')))
    ) {
      // Prevent bubbling as unhandled fatal error
      event.preventDefault();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (String(event.reason).includes('disqus') ||
        String(event.reason).includes('Script error') ||
        String(event.reason).includes('SecurityError'))
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

