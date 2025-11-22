import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // Use env var or fallback to localhost
});

export const createLink = (data) => api.post('/api/links', data);
export const getLinks = () => api.get('/api/links');
export const getLinkStats = (code) => api.get(`/api/links/${code}`);
export const deleteLink = (code) => api.delete(`/api/links/${code}`);

export default api;
