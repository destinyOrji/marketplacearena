import axios from 'axios';
import {
  Privilege,
  PrivilegesListResponse,
  AssignedPrivilegesResponse,
  AssignPrivilegePayload,
  AssignedMenuItem
} from '../types/privileges';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const BASE = `${API_BASE_URL}/admin/privileges`;

const authHeader = () => {
  const token =
    localStorage.getItem('admin_access_token') ||
    localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Privilege CRUD ───────────────────────────────────────────────────────────

export const getPrivileges = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PrivilegesListResponse> => {
  const res = await axios.get<PrivilegesListResponse>(BASE, {
    headers: authHeader(),
    params
  });
  return res.data;
};

export const getPrivilege = async (privilegeId: number): Promise<Privilege> => {
  const res = await axios.get<{ statuscode: number; data: Privilege }>(
    `${BASE}/${privilegeId}`,
    { headers: authHeader() }
  );
  return res.data.data;
};

export const createPrivilege = async (
  data: Omit<Privilege, '_id' | 'privilege_id' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<Privilege> => {
  const res = await axios.post<{ statuscode: number; data: Privilege }>(BASE, data, {
    headers: authHeader()
  });
  return res.data.data;
};

export const updatePrivilege = async (
  privilegeId: number,
  data: Partial<Omit<Privilege, '_id' | 'privilege_id' | 'createdAt' | 'updatedAt'>>
): Promise<Privilege> => {
  const res = await axios.put<{ statuscode: number; data: Privilege }>(
    `${BASE}/${privilegeId}`,
    data,
    { headers: authHeader() }
  );
  return res.data.data;
};

export const deletePrivilege = async (privilegeId: number): Promise<void> => {
  await axios.delete(`${BASE}/${privilegeId}`, { headers: authHeader() });
};

// ─── Assign / fetch assigned privileges ──────────────────────────────────────

export const assignPrivileges = async (
  payload: AssignPrivilegePayload
): Promise<AssignedMenuItem[]> => {
  const res = await axios.post<{ statuscode: number; data: AssignedMenuItem[] }>(
    `${BASE}/assign`,
    payload,
    { headers: authHeader() }
  );
  return res.data.data;
};

export const getAssignedPrivileges = async (
  adminUserId: string
): Promise<AssignedMenuItem[]> => {
  const res = await axios.get<AssignedPrivilegesResponse>(
    `${BASE}/assigned/${adminUserId}`,
    { headers: authHeader() }
  );
  return res.data.data;
};

export const revokeAllPrivileges = async (adminUserId: string): Promise<void> => {
  await axios.delete(`${BASE}/assigned/${adminUserId}`, {
    headers: authHeader()
  });
};

const privilegesService = {
  getPrivileges,
  getPrivilege,
  createPrivilege,
  updatePrivilege,
  deletePrivilege,
  assignPrivileges,
  getAssignedPrivileges,
  revokeAllPrivileges
};

export default privilegesService;
