import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

/**
 * Retrieve volunteer profile details.
 */
export const useVolunteerProfileQuery = () => {
  return useQuery({
    queryKey: ['volunteerProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/volunteer/profile');
      return response;
    },
    retry: false,
  });
};

/**
 * Complete or update volunteer profile details.
 */
export const useUpdateVolunteerProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await axiosInstance.put('/volunteer/profile', profileData);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profile settings saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['volunteerProfile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile settings.');
    },
  });
};

/**
 * Toggle online status.
 */
export const useUpdateVolunteerStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (statusData) => {
      const response = await axiosInstance.patch('/volunteer/status', statusData);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Availability status updated.');
      queryClient.invalidateQueries({ queryKey: ['volunteerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['volunteerDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update availability.');
    },
  });
};

/**
 * Send telemetry coordinates update.
 */
export const useUpdateLocationMutation = () => {
  return useMutation({
    mutationFn: async (coords) => {
      const response = await axiosInstance.patch('/volunteer/location', coords);
      return response;
    },
  });
};

/**
 * Retrieve dashboard counts and recharts datasets.
 */
export const useVolunteerDashboardQuery = () => {
  return useQuery({
    queryKey: ['volunteerDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/volunteer/dashboard');
      return response;
    },
  });
};

/**
 * List available nearby assignments.
 */
export const useAssignmentsQuery = () => {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/assignments');
      return response;
    },
  });
};

/**
 * Accept assignment.
 */
export const useAcceptAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId) => {
      const response = await axiosInstance.patch(`/assignments/${deliveryId}/accept`);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment accepted successfully.');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['activeDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['volunteerDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept assignment.');
    },
  });
};

/**
 * Reject assignment.
 */
export const useRejectAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId) => {
      const response = await axiosInstance.patch(`/assignments/${deliveryId}/reject`);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment rejected.');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['activeDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['volunteerDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject assignment.');
    },
  });
};

/**
 * Retrieve active deliveries in progress.
 */
export const useActiveDeliveriesQuery = () => {
  return useQuery({
    queryKey: ['activeDeliveries'],
    queryFn: async () => {
      const response = await axiosInstance.get('/deliveries');
      return response;
    },
  });
};

/**
 * Retrieve detailed information of delivery.
 */
export const useDeliveryDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['deliveryDetails', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/deliveries/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Start transit (accepted -> way to pickup, or picked -> in transit).
 */
export const useStartTransitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId) => {
      const response = await axiosInstance.patch(`/deliveries/${deliveryId}/start`);
      return response;
    },
    onSuccess: (data, deliveryId) => {
      toast.success(data.message || 'Transit started.');
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['activeDeliveries'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start transit.');
    },
  });
};

/**
 * Transition arrived at destination NGO.
 */
export const useArrivedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId) => {
      const response = await axiosInstance.patch(`/deliveries/${deliveryId}/arrived`);
      return response;
    },
    onSuccess: (data, deliveryId) => {
      toast.success(data.message || 'Arrived at destination.');
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails', deliveryId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record destination arrival.');
    },
  });
};

/**
 * Complete food pickup.
 */
export const usePickupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deliveryId, payload }) => {
      const response = await axiosInstance.patch(`/deliveries/${deliveryId}/pickup`, payload);
      return response;
    },
    onSuccess: (data, { deliveryId }) => {
      toast.success(data.message || 'Pickup proof recorded.');
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['activeDeliveries'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record pickup.');
    },
  });
};

/**
 * Upload pickup proof image.
 */
export const useUploadPickupImageMutation = () => {
  return useMutation({
    mutationFn: async ({ deliveryId, formData }) => {
      const response = await axiosInstance.post(`/deliveries/${deliveryId}/pickup-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    },
  });
};

/**
 * Upload delivery proof image.
 */
export const useUploadDeliveryImageMutation = () => {
  return useMutation({
    mutationFn: async ({ deliveryId, formData }) => {
      const response = await axiosInstance.post(`/deliveries/${deliveryId}/delivery-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    },
  });
};

/**
 * Upload recipient signature.
 */
export const useUploadSignatureMutation = () => {
  return useMutation({
    mutationFn: async ({ deliveryId, signature }) => {
      const response = await axiosInstance.post(`/deliveries/${deliveryId}/signature`, { signature });
      return response;
    },
  });
};

/**
 * Complete food delivery.
 */
export const useCompleteDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deliveryId, payload }) => {
      const response = await axiosInstance.patch(`/deliveries/${deliveryId}/complete`, payload);
      return response;
    },
    onSuccess: (data, { deliveryId }) => {
      toast.success(data.message || 'Delivery completed successfully.');
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['activeDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['volunteerDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to complete delivery.');
    },
  });
};

/**
 * Fetch history list.
 */
export const useVolunteerHistoryQuery = (status) => {
  return useQuery({
    queryKey: ['volunteerHistory', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/history', { params });
      return response;
    },
  });
};
