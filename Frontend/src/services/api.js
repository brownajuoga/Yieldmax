import { 
  cacheData, 
  getCachedData, 
  queueSync, 
  getPendingSyncs, 
  removeFromSyncQueue,
  updateSyncStatus 
} from '../db/cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

/**
 * Enhanced fetch with offline support, caching, and sync queuing
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isOnline = navigator.onLine;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // GET requests: try network first, fallback to cache
  if (!options.method || options.method === 'GET') {
    try {
      const response = await fetch(url, config);

      if (response.status === 204) return null;
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful response
      await cacheData('crops', endpoint, data);
      console.log('✅ Cached:', endpoint);
      
      return data;
    } catch (error) {
      console.warn(`Network error on GET ${endpoint}, trying cache...`);
      
      // Fallback to cache
      const cached = await getCachedData('crops', endpoint);
      if (cached) {
        console.warn('📦 Serving from cache:', endpoint);
        return cached.data;
      }
      
      // No cache available
      console.error(`Failed to fetch ${endpoint} and no cache available`);
      throw new Error(`Cannot load data. Please check your connection. (${endpoint})`);
    }
  }

  // POST/PUT requests: queue for sync if offline
  if (options.method === 'POST' || options.method === 'PUT') {
    try {
      const response = await fetch(url, config);

      if (response.status === 204) return null;
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Synced:', endpoint);
      return data;
    } catch (error) {
      console.warn(`Network error on ${options.method} ${endpoint}, queuing...`);
      
      // Queue for later sync
      const payload = options.body ? JSON.parse(options.body) : {};
      await queueSync(endpoint, options.method, payload);
      
      return { 
        _queued: true,
        _offline: true,
        message: '📱 Changes saved locally. Will sync when connected.' 
      };
    }
  }

  throw new Error('Invalid request method');
}

/**
 * Sync all queued mutations with backend
 */
export async function syncPendingChanges() {
  if (!navigator.onLine) {
    console.log('📵 Offline - cannot sync yet');
    return { synced: 0, failed: 0 };
  }

  const queue = await getPendingSyncs();
  if (queue.length === 0) {
    console.log('✅ No pending changes');
    return { synced: 0, failed: 0 };
  }

  console.log(`🔄 Syncing ${queue.length} pending changes...`);
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const response = await fetch(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await removeFromSyncQueue(item.id);
        synced++;
        console.log(`✅ Synced: ${item.endpoint}`);
      } else {
        await updateSyncStatus(item.id, 'failed');
        failed++;
        console.error(`❌ Failed: ${item.endpoint}`);
      }
    } catch (error) {
      await updateSyncStatus(item.id, 'failed');
      failed++;
      console.error(`❌ Sync error: ${item.endpoint}`, error);
    }
  }

  console.log(`✅ Sync complete: ${synced} succeeded, ${failed} failed`);
  return { synced, failed };
}

// ==================== KNOWLEDGE API ====================

/**
 * Get farming guidance for a specific crop
 * @param {string} cropName - Name of the crop
 * @returns {Promise<Array>} Array of guidance items
 */
export async function getKnowledgeByCrop(cropName) {
  return fetchApi(`/knowledge/crop?name=${encodeURIComponent(cropName)}`);
}

/**
 * Get farming guidance for a specific nutrient
 * @param {string} nutrientName - Name of the nutrient (N, P, K, etc.)
 * @returns {Promise<Array>} Array of guidance items
 */
export async function getKnowledgeByNutrient(nutrientName) {
  return fetchApi(`/knowledge/nutrient?name=${encodeURIComponent(nutrientName)}`);
}

// ==================== DIAGNOSIS/ADVISORY API ====================

/**
 * Get combined diagnosis and guidance advisory
 * @param {Object} symptoms - Symptom data { crop, symptoms: [], soil_conditions: {} }
 * @returns {Promise<Object>} Advisory with diagnosis and guidance
 */
export async function getAdvisory(symptoms) {
  return fetchApi('/advisory', {
    method: 'POST',
    body: JSON.stringify(symptoms),
  });
}

// ==================== REPORTS API (Farm Registration) ====================

/**
 * Submit a farm registration
 * @param {Object} farmData - Farm data
 * @returns {Promise<void>}
 */
export async function submitReport(farmData) {
  return fetchApi('/reports', {
    method: 'POST',
    body: JSON.stringify(farmData),
  });
}

/**
 * Get all registered farms
 * @returns {Promise<Array>} Array of farm registrations
 */
export async function getReports() {
  return fetchApi('/reports', {
    method: 'GET',
  });
}