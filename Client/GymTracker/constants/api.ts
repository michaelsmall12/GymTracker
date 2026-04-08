// Detect if running on web
const isWeb = typeof window !== 'undefined';

// Environment-based API configuration
export const API_BASE_URL = isWeb 
  ? 'http://192.168.1.142:5213'      // Web: HTTPS
  : 'http://192.168.1.142:5213';    // Native: HTTPS

export const API_ENDPOINTS = {
  GYM_SESSIONS: `${API_BASE_URL}/api/GymSession`,
  LOCATIONS: `${API_BASE_URL}/api/Location`,
};
