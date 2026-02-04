// Re-export types from root for backwards compatibility
export * from '../../types';

// Additional types for new features

// User Profile (from Supabase users table)
export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  settings: any;
  preferences: any;
  created_at: string;
}

export type UserRole = 'owner' | 'team_leader' | 'agent';

// Organization (multi-tenant support)
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  seats_total: number;
  seats_used: number;
  settings: any;
  created_at: string;
}

export type OrganizationPlan = 'starter' | 'professional' | 'enterprise' | 'custom';

// Legacy User type for backwards compatibility
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'agent';
  agencyId?: string;
  createdAt: string;
}

export interface Agency {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  agencyId: string;
  createdBy: string;
  startDate: string;
  endDate?: string;
  leadIds: string[];
  createdAt: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface DialerSession {
  id: string;
  campaignId: string;
  agentId: string;
  status: DialerStatus;
  startedAt: string;
  endedAt?: string;
  callsMade: number;
  callsAnswered: number;
  appointmentsBooked: number;
}

export type DialerStatus = 'idle' | 'calling' | 'in-call' | 'wrap-up' | 'paused';

export interface ScheduleSlot {
  id: string;
  agentId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

export interface AIScriptSuggestion {
  id: string;
  callId: string;
  suggestion: string;
  category: 'objection' | 'closing' | 'info' | 'general';
  confidence: number;
  createdAt: string;
}

// Permission types
export type Permission =
  | 'view_dashboard'
  | 'manage_leads'
  | 'make_calls'
  | 'book_appointments'
  | 'view_reports'
  | 'manage_campaigns'
  | 'manage_team'
  | 'manage_settings';

export interface RolePermissions {
  admin: Permission[];
  manager: Permission[];
  agent: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
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
  agent: [
    'view_dashboard',
    'manage_leads',
    'make_calls',
    'book_appointments',
  ],
};
