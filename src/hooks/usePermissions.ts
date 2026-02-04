import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { Permission } from '../types';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
    'view_reports',
    'manage_campaigns',
    'manage_team',
    'manage_settings',
  ],
  team_leader: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
    'view_reports',
    'manage_campaigns',
    'manage_team',
  ],
  agent: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
  ],
  // Legacy roles mapping
  admin: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
    'view_reports',
    'manage_campaigns',
    'manage_team',
    'manage_settings',
  ],
  manager: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
    'view_reports',
    'manage_campaigns',
    'manage_team',
  ],
};

/**
 * Hook for checking user permissions based on their role
 */
export const usePermissions = () => {
  const { profile } = useAuth();

  const permissions = useMemo(() => {
    if (!profile) return [];
    return ROLE_PERMISSIONS[profile.role] || [];
  }, [profile]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  // Role checks
  const isOwner = profile?.role === 'owner';
  const isTeamLeader = profile?.role === 'team_leader' || isOwner;
  const isAgent = !!profile;

  // Legacy role checks (backwards compatibility)
  const isAdmin = isOwner;
  const isManager = isTeamLeader;

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isTeamLeader,
    isAgent,
    // Legacy
    isAdmin,
    isManager,
  };
};

export default usePermissions;
