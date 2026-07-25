import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, LayoutDashboard, Truck, Shield, PieChart, X, Compass, User, FolderPlus, Settings, AlertOctagon, FileText, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Global Sidebar component.
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  let sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  if (user?.role === 'DONOR') {
    sidebarLinks = [
      { name: 'Donor Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Create Donation', path: '/donations/create', icon: FolderPlus },
      { name: 'Donation History', path: '/donations/history', icon: Heart },
      { name: 'Profile Settings', path: '/profile', icon: User },
    ];
  } else if (user?.role === 'NGO') {
    sidebarLinks = [
      { name: 'NGO Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
      { name: 'Discover Surplus', path: '/ngo/discover', icon: Compass },
      { name: 'Verification & Profile', path: '/ngo/profile', icon: Shield },
      { name: 'Profile Settings', path: '/profile', icon: User },
    ];
  } else if (user?.role === 'VOLUNTEER') {
    sidebarLinks = [
      { name: 'Volunteer Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
      { name: 'Redistributions History', path: '/volunteer/history', icon: Truck },
      { name: 'Profile Settings', path: '/volunteer/profile', icon: User },
    ];
  } else if (user?.role === 'ADMIN') {
    sidebarLinks = [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: User },
      { name: 'Live Map Tracking', path: '/admin/live-map', icon: Map },
      { name: 'Complaints', path: '/admin/complaints', icon: AlertOctagon },
      { name: 'Reports & Exports', path: '/admin/reports', icon: FileText },
      { name: 'System Settings', path: '/admin/settings', icon: Settings },
    ];
  }

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Mobile Control */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border lg:hidden">
          <span className="font-extrabold text-foreground tracking-tight">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-2xs font-extrabold tracking-wide uppercase bg-primary-foreground/20 text-primary-foreground rounded-full">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.full_name || 'Guest User'}</p>
              <p className="text-3xs text-muted-foreground font-semibold uppercase">{user?.role || 'Visitor'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
