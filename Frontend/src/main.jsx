import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initDB, syncPendingChanges } from './services/api'

// Initialize IndexedDB
initDB().then(() => {
  console.log('Database ready');
  
  // Try to sync if online
  if (navigator.onLine) {
    syncPendingChanges();
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service Worker registered');
  }).catch(err => {
    console.warn('⚠ Service Worker registration failed:', err);
  });
}

// Listen for online/offline events
window.addEventListener('online', async () => {
  console.log('🟢 Back online - syncing changes...');
  const { syncPendingChanges } = await import('./services/api');
  syncPendingChanges();
});

window.addEventListener('offline', () => {
  console.log('🔴 Offline - queuing changes');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)