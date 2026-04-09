import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', 
});
// Ce code intercepte chaque requête pour y glisser le Token si l'utilisateur est connecté
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirige vers le login si le token est expiré ou invalide
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;