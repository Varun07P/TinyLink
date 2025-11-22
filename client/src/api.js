import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const createLink = (data) => api.post('/links', data);
export const getLinks = () => api.get('/links');
export const getLinkStats = (code) => api.get(`/links/${code}`);
export const deleteLink = (code) => api.delete(`/links/${code}`);

export default api;
