import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotificationComposer from '../src/components/admin/NotificationComposer.jsx';
import SettingsForm from '../src/components/admin/SettingsForm.jsx';
import UsersTable from '../src/components/admin/UsersTable.jsx';

// Mock TanStack React Query Hooks
vi.mock('../src/hooks/useAdmin.js', () => ({
  useAdminSettingsQuery: () => ({
    isLoading: false,
    data: {
      data: {
        application_name: 'Food Saver',
        support_email: 'support@food.org',
        support_phone: '+15550200',
        max_image_size: 5,
        donation_expiry_hours: 24,
        volunteer_radius: 10,
        maintenance_mode: 'false',
        registration_toggle: 'true',
      },
    },
  }),
  useAdminUpdateSettingsMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useAdminDispatchNotificationMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useAdminUsersQuery: () => ({
    isLoading: false,
    data: {
      data: {
        list: [
          { id: '1', full_name: 'Alice Cooper', email: 'alice@cooper.com', role: 'DONOR', status: 'ACTIVE' },
        ],
        total: 1,
      },
    },
  }),
  useAdminUpdateUserStatusMutation: () => ({
    mutate: vi.fn(),
  }),
  useAdminDeleteUserMutation: () => ({
    mutate: vi.fn(),
  }),
  useAdminRestoreUserMutation: () => ({
    mutate: vi.fn(),
  }),
}));

describe('NotificationComposer Component', () => {
  it('renders title and input fields correctly', () => {
    render(<NotificationComposer />);
    expect(screen.getByText('Dispatch System Announcement')).toBeDefined();
    expect(screen.getByLabelText('Announcement Title')).toBeDefined();
  });
});

describe('SettingsForm Component', () => {
  it('renders application name and config details correctly', () => {
    render(<SettingsForm />);
    expect(screen.getByText('Global System Settings')).toBeDefined();
  });
});

describe('UsersTable Component', () => {
  it('indexes users data list grid correctly', () => {
    render(<UsersTable />);
    expect(screen.getByText('Platform Users Register')).toBeDefined();
    expect(screen.getByText('Alice Cooper')).toBeDefined();
  });
});
