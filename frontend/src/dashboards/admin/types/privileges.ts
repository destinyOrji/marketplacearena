/**
 * Privilege System Type Definitions
 */

export interface PrivilegeSubmenu {
  name: string;
  page: string;
  function: string[];
}

export interface Privilege {
  _id: string;
  privilege_id: number;
  name: string;
  page: string;
  icon: string;
  function: string[];
  /** ["0"] means no submenu; otherwise an array of PrivilegeSubmenu */
  submenu: ['0'] | PrivilegeSubmenu[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A privilege as stored in Admin.menu (what gets assigned to a user) */
export interface AssignedMenuItem {
  privilege_id: number;
  name: string;
  icon: string;
  page: string;
  function: string[];
  submenu: ['0'] | PrivilegeSubmenu[];
}

export interface PrivilegePagination {
  current_page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PrivilegesListResponse {
  statuscode: number;
  status: string;
  data: Privilege[];
  pagination: PrivilegePagination;
  message: string;
}

export interface AssignedPrivilegesResponse {
  statuscode: number;
  status: string;
  data: AssignedMenuItem[];
  message: string;
}

export type AssignAction = 'assign' | 'update';

export interface AssignPrivilegePayload {
  admin_user_id: string;
  action: AssignAction;
  privileges: AssignedMenuItem[];
}
