import { 
  cacheData, 
  getCachedData, 
  queueSync, 
  getPendingSyncs, 
  removeFromSyncQueue 
} from '../db/cache';

const API_BASE_URL = `http://${window.location.hostname}:9000`;

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  if (!options.method || options.method === 'GET') {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      console.log(`%c 📥 SAVED TO DISK: ${endpoint}`, "color: green; font-weight: bold");
      // Use 'endpoint' as the URL key to match cache.js
      await cacheData('crops', endpoint, data);
      return data;
    } catch (error) {
      const cachedData = await getCachedData('crops', endpoint);
      if (cachedData) {
        console.log(`%c 📦 OFFLINE RENDER: ${endpoint}`, "color: orange; font-weight: bold");
        return cachedData;
      }
      throw error;
    }
  }

  if (options.method === 'POST') {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      if (!response.ok) throw new Error('Post failed');
      return await response.json();
    } catch (error) {
      const payload = JSON.parse(options.body);
      await queueSync(endpoint, 'POST', payload);
      return { _queued: true };
    }
  }
}

// Knowledge Base Exports
export const getKnowledgeByCrop = (name) => fetchApi(`/knowledge/crop?name=${name.toLowerCase()}`);

// Diagnosis/Advisory Exports
export const getAdvisory = (payload) => fetchApi('/diagnosis', { method: 'POST', body: JSON.stringify(payload) });

// --- THE MISSING EXPORTS FOR MYFARM.JSX ---
export const submitReport = (data) => fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getReports = () => fetchApi('/reports'); 

export async function syncPendingChanges() {
  const queue = await getPendingSyncs();
  for (const item of queue) {
    try {
      const res = await fetch(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (res.ok) await removeFromSyncQueue(item.id);
    } catch (e) { console.error("Sync failed", e); }
  }
}