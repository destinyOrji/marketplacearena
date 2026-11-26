/**
 * Admin Staff Service
 * Calls GET /api/admin/staff with role/search/pagination params.
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const getToken = () =>
  localStorage.getItem('adminToken') || localStorage.getItem('authToken') || '';

const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export interface StaffUser {
  id:            string;
  firstName:     string;
  lastName:      string;
  email:         string;
  role:          string;
  status:        string;
  isActive:      boolean;
  emailVerified: boolean;
  createdAt:     string;
  profile?: {
    name?:              string;
    type?:              string;
    phone?:             string;
    professionalType?:  string;
    specialization?:    string;
    licenseNumber?:     string;
    isVerified?:        boolean;
    isHospitalStaff?:   boolean;
    hospitalDepartment?: string;
  } | null;
}

export interface StaffResponse {
  data:    StaffUser[];
  counts:  Record<string, number>;
  pagination: {
    page:        number;
    page_size:   number;
    total:       number;
    total_pages: number;
  };
}

export const getStaff = async (params: {
  role?:      string;
  search?:    string;
  status?:    string;
  page?:      number;
  page_size?: number;
}): Promise<StaffResponse> => {
  const res = await axios.get(`${API_URL}/admin/staff`, {
    headers: headers(),
    params,
  });
  return res.data as StaffResponse;
};
