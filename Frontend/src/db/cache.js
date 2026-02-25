import { openDB } from 'idb';

const DB_NAME = 'yieldmax-cache';
const DB_VERSION = 1;

let db;

export async function initDB() {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store crops/guidance data
      if (!db.objectStoreNames.contains('crops')) {
        db.createObjectStore('crops', { keyPath: 'name' });
      }
      
      // Store farm registrations
      if (!db.objectStoreNames.contains('farms')) {
        db.createObjectStore('farms', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store advisory results
      if (!db.objectStoreNames.contains('advisories')) {
        db.createObjectStore('advisories', { keyPath: 'id', autoIncrement: true });
      }
      
      // Queue for pending syncs
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

// Cache API response
export async function cacheData(storeName, data) {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(data);
  await tx.done;
}

// Retrieve cached data
export async function getCachedData(storeName, key) {
  return db.get(storeName, key);
}

// Queue mutation for sync
export async function queueSync(endpoint, method, payload) {
  return db.add('syncQueue', {
    endpoint,
    method,
    payload,
    timestamp: Date.now(),
    status: 'pending',
  });
}

// Get pending syncs
export async function getPendingSyncs() {
  return db.getAll('syncQueue');
}

// Remove from queue after successful sync
export async function removeFromSyncQueue(id) {
  return db.delete('syncQueue', id);
}