///helen de oliveira
import axios from 'axios';

const api = axios.create({
  // Garante que o front converse diretamente com o contêiner FastAPI do Docker
  baseURL: 'http://localhost:8000', 
});

// Adiciona o token de autenticação em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;