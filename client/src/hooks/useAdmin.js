import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

/**
 * Fetch administrative dashboard counts.
 */
export const useAdminDashboardQuery = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/dashboard');
      return response;
    },
  });
};

/**
 * Fetch administrative analytics monthly trends and datasets.
 */
export const useAdminAnalyticsQuery = () => {
  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/analytics');
      return response;
    },
  });
};

/**
 * Fetch paginated users index lists.
 */
export const useAdminUsersQuery = (params) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/users', { params });
      return response;
    },
  });
};

/**
 * Fetch detailed user profile.
 */
export const useAdminUserDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['adminUserDetails', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/users/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Modify user account status.
 */
export const useAdminUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axiosInstance.patch(`/admin/users/${id}/status`, { status });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetails'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    },
  });
};

/**
 * Soft delete user profile.
 */
export const useAdminDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    },
  });
};

/**
 * Restore user profile.
 */
export const useAdminRestoreUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.patch(`/admin/users/${id}/restore`);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User account restored.');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to restore user.');
    },
  });
};

/**
 * Fetch NGOs lists.
 */
export const useAdminNgosQuery = (status) => {
  return useQuery({
    queryKey: ['adminNgos', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/admin/ngos', { params });
      return response;
    },
  });
};

/**
 * Approve or reject NGO credentials.
 */
export const useAdminUpdateNgoStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, remarks }) => {
      const response = await axiosInstance.patch(`/admin/ngos/${id}/approve`, { status, remarks });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'NGO verification status updated.');
      queryClient.invalidateQueries({ queryKey: ['adminNgos'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update NGO verification.');
    },
  });
};

/**
 * Fetch volunteers list.
 */
export const useAdminVolunteersQuery = () => {
  return useQuery({
    queryKey: ['adminVolunteers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/volunteers');
      return response;
    },
  });
};

/**
 * Override/assign volunteer manually.
 */
export const useAdminAssignVolunteerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deliveryId, volunteerId }) => {
      const response = await axiosInstance.patch(`/admin/volunteers/${deliveryId}/assign`, { volunteer_id: volunteerId });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Volunteer assigned manually.');
      queryClient.invalidateQueries({ queryKey: ['adminVolunteers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to manually assign volunteer.');
    },
  });
};

/**
 * Fetch active Leaflet live coordinates points.
 */
export const useAdminLiveMapQuery = () => {
  return useQuery({
    queryKey: ['adminLiveMap'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/live-map');
      return response;
    },
    refetchInterval: 15000, // Auto refresh every 15s
  });
};

/**
 * Fetch complaints.
 */
export const useAdminComplaintsQuery = (status) => {
  return useQuery({
    queryKey: ['adminComplaints', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/admin/complaints', { params });
      return response;
    },
  });
};

/**
 * Resolve complaint ticket.
 */
export const useAdminResolveComplaintMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, responseText }) => {
      const response = await axiosInstance.patch(`/admin/complaints/${id}`, { status, responseText });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Complaint resolved successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint.');
    },
  });
};

/**
 * Dispatch system notifications.
 */
export const useAdminDispatchNotificationMutation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/admin/notifications', payload);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'System notification dispatched.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch notification.');
    },
  });
};

/**
 * Fetch application config settings parameters.
 */
export const useAdminSettingsQuery = () => {
  return useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/settings');
      return response;
    },
  });
};

/**
 * Batch update configurations.
 */
export const useAdminUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settingsData) => {
      const response = await axiosInstance.put('/admin/settings', settingsData);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Configurations saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    },
  });
};

/**
 * Fetch reports summaries.
 */
export const useAdminReportsQuery = (params) => {
  return useQuery({
    queryKey: ['adminReports', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/reports', { params });
      return response;
    },
    enabled: !!params.type,
  });
};

/**
 * Fetch audit logs list.
 */
export const useAdminAuditLogsQuery = (search) => {
  return useQuery({
    queryKey: ['adminAuditLogs', search],
    queryFn: async () => {
      const params = search ? { search } : {};
      const response = await axiosInstance.get('/admin/audit-logs', { params });
      return response;
    },
  });
};
