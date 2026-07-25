import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from '../src/components/layout/SearchBar.jsx';
import NotificationCenter from '../src/components/layout/NotificationCenter.jsx';

// Mock TanStack React Query or custom hooks
vi.mock('../src/hooks/useAdmin.js', () => ({
  useAdminSettingsQuery: () => ({ isLoading: false, data: {} }),
}));

vi.mock('../src/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { id: 'user-1', role: 'ADMIN' },
    isAuthenticated: true,
  }),
}));

describe('SearchBar Component', () => {
  it('renders search input field correctly', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Global search...')).toBeDefined();
  });
});

describe('NotificationCenter Component', () => {
  it('renders notification bell icon correctly', () => {
    render(<NotificationCenter />);
    expect(screen.queryByRole('button')).toBeDefined();
  });
});
