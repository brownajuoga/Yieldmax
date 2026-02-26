import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initDB } from './db/cache' 
import { syncPendingChanges } from './services/api'

// 1. Wait for DB to be initialized BEFORE rendering
initDB().then(() => {
  console.log('✅ Database ready');
  
  // 2. Render the app ONLY after DB is ready
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // 3. Trigger sync if online
  if (navigator.onLine) {
    syncPendingChanges().then(res => {
        if(res?.synced > 0) console.log(`🔄 Synced ${res.synced} items`);
    });
  }
}).catch(err => {
  console.error(" Failed to initialize database:", err);
  // Optional: Render a "Critical Error" UI here
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('🚀 SW registered'))
      .catch(err => console.warn('⚠ SW failed:', err));
  });
}

window.addEventListener('online', () => syncPendingChanges());