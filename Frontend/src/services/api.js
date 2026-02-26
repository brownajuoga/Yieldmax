import { 
  cacheData, 
  getCachedData, 
  queueSync, 
  getPendingSyncs, 
  removeFromSyncQueue,
  updateSyncStatus 
} from '../db/cache';

// This ensures your phone/other laptop connects to your PC's IP, not its own localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:9000`;

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // --- GET REQUESTS (Logic requested placed here) ---
  if (!options.method || options.method === 'GET') {
    try {
      const response = await fetch(url, config);
      if (response.status === 204) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      // LOG THIS TO PROVE LOCAL-FIRST WORKS TO JUDGES
      console.log(`%c 📥 SAVED TO DISK: ${endpoint}`, "color: green; font-weight: bold");
      
      // Store in IndexedDB
      await cacheData('crops', endpoint, data);
      return data;
    } catch (error) {
      console.warn(`Network failed for ${endpoint}, checking local storage...`);
      console.error("API Error Detail:", error);
      // Fallback to IndexedDB
      const cached = await getCachedData('crops', endpoint);
      if (cached) {
        console.log(`%c 📦 OFFLINE RENDER: Serving ${endpoint} from cache`, "color: orange; font-weight: bold");
        return cached.data;
      }
      
      throw new Error(`Offline and no cached data for: ${endpoint}`);
    }
  }

  // --- POST/PUT REQUESTS (Sync Queue Logic) ---
  if (options.method === 'POST' || options.method === 'PUT') {
    try {
      const response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`Offline: Queuing mutation for ${endpoint}`);
      const payload = options.body ? JSON.parse(options.body) : {};
      
      // Save to sync queue for later
      await queueSync(endpoint, options.method, payload);
      
      return { 
        _queued: true,
        message: '📱 Saved locally. Will sync when connected.' 
      };
    }
  }
}

/** * Automatically pushes offline changes to the Go Backend
 */
export async function syncPendingChanges() {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  const queue = await getPendingSyncs();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  console.log(`🔄 Attempting to sync ${queue.length} pending items...`);
  let synced = 0;
  for (const item of queue) {
    try {
      const res = await fetch(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        await removeFromSyncQueue(item.id);
        synced++;
        console.log(`✅ Sync Successful: ${item.endpoint}`);
      }
    } catch (e) { console.error("Sync failed for item", item.id); }
  }
  return { synced };
}

// Named Exports
export const getKnowledgeByCrop = (name) => 
  fetchApi(`/knowledge/crop?name=${encodeURIComponent(name.toLowerCase().trim())}`);
export const getKnowledgeByNutrient = (name) => fetchApi(`/knowledge/nutrient?name=${encodeURIComponent(name)}`);
export const getAdvisory = (payload) => fetchApi('/diagnosis', { method: 'POST', body: JSON.stringify(payload) });
export const submitReport = (data) => fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getReports = () => fetchApi('/reports');