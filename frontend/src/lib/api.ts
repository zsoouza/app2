import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Cliente HTTP pré-configurado.
 * O token JWT é injetado automaticamente via interceptor.
 */
export const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

// Injeta Bearer token em toda requisição autenticada
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nexus_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nexus_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getToday: () => api.get('/dashboard/today'),
  getStats: (days?: number) => api.get('/dashboard/stats', { params: { days } }),
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const subjectsApi = {
  list: () => api.get('/subjects'),
  get: (id: string) => api.get(`/subjects/${id}`),
  create: (name: string) => api.post('/subjects', { name }),
  update: (id: string, name: string) => api.patch(`/subjects/${id}`, { name }),
  remove: (id: string) => api.delete(`/subjects/${id}`),
};

// ─── Topics ───────────────────────────────────────────────────────────────────

export const topicsApi = {
  list: (subjectId: string) => api.get(`/subjects/${subjectId}/topics`),
  create: (subjectId: string, name: string) =>
    api.post(`/subjects/${subjectId}/topics`, { name }),
  update: (subjectId: string, id: string, name: string) =>
    api.patch(`/subjects/${subjectId}/topics/${id}`, { name }),
  remove: (subjectId: string, id: string) =>
    api.delete(`/subjects/${subjectId}/topics/${id}`),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: (params?: { subjectId?: string; topicId?: string }) =>
    api.get('/sessions', { params }),
  get: (id: string) => api.get(`/sessions/${id}`),
  create: (data: { subjectId: string; topicId?: string; type: string; startTime?: string }) =>
    api.post('/sessions', data),
  finish: (
    id: string,
    data: { endTime?: string; content?: string; difficulties?: string; keyPoints?: string },
  ) => api.patch(`/sessions/${id}/finish`, data),
};

// ─── Goals ────────────────────────────────────────────────────────────────────

export const goalsApi = {
  list: () => api.get('/goals'),
  create: (data: { type: string; targetValue: number; period: string }) =>
    api.post('/goals', data),
  remove: (id: string) => api.delete(`/goals/${id}`),
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const exportApi = {
  subject: (id: string, format: 'pdf' | 'md' = 'md') =>
    api.get(`/export/subject/${id}`, { params: { format }, responseType: 'blob' }),
  topic: (id: string, format: 'pdf' | 'md' = 'md') =>
    api.get(`/export/topic/${id}`, { params: { format }, responseType: 'blob' }),
};
