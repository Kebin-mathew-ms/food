import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

/**
 * Hook to retrieve filtered/paginated list of food donations.
 */
export const useDonationsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['donations', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/donations', { params: filters });
      return response;
    },
  });
};

/**
 * Hook to retrieve details of a single donation.
 */
export const useDonationQuery = (id) => {
  return useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/donations/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Hook to retrieve stats card metrics for active donor.
 */
export const useDonorStatsQuery = () => {
  return useQuery({
    queryKey: ['donorStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/donations/stats');
      return response;
    },
  });
};

/**
 * Mutation hook to create a new food donation listing.
 */
export const useCreateDonationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (donationData) => {
      const response = await axiosInstance.post('/donations', donationData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donorStats'] });
      toast.success('Food donation listing created successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to list food donation.');
    },
  });
};

/**
 * Mutation hook to update an existing donation listing.
 */
export const useUpdateDonationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await axiosInstance.put(`/donations/${id}`, updateData);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['donorStats'] });
      toast.success('Donation listing updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update donation details.');
    },
  });
};

/**
 * Mutation hook to cancel a donation listing.
 */
export const useCancelDonationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.patch(`/donations/${id}/cancel`);
      return response;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
      queryClient.invalidateQueries({ queryKey: ['donorStats'] });
      toast.success('Donation listing cancelled successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel donation.');
    },
  });
};

/**
 * Mutation hook to soft-delete a donation.
 */
export const useDeleteDonationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/donations/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donorStats'] });
      toast.success('Donation listing removed successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete donation.');
    },
  });
};

/**
 * Mutation hook to upload and link donation images.
 */
export const useUploadImageMutation = (donationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axiosInstance.post(`/donations/${donationId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation', donationId] });
      toast.success('Image uploaded successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload image.');
    },
  });
};

/**
 * Mutation hook to delete donation image record.
 */
export const useDeleteImageMutation = (donationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId) => {
      const response = await axiosInstance.delete(`/donations/images/${imageId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation', donationId] });
      toast.success('Image deleted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete image.');
    },
  });
};

/**
 * Mutation hook to save images display orders.
 */
export const useReorderImagesMutation = (donationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedImageIds) => {
      const response = await axiosInstance.post(`/donations/${donationId}/images/reorder`, {
        orderedImageIds,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation', donationId] });
      toast.success('Images reordered successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reorder images.');
    },
  });
};
