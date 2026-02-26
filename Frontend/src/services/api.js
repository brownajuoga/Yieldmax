import { cacheData, getCachedData, queueSync } from '../db/cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) return null;
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Cache successful responses
    if (options.method === 'GET' || !options.method) {
      await cacheData('crops', { name: endpoint, data, timestamp: Date.now() });
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Try cache fallback for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = await getCachedData('crops', endpoint);
      if (cached) {
        console.warn('Serving from cache:', endpoint);
        return cached.data;
      }
    }
    
    // Queue mutations for later sync
    if (options.method === 'POST' || options.method === 'PUT') {
      await queueSync(endpoint, options.method, JSON.parse(options.body || '{}'));
      return { _queued: true, message: 'Changes saved offline. Will sync when reconnected.' };
    }
    
    throw error;
  }
}

async function fetchData(url) {
    // Check if the data is in the cache
    const cachedResponse = await caches.match(url);
    if (cachedResponse) {
        return cachedResponse.json();
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const cache = await caches.open('my-cache');
            cache.put(url, response.clone());
            return response.json();
        } else {
            throw new Error('Network response was not ok.');
        }
    } catch (error) {
        console.error('Fetch failed; returning offline data instead.', error);
        return { error: 'Unable to fetch data.' };
    }
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
