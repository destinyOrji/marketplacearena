import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

interface ServiceListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

interface PaginatedResponse<T> {
  statuscode: number;
  status: string;
  data: T[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

class ServicesServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/services`;
  private h() { return { headers: { Authorization: `Bearer ${authService.getAccessToken()}` } }; }

  async getAllServices(params: ServiceListParams = {}): Promise<PaginatedResponse<any>> {
    try {
      const q = new URLSearchParams();
      if (params.page) q.append('page', String(params.page));
      if (params.page_size) q.append('page_size', String(params.page_size));
      if (params.search) q.append('search', params.search);
      if (params.status) q.append('status', params.status);
      const res = await axios.get(`${this.baseURL}?${q}`, this.h());
      return res.data;
    } catch {
      return { statuscode: 1, status: 'error', data: [], pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 } };
    }
  }
}

export const servicesService = new ServicesServiceClass();
