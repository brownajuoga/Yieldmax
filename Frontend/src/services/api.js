import { cacheData, getCachedData, queueSync, getPendingSyncs, removeFromSyncQueue } from '../db/cache';

const API_BASE_URL = `http://${window.location.hostname}:9000`;

/**
 * CORE FETCH UTILITY
 * Handles Network -> Cache for GET
 * Handles Network -> Sync Queue for POST/PUT
 */
async function fetchApi(endpoint, options = {}, store = 'crops') {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (!options.method || options.method === 'GET') {
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      await cacheData(store, endpoint, data);
      return data;
    } catch (error) {
      return await getCachedData(store, endpoint);
    }
  }

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

/* ==========================================================================
   1. AUTHENTICATION (Required by AuthModal.jsx)
   ========================================================================== */

export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Invalid credentials');
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    localStorage.setItem('user_logged_in', 'true');
    return data;
  } catch (error) {
    // Offline login fallback
    const user = { email, name: email.split('@')[0], farm: "Offline Farm" };
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('user_logged_in', 'true');
    return { user };
  }
}

export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    localStorage.setItem('user_logged_in', 'true');
    return data;
  } catch (error) {
    localStorage.setItem('current_user', JSON.stringify(userData));
    localStorage.setItem('user_logged_in', 'true');
    return { user: userData };
  }
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('user_logged_in');
}

export const isLoggedIn = () => localStorage.getItem('user_logged_in') === 'true';
export const getCurrentUser = () => JSON.parse(localStorage.getItem('current_user'));

/* ==========================================================================
   2. FARM MANAGEMENT (Required by MyFarm.jsx)
   ========================================================================== */

export const getFarmsList = () => fetchApi('/farm/list', {}, 'farms');
export const createFarm = (farmData) => fetchApi('/farm/create', { method: 'POST', body: JSON.stringify(farmData) });
export const getFarmProfile = () => fetchApi('/farm/profile', {}, 'farms');
export const updateFarmProfile = (farmData) => fetchApi('/farm/update', { method: 'PUT', body: JSON.stringify(farmData) });

/* ==========================================================================
   3. MARKETPLACE & ADVISORY (Required by Marketplace.jsx and CropAdvisory.jsx)
   ========================================================================== */

export const getMarketListings = () => fetchApi('/market', {}, 'market');
export const postManureOffer = (data) => fetchApi('/market', { method: 'POST', body: JSON.stringify(data) });

export const getKnowledgeByCrop = (name) => fetchApi(`/knowledge/crop?name=${name.toLowerCase()}`);
export const getAdvisory = (payload) => fetchApi('/diagnosis', { method: 'POST', body: JSON.stringify(payload) });

/* ==========================================================================
   4. REPORTS & SYNCING
   ========================================================================== */

export const submitReport = (data) => fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getReports = () => fetchApi('/reports', {}, 'crops'); 

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