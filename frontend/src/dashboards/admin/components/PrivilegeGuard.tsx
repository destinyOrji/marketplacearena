/**
 * PrivilegeGuard
 * Wraps a page and redirects (or shows a 403 message) if the current
 * admin does not have access to the required page path or function key.
 *
 * Super-admin always bypasses the guard.
 *
 * Usage:
 *   <PrivilegeGuard page="/admin/patients">
 *     <AllPatientsPage />
 *   </PrivilegeGuard>
 *
 *   <PrivilegeGuard fnKey="users_delete">
 *     <DeleteButton />
 *   </PrivilegeGuard>
 */
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface PrivilegeGuardProps {
  /** The page path that must appear in the admin's menu (e.g. "/admin/patients") */
  page?: string;
  /** A function key that must appear in the admin's menu functions */
  fnKey?: string;
  /** If true, render a 403 card instead of redirecting (useful for inline conditional rendering) */
  inline?: boolean;
  children: ReactNode;
}

const AccessDenied: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[320px] space-y-4 text-center p-8">
    <div className="p-4 bg-red-100 rounded-full">
      <FiLock className="h-8 w-8 text-red-500" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
    <p className="text-sm text-gray-500 max-w-xs">
      You don't have permission to view this section.
      Contact your super admin to request access.
    </p>
  </div>
);

const PrivilegeGuard: React.FC<PrivilegeGuardProps> = ({
  page,
  fnKey,
  inline = false,
  children
}) => {
  const { admin, isSuperAdmin, hasMenuAccess, hasFunction } = useAdminAuth();

  // Super admin bypasses everything
  if (isSuperAdmin) return <>{children}</>;

  // No menu assigned yet — show access denied
  if (!admin) return inline ? <AccessDenied /> : <Navigate to="/admin/overview" replace />;

  // Check page-level access
  if (page && !hasMenuAccess(page)) {
    return inline ? <AccessDenied /> : <Navigate to="/admin/overview" replace />;
  }

  // Check function-level access
  if (fnKey && !hasFunction(fnKey)) {
    return inline ? <AccessDenied /> : <Navigate to="/admin/overview" replace />;
  }

  return <>{children}</>;
};

export default PrivilegeGuard;
