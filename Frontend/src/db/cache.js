// IndexedDB cache management without external dependencies

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

      // Store crops/guidance data
      if (!db.objectStoreNames.contains('crops')) {
        db.createObjectStore('crops', { keyPath: 'url' });
      }

      // Store farm registrations
      if (!db.objectStoreNames.contains('farms')) {
        db.createObjectStore('farms', { keyPath: 'id', autoIncrement: true });
      }

      // Store advisory results
      if (!db.objectStoreNames.contains('advisories')) {
        db.createObjectStore('advisories', { keyPath: 'id', autoIncrement: true });
      }

      // Queue for pending syncs (mutations)
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Inside cache.js
export const cacheData = (storeName, endpoint, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
  
    const record = {
      endpoint: endpoint, 
      data: data,
      timestamp: Date.now()
    };

    const request = store.put(record); 

    request.onsuccess = () => resolve();
    request.onerror = (e) => {
      console.error("IndexedDB Put Error:", e.target.error);
      reject(e.target.error);
    };
  });
};

// Retrieve cached data
export async function getCachedData(storeName, url) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(url);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Get all cached data from a store
export async function getAllCachedData(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Queue a mutation (POST/PUT) for sync
export async function queueSync(endpoint, method, payload) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const request = tx.objectStore('syncQueue').add({
      endpoint,
      method,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('📝 Mutation queued for sync:', endpoint);
      resolve(request.result);
    };
  });
}

// Get pending syncs
export async function getPendingSyncs() {
  return getAllCachedData('syncQueue');
}

// Update sync status
export async function updateSyncStatus(id, status) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const request = tx.objectStore('syncQueue').get(id);

    request.onsuccess = () => {
      const data = request.result;
      data.status = status;
      const updateRequest = tx.objectStore('syncQueue').put(data);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

// Remove from sync queue
export async function removeFromSyncQueue(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const request = tx.objectStore('syncQueue').delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('✅ Synced mutation removed from queue');
      resolve();
    };
  });
}

// Clear a store
export async function clearStore(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const request = tx.objectStore(storeName).clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}