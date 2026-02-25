const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

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

// ==================== DIAGNOSIS API ====================

/**
 * Diagnose crop issues based on symptoms
 * @param {Object} symptoms - Symptom data { crop, symptoms: [], soil_conditions: {} }
 * @returns {Promise<Object>} Diagnosis result
 */
export async function diagnose(symptoms) {
  return fetchApi('/diagnosis', {
    method: 'POST',
    body: JSON.stringify(symptoms),
  });
}

/**
 * Check for updates to diagnosis rules
 * @param {string} clientVersion - Current version in RFC3339 format
 * @returns {Promise<Object|null>} Updated ruleset or null if up to date
 */
export async function checkDiagnosisUpdates(clientVersion) {
  return fetchApi(`/diagnosis/sync?version=${encodeURIComponent(clientVersion)}`);
}

// ==================== ADVISORY API ====================

/**
 * Get combined diagnosis and guidance advisory
 * @param {Object} symptoms - Symptom data
 * @returns {Promise<Object>} Advisory with diagnosis and guidance
 */
export async function getAdvisory(symptoms) {
  return fetchApi('/advisory', {
    method: 'POST',
    body: JSON.stringify(symptoms),
  });
}

// ==================== COMPOST API ====================

/**
 * Get composting plan based on inputs
 * @param {Object} request - Compost request { waste_type, quantity, additives: [] }
 * @returns {Promise<Object>} Composting plan
 */
export async function getCompostPlan(request) {
  return fetchApi('/compost', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ==================== REPORTS API ====================

/**
 * Submit a field report
 * @param {Object} report - Report data
 * @returns {Promise<void>}
 */
export async function submitReport(report) {
  return fetchApi('/reports', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

/**
 * Get all field reports
 * @returns {Promise<Array>} Array of reports
 */
export async function getReports() {
  return fetchApi('/reports', {
    method: 'GET',
  });
}

// ==================== HEALTH CHECK ====================

/**
 * Check if backend API is available
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
  try {
    await fetchApi('/reports');
    return true;
  } catch {
    return false;
  }
}
