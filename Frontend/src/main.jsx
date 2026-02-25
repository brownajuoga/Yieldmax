import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initDB } from './db/cache'

// Initialize IndexedDB
initDB().then(() => {
  console.log('Local database initialized');
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service Worker registered');
  }).catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)