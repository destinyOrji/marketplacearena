/**
 * Admin Authentication Service
 * Handles all authentication-related API calls
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminProfile {
  id: number;
  email: string;
  role: string;
  permissions: Record<string, any>;
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

export interface LogoutResponse {
  statuscode: number;
  status: string;
  message: string;
}

class AuthService {
  private readonly baseURL = `${API_BASE_URL}/admin/auth`;

  /**
   * Login admin user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${this.baseURL}/login`,
        credentials
      );
      
      if (response.data.statuscode === 0) {
        // Store tokens
        this.setAccessToken(response.data.data.access);
        this.setRefreshToken(response.data.data.refresh);
        this.setAdminProfile(response.data.data.admin);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        statuscode: 1,
        status: 'error',
        message: error.message || 'Login failed'
      };
    }
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await axios.post<LogoutResponse>(
          `${this.baseURL}/logout`,
          { refresh: refreshToken }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      this.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post<{ access: string }>(
        `${API_BASE_URL}/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      this.setAccessToken(newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  }

  /**
   * Get current admin profile
   */
  getAdminProfile(): AdminProfile | null {
    const profileStr = localStorage.getItem('admin_profile');
    if (!profileStr) return null;
    
    try {
      return JSON.parse(profileStr);
    } catch {
      return null;
    }
  }

  // Token management methods
  private setAccessToken(token: string): void {
    localStorage.setItem('admin_access_token', token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('admin_refresh_token', token);
  }

  private setAdminProfile(profile: AdminProfile): void {
    localStorage.setItem('admin_profile', JSON.stringify(profile));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('admin_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('admin_refresh_token');
  }

  private clearTokens(): void {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_profile');
  }

  /**
   * Setup axios interceptor for automatic token refresh
   */
  setupInterceptors(): void {
    // Request interceptor to add token
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.url?.includes('/admin/')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiry
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await this.refreshToken();
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            // Redirect to login if refresh fails
            window.location.href = '/admin/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
