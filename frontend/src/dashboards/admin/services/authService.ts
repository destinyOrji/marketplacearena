import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

export interface AdminProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  statuscode: number;
  status: string;
  message: string;
  data: {
    access: string;
    refresh: string;
    admin: AdminProfile;
  };
}

class AuthService {
  private readonly baseURL = `${API_BASE_URL}/admin/auth`;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${this.baseURL}/login`, credentials);
      if (response.data.statuscode === 0) {
        // Store using shared keys so all services can access it
        localStorage.setItem('authToken', response.data.data.access);
        localStorage.setItem('admin_access_token', response.data.data.access);
        localStorage.setItem('admin_refresh_token', response.data.data.refresh);
        localStorage.setItem('admin_profile', JSON.stringify(response.data.data.admin));
        // Also store as user for compatibility
        localStorage.setItem('user', JSON.stringify({
          ...response.data.data.admin,
          role: response.data.data.admin.role || 'admin'
        }));
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw { statuscode: 1, status: 'error', message: error.message || 'Login failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(`${this.baseURL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;
      const response = await axios.post<{ statuscode: number; data: { access: string; refresh: string } }>(
        `${this.baseURL}/refresh`, { refresh: refreshToken }
      );
      if (response.data.statuscode === 0) {
        const { access, refresh } = response.data.data;
        localStorage.setItem('authToken', access);
        localStorage.setItem('admin_access_token', access);
        localStorage.setItem('admin_refresh_token', refresh);
        return access;
      }
      return null;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  getAdminProfile(): AdminProfile | null {
    const str = localStorage.getItem('admin_profile');
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('admin_access_token') || localStorage.getItem('authToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('admin_refresh_token');
  }

  private clearTokens(): void {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_profile');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  setupInterceptors(): void {
    axios.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token && config.url?.includes('/admin/')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url?.includes('/admin/')) {
          originalRequest._retry = true;
          const newToken = await this.refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
