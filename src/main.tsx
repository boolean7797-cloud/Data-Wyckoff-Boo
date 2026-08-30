// Suppress benign sandbox WebSocket / HMR connection logs in development environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (String(event.reason).includes('WebSocket closed') ||
       String(event.reason?.message || '').includes('WebSocket closed') ||
       String(event.reason).includes('failed to connect to websocket'))
    ) {
      event.preventDefault();
    }
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
