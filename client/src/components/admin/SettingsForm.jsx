import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminSettingsQuery, useAdminUpdateSettingsMutation } from '../../hooks/useAdmin.js';

const settingsSchema = z.object({
  application_name: z.string().min(1, 'Application Name is required.'),
  support_email: z.string().email('Invalid support email address.'),
  support_phone: z.string().min(1, 'Support Phone is required.'),
  max_image_size: z.coerce.number().gt(0, 'Must be greater than 0.'),
  donation_expiry_hours: z.coerce.number().gt(0, 'Must be greater than 0.'),
  volunteer_radius: z.coerce.number().gt(0, 'Must be greater than 0.'),
  maintenance_mode: z.boolean(),
  registration_toggle: z.boolean(),
});

export default function SettingsForm() {
  const { data, isLoading } = useAdminSettingsQuery();
  const updateSettings = useAdminUpdateSettingsMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      application_name: 'Food Redistribution Platform',
      support_email: 'support@foodplatform.org',
      support_phone: '+15550100',
      max_image_size: 5,
      donation_expiry_hours: 24,
      volunteer_radius: 10,
      maintenance_mode: false,
      registration_toggle: true,
    },
  });

  useEffect(() => {
    if (data?.data) {
      const c = data.data;
      setValue('application_name', c.application_name || 'Food Redistribution Platform');
      setValue('support_email', c.support_email || 'support@foodplatform.org');
      setValue('support_phone', c.support_phone || '+15550100');
      setValue('max_image_size', c.max_image_size ? parseInt(c.max_image_size) : 5);
      setValue('donation_expiry_hours', c.donation_expiry_hours ? parseInt(c.donation_expiry_hours) : 24);
      setValue('volunteer_radius', c.volunteer_radius ? parseInt(c.volunteer_radius) : 10);
      setValue('maintenance_mode', c.maintenance_mode === 'true');
      setValue('registration_toggle', c.registration_toggle === 'true');
    }
  }, [data, setValue]);

  const onSubmit = (formData) => {
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading system config parameters...</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm text-foreground"
    >
      <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Global System Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* App Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Application Title Name</label>
          <input
            type="text"
            {...register('application_name')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.application_name && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.application_name.message}</p>}
        </div>

        {/* Support Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Support Helpdesk Email</label>
          <input
            type="text"
            {...register('support_email')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.support_email && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.support_email.message}</p>}
        </div>

        {/* Support Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Support Contact Phone</label>
          <input
            type="text"
            {...register('support_phone')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.support_phone && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.support_phone.message}</p>}
        </div>

        {/* Operating Radius */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Default Volunteer Match Radius (KM)</label>
          <input
            type="number"
            {...register('volunteer_radius')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.volunteer_radius && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.volunteer_radius.message}</p>}
        </div>

        {/* Max Image Upload Size */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Maximum Allowed Upload Image Size (MB)</label>
          <input
            type="number"
            {...register('max_image_size')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.max_image_size && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.max_image_size.message}</p>}
        </div>

        {/* Expiry Hours limit */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Default Donation Expiry (Hours)</label>
          <input
            type="number"
            {...register('donation_expiry_hours')}
            className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {errors.donation_expiry_hours && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.donation_expiry_hours.message}</p>}
        </div>

        {/* Boolean toggle check values */}
        <div className="flex flex-col gap-3 justify-center bg-muted/30 p-4 border border-border rounded-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Registration Switch Toggle</span>
            <input type="checkbox" {...register('registration_toggle')} className="w-4 h-4 cursor-pointer accent-primary" />
          </div>
          <div className="flex justify-between items-center text-xs mt-2">
            <span className="font-semibold text-foreground">Maintenance Mode Status</span>
            <input type="checkbox" {...register('maintenance_mode')} className="w-4 h-4 cursor-pointer accent-primary" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="px-8 py-3 text-sm font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          {updateSettings.isPending ? 'Saving Settings...' : 'Save Config Settings'}
        </button>
      </div>
    </form>
  );
}
