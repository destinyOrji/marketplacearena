/**
 * Admin Authentication Context
 * Manages admin authentication state and provides auth methods
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AdminProfile } from '../services/authService';
import { AssignedMenuItem } from '../types/privileges';

interface AdminAuthContextType {
  admin: AdminProfile | null;
  menu: AssignedMenuItem[];
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  /** Returns true if the current admin has a menu item whose page matches the given path */
  hasMenuAccess: (page: string) => boolean;
  /** Returns true if the current admin has a specific function key anywhere in their menu */
  hasFunction: (fnKey: string) => boolean;
  /** Refresh the menu from the server after privileges are updated */
  refreshMenu: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [menu, setMenu] = useState<AssignedMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    // Setup axios interceptors
    authService.setupInterceptors();
  }, []);

  const checkAuthStatus = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const profile = authService.getAdminProfile();
      setAdmin(profile);
      // Load menu from localStorage cache (populated on login / refreshMenu)
      const cachedMenu = authService.getAdminMenu();
      setMenu(cachedMenu);
    } else {
      setAdmin(null);
      setMenu([]);
    }
  };

  const refreshMenu = async (): Promise<void> => {
    const profile = authService.getAdminProfile();
    if (!profile) return;
    try {
      const { getAssignedPrivileges } = await import('../services/privilegesService');
      const fetchedMenu = await getAssignedPrivileges(profile.id);
      setMenu(fetchedMenu);
      authService.saveAdminMenu(fetchedMenu);
    } catch {
      // non-fatal — keep existing menu
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.statuscode === 0) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        // Fetch and cache the assigned menu for this admin
        try {
          const { getAssignedPrivileges } = await import('../services/privilegesService');
          const fetchedMenu = await getAssignedPrivileges(response.data.admin.id);
          setMenu(fetchedMenu);
          authService.saveAdminMenu(fetchedMenu);
        } catch {
          setMenu([]);
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      setAdmin(null);
      setIsAuthenticated(false);
      setMenu([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      setMenu([]);
      setLoading(false);
      navigate('/admin/login');
    }
  };

  const checkAuth = (): boolean => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      setAdmin(null);
      setMenu([]);
    }
    
    return authenticated;
  };

  /**
   * Returns true if the logged-in admin is super_admin
   * OR has a menu item whose `page` matches the given path.
   */
  const hasMenuAccess = (page: string): boolean => {
    if (admin?.role === 'super_admin') return true;
    return menu.some(item => {
      if (item.page === page) return true;
      const sub = item.submenu;
      if (Array.isArray(sub) && !(sub.length === 1 && sub[0] === '0')) {
        return (sub as any[]).some((s: any) => s.page === page);
      }
      return false;
    });
  };

  /**
   * Returns true if the logged-in admin has a specific function key
   * anywhere in their menu (top-level or submenu).
   */
  const hasFunction = (fnKey: string): boolean => {
    if (admin?.role === 'super_admin') return true;
    return menu.some(item => {
      if (item.function.includes(fnKey)) return true;
      const sub = item.submenu;
      if (Array.isArray(sub) && !(sub.length === 1 && sub[0] === '0')) {
        return (sub as any[]).some((s: any) => Array.isArray(s.function) && s.function.includes(fnKey));
      }
      return false;
    });
  };

  const value: AdminAuthContextType = {
    admin,
    menu,
    loading,
    isAuthenticated,
    isSuperAdmin: admin?.role === 'super_admin',
    login,
    logout,
    checkAuth,
    hasMenuAccess,
    hasFunction,
    refreshMenu
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
