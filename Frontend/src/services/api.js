import { 
  cacheData, 
  getCachedData, 
  queueSync, 
  getPendingSyncs, 
  removeFromSyncQueue 
} from '../db/cache';

const API_BASE_URL = `http://${window.location.hostname}:9000`;

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  if (!options.method || options.method === 'GET') {
    // Check cache first for GET requests
    const cachedData = await getCachedData('crops', endpoint);
    
    // If offline or no network, use cache immediately
    if (!navigator.onLine && cachedData) {
      console.log(`%c 📦 OFFLINE RENDER: ${endpoint}`, "color: orange; font-weight: bold");
      return cachedData;
    }
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      console.log(`%c 📥 SAVED TO DISK: ${endpoint}`, "color: green; font-weight: bold");
      await cacheData('crops', endpoint, data);
      return data;
    } catch (error) {
      if (cachedData) {
        console.log(`%c 📦 OFFLINE RENDER: ${endpoint}`, "color: orange; font-weight: bold");
        return cachedData;
      }
      throw error;
    }
  }

  if (options.method === 'POST' || options.method === 'PUT') {
    // If offline, queue immediately
    if (!navigator.onLine) {
      const payload = JSON.parse(options.body);
      await queueSync(endpoint, options.method, payload);
      return { _queued: true };
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      if (!response.ok) throw new Error('Request failed');
      return await response.json();
    } catch (error) {
      const payload = JSON.parse(options.body);
      await queueSync(endpoint, options.method, payload);
      return { _queued: true };
    }
  }
}

// Auth API
export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('offline_package', JSON.stringify(data));
    localStorage.setItem('current_user', JSON.stringify(data.user));
    localStorage.setItem('user_logged_in', 'true');
    
    // Download all datasets for offline use
    await downloadAllDatasets();
    
    return data;
  } catch (error) {
    const users = JSON.parse(localStorage.getItem('farmUsers') || '[]');
    users.push(userData);
    localStorage.setItem('farmUsers', JSON.stringify(users));
    
    // Store offline user session
    localStorage.setItem('current_user', JSON.stringify(userData));
    localStorage.setItem('user_logged_in', 'true');
    
    throw error;
  }
}

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
    localStorage.setItem('offline_package', JSON.stringify(data));
    localStorage.setItem('current_user', JSON.stringify(data.user));
    localStorage.setItem('user_logged_in', 'true');
    
    // Download all datasets for offline use
    await downloadAllDatasets();
    
    return data;
  } catch (error) {
    const users = JSON.parse(localStorage.getItem('farmUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    
    // Store offline user session
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('user_logged_in', 'true');
    
    return { user, farm: user.farm };
  }
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('user_logged_in');
}

// Check if user is logged in
export function isLoggedIn() {
  return localStorage.getItem('user_logged_in') === 'true';
}

// Get current user
export function getCurrentUser() {
  const userStr = localStorage.getItem('current_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Get offline package
export function getOfflinePackage() {
  const packageStr = localStorage.getItem('offline_package');
  return packageStr ? JSON.parse(packageStr) : null;
}

// Download all datasets for offline use
export async function downloadAllDatasets() {
  try {
    console.log('%c 📥 Downloading all datasets for offline use...', 'color: blue; font-weight: bold');
    
    // Download compost materials
    await fetchApi('/compost/materials');
    
    // Download knowledge for all crops
    const crops = ['maize', 'tomato', 'lettuce', 'pepper'];
    for (const crop of crops) {
      await fetchApi(`/knowledge/crop?name=${crop}`);
    }
    
    // Download knowledge for all nutrients
    const nutrients = ['nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium'];
    for (const nutrient of nutrients) {
      await fetchApi(`/knowledge/nutrient?name=${nutrient}`);
    }
    
    console.log('%c ✅ All datasets downloaded and cached', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.warn('Failed to download some datasets:', error);
    return false;
  }
}

// Knowledge Base
export const getKnowledgeByCrop = (name) => fetchApi(`/knowledge/crop?name=${name.toLowerCase()}`);

// Diagnosis/Advisory
export const getAdvisory = (payload) => fetchApi('/diagnosis', { method: 'POST', body: JSON.stringify(payload) });

// Reports
export const submitReport = (data) => fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getReports = () => fetchApi('/reports'); 

// Farm Profile
export const getFarmProfile = () => fetchApi('/farm/profile');
export const updateFarmProfile = (farmData) => fetchApi('/farm/update', { 
  method: 'PUT', 
  body: JSON.stringify(farmData) 
});

export async function syncPendingChanges() {
  const queue = await getPendingSyncs();
  for (const item of queue) {
    try {
      const token = getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers,
        body: JSON.stringify(item.payload),
      });
      if (res.ok) await removeFromSyncQueue(item.id);
    } catch (e) { console.error("Sync failed", e); }
  }
}
// Farm Management
export const getFarmsList = () => fetchApi('/farm/list');
export const createFarm = (farmData) => fetchApi('/farm/create', { 
  method: 'POST', 
  body: JSON.stringify(farmData) 
});