import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import SearchBar from './SearchBar.jsx';
import NotificationCenter from './NotificationCenter.jsx';

/**
 * Global Header component.
 */
export const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <Heart className="w-6 h-6 fill-primary" />
            <span className="hidden sm:inline-block tracking-tight text-foreground font-extrabold">
              Redistribute<span className="text-primary">Food</span>
            </span>
          </Link>
        </div>

        {/* Global Navigation Link Options */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors hover:text-primary ${
              isLinkActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                isLinkActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Button Links */}
        <div className="flex items-center gap-4">
          {isOffline && (
            <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Offline Mode
            </span>
          )}

          {isAuthenticated && (
            <>
              <SearchBar />
              <NotificationCenter />
            </>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-primary/5 flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/..${user.profile_image}` : user.profile_image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="hidden sm:inline-block text-sm font-semibold text-foreground">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">{user?.full_name}</p>
                      <p className="text-3xs text-primary font-semibold tracking-wide uppercase mt-0.5">{user?.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <User className="w-4 h-4 text-muted-foreground" /> Profile
                    </Link>
                    <Link
                      to="/profile#settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  isLinkActive('/login') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shadow-primary/10"
              >
                Join Platform
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
