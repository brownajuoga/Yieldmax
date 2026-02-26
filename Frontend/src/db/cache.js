const DB_NAME = 'yieldmax-cache';
const DB_VERSION = 1;
let db;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('crops')) {
        db.createObjectStore('crops', { keyPath: 'url' });
      }
      // NEW: Store for Marketplace listings
      if (!db.objectStoreNames.contains('market')) {
        db.createObjectStore('market', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('farms')) {
        db.createObjectStore('farms', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export const cacheData = (storeName, url, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const record = { url, data, timestamp: Date.now() };
    const request = store.put(record); 
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

export async function getCachedData(storeName, url) {
  return new Promise((resolve) => {
    if (!db) { resolve(null); return; }
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(url);
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
    request.onerror = () => resolve(null);
  });
}

export async function queueSync(endpoint, method, payload) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const request = tx.objectStore('syncQueue').add({
      endpoint, method, payload, timestamp: Date.now()
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingSyncs() {
  return new Promise((resolve) => {
    const tx = db.transaction('syncQueue', 'readonly');
    const request = tx.objectStore('syncQueue').getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

export async function removeFromSyncQueue(id) {
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').delete(id);
}