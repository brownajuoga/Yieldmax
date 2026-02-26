import { cacheData, getCachedData, queueSync, getPendingSyncs, removeFromSyncQueue } from '../db/cache';

const API_BASE_URL = `http://${window.location.hostname}:9000`;

/**
 * CORE FETCH UTILITY
 * Handles Network -> Cache Fallback (GET) 
 * Handles Network -> Sync Queue (POST/PUT)
 */
async function fetchApi(endpoint, options = {}, store = 'crops') {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // --- GET REQUESTS ---
  if (!options.method || options.method === 'GET') {
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      await cacheData(store, endpoint, data);
      return data;
    } catch (error) {
      console.warn(`Offline fallback for ${endpoint}`);
      return await getCachedData(store, endpoint);
    }
  }

  // --- POST/PUT REQUESTS ---
  if (options.method === 'POST' || options.method === 'PUT') {
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error('Request failed');
      return await response.json();
    } catch (error) {
      const body = options.body ? JSON.parse(options.body) : {};
      await queueSync(endpoint, options.method, body);
      return { _queued: true };
    }
  }
}

// 1. Auth & User
export const isLoggedIn = () => localStorage.getItem('user_logged_in') === 'true';
export const getCurrentUser = () => JSON.parse(localStorage.getItem('current_user'));

// 2. Knowledge & Advisory
export const getKnowledgeByCrop = (name) => fetchApi(`/knowledge/crop?name=${name.toLowerCase()}`);
export const getAdvisory = (payload) => fetchApi('/diagnosis', { method: 'POST', body: JSON.stringify(payload) });

// 3. Marketplace
export const getMarketListings = () => fetchApi('/market', {}, 'market');
export const postManureOffer = (data) => fetchApi('/market', { method: 'POST', body: JSON.stringify(data) });

// 4. Farm Management (THE FIX)
export const getFarmsList = () => fetchApi('/farm/list', {}, 'farms');
export const createFarm = (farmData) => fetchApi('/farm/create', { method: 'POST', body: JSON.stringify(farmData) });
export const getFarmProfile = () => fetchApi('/farm/profile', {}, 'farms');
export const updateFarmProfile = (farmData) => fetchApi('/farm/update', { method: 'PUT', body: JSON.stringify(farmData) });

// 5. Reports
export const submitReport = (data) => fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getReports = () => fetchApi('/reports', {}, 'crops'); 

// 6. Sync Engine
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