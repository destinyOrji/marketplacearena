import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const servicesService = {
  getAllServices: async (params?: any) => {
    const token = authService.getAccessToken();
    const response = await axios.get(`${API_BASE_URL}/admin/services`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
