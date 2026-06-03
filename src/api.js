import axios from 'axios';

const api = axios.create({
  baseURL: 'https://biblioteca-backend-yz1f.onrender.com',
  headers: { 'Content-Type': 'application/json' }
});

// ✅ NO ENVÍA TOKEN A LOGIN NI REGISTRO
api.interceptors.request.use(
  (config) => {
    if (config.url.includes('/login') || config.url.includes('/register') || config.url.includes('/registrar')) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => { console.error("🔴 ERROR API:", err.response?.status, err.response?.data); return Promise.reject(err); }
);

export default api;