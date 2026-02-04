import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  Users,
} from 'lucide-react';
import { AlertsDropdown } from '@/components/notifications/AlertsDropdown';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Campagne', href: '/campaigns', icon: Megaphone },
  { name: 'Dialer', href: '/dialer', icon: Phone },
  { name: 'Proprietari', href: '/owners', icon: Users },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { profile, organization, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-xl font-bold text-gray-900">ImmoCRM</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r transition-all duration-300',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">ImmoCRM</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-2 rounded-md text-gray-500 hover:bg-gray-100',
              collapsed && 'mx-auto'
            )}
          >
            <ChevronLeft
              className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100',
                  collapsed && 'justify-center'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
              {!collapsed && item.name}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className={cn('flex items-center', collapsed && 'justify-center')}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.name || profile?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {organization?.name}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              'mt-3 flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Esci' : undefined}
          >
            <LogOut className={cn('h-5 w-5', !collapsed && 'mr-3')} />
            {!collapsed && 'Esci'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('lg:pl-64 transition-all duration-300', collapsed && 'lg:pl-20')}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center h-16 bg-white border-b px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {profile?.role === 'owner' && 'Admin'}
              {profile?.role === 'team_leader' && 'Team Leader'}
              {profile?.role === 'agent' && 'Agente'}
            </span>
            <AlertsDropdown />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
