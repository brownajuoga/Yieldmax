const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generic fetch wrapper with error handling
 */
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

    if (response.status === 204) {
      return null; // No content
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 9000.');
    }
    throw error;
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
