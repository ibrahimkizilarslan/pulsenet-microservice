import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pulsenet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (credentials: any) => api.post('/auth/register', credentials),
  logout: () => {
    localStorage.removeItem('pulsenet_token');
    localStorage.removeItem('pulsenet_user');
  },
};

// Posts
export const postsApi = {
  getRecent: () => api.get('/posts/recent'),
  getById: (id: string) => api.get(`/posts/${id}`),
  getByAuthor: (authorId: string) => api.get(`/posts/by-author/${authorId}`),
  create: (post: { content: string; authorId: string; tags: string[] }) =>
    api.post('/posts', post),
};

// Users
export const usersApi = {
  getById: (id: string) => api.get(`/users/${id}`),
  getByUsername: (username: string) => api.get(`/users/by-username/${username}`),
  createProfile: (profile: any) => api.post('/users', profile),
  updateProfile: (id: string, profile: any) => api.put(`/users/${id}`, profile),
};

// Follows
export const followsApi = {
  follow: (followerId: string, followeeId: string) =>
    api.post('/follows', { followerId, followeeId }),
  unfollow: (followerId: string, followeeId: string) =>
    api.delete(`/follows/${followerId}/${followeeId}`),
  getFollowers: (userId: string) => api.get(`/follows/followers/${userId}`),
  getFollowing: (userId: string) => api.get(`/follows/following/${userId}`),
};

// Timeline
export const timelineApi = {
  getTimeline: (userId: string) => api.get(`/timeline/${userId}`),
};

export default api;
