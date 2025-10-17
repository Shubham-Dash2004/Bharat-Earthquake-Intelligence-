import axios from 'axios';

// Create a new Axios instance
const api = axios.create({
  // Vite exposes the environment variables on the import.meta.env object
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;