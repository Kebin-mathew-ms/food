import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

/**
 * Hook to retrieve NGO Profile details.
 */
export const useNgoProfileQuery = () => {
  return useQuery({
    queryKey: ['ngoProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/ngo/profile');
      return response; // Standard: { success, message, data }
    },
    retry: false, // Don't flood retry if profile is not completed yet
  });
};

/**
 * Mutation to complete or update NGO Profile.
 */
export const useUpdateNgoProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await axiosInstance.put('/ngo/profile', profileData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoProfile'] });
      queryClient.invalidateQueries({ queryKey: ['ngoDashboard'] });
      toast.success('NGO Profile saved successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update NGO Profile.');
    },
  });
};

/**
 * Mutation to upload NGO verification documents (license, ID, cert, logo).
 */
export const useUploadNgoDocumentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post('/ngo/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoProfile'] });
      queryClient.invalidateQueries({ queryKey: ['ngoDashboard'] });
      toast.success('Verification documents uploaded successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload verification documents.');
    },
  });
};

/**
 * Hook to retrieve NGO Dashboard summary aggregates.
 */
export const useNgoDashboardQuery = () => {
  return useQuery({
    queryKey: ['ngoDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/ngo/dashboard');
      return response;
    },
  });
};

/**
 * Hook to retrieve NGO Recharts statistics datasets.
 */
export const useNgoStatisticsQuery = () => {
  return useQuery({
    queryKey: ['ngoStatistics'],
    queryFn: async () => {
      const response = await axiosInstance.get('/ngo/statistics');
      return response;
    },
  });
};

/**
 * Hook to discover nearby food donations.
 */
export const useNearbyDonationsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['nearbyDonations', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/donations/nearby', { params: filters });
      return response;
    },
  });
};

/**
 * Hook to retrieve claim requests timeline history list.
 */
export const useRequestHistoryQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['requestHistory', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/requests/history', { params: filters });
      return response;
    },
  });
};

/**
 * Hook to retrieve details of a single request.
 */
export const useRequestDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['requestDetails', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/requests/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Mutation to submit a new claim request for food.
 */
export const useSubmitRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData) => {
      const response = await axiosInstance.post('/requests', requestData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nearbyDonations'] });
      queryClient.invalidateQueries({ queryKey: ['requestHistory'] });
      queryClient.invalidateQueries({ queryKey: ['ngoDashboard'] });
      toast.success('Food claim request submitted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit food request.');
    },
  });
};

/**
 * Mutation to cancel an active pending request.
 */
export const useCancelRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.patch(`/requests/${id}/cancel`);
      return response;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['nearbyDonations'] });
      queryClient.invalidateQueries({ queryKey: ['requestHistory'] });
      queryClient.invalidateQueries({ queryKey: ['requestDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['ngoDashboard'] });
      toast.success('Food claim request cancelled successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel request.');
    },
  });
};

/**
 * Mutation to submit delivery rating feedback.
 */
export const useSubmitFeedbackMutation = (requestId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await axiosInstance.post(`/requests/${requestId}/feedback`, feedbackData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestDetails', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requestHistory'] });
      toast.success('Delivery feedback submitted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit feedback.');
    },
  });
};
