import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

// Add JWT token to headers if present
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  
  console.log('🌐 API Request:', {
    method: req.method,
    url: req.url,
    baseURL: req.baseURL,
    fullURL: req.baseURL + req.url,
    hasToken: !!token,
    headers: req.headers
  });
  
  if (token) {
    // Use Authorization header for interviews route, x-auth-token for profile route
    if (req.url.includes('/interviews') || req.url.includes('/questions')) {
      req.headers['Authorization'] = `Bearer ${token}`;
    } else {
      req.headers['x-auth-token'] = token;
    }
    console.log('🔑 Adding token to request:', req.url);
  } else {
    console.log('⚠️ No token found for request:', req.url);
  }
  
  return req;
});

// Add a response interceptor for error logging
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Log network errors specifically
    if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Network Error: Server is not running or not accessible');
    }
    
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: () => API.get('/profile'),
  
  // Update user profile
  updateProfile: (profileData) => API.put('/profile', profileData),
  
  // Upload profile photo
  uploadPhoto: (formData) => API.post('/profile/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Upload resume
  uploadResume: (formData) => API.post('/profile/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get test statistics and history
  getTestStats: () => API.get('/profile/test-stats'),
};

export default API; 