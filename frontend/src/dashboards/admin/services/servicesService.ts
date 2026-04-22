import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

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
