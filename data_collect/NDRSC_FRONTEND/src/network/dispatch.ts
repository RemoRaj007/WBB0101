import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

let memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => {
    memoryToken = token;
};

export const dispatch = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Access Token
dispatch.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (memoryToken) {
            config.headers['Authorization'] = `Bearer ${memoryToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
dispatch.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const { data } = await dispatch.get('/auth/refresh');
                const { accessToken } = data;

                if (!accessToken) {
                    throw new Error('No refresh token');
                }

                setMemoryToken(accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return dispatch(originalRequest);
            } catch (refreshError) {
                // Refresh failed - logout user
                setMemoryToken(null);
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
