import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useVolunteerProfileQuery,
  useUpdateVolunteerProfileMutation,
  useUpdateVolunteerStatusMutation,
} from '../../hooks/useVolunteer.js';
import { User, Shield, Info, MapPin, CheckCircle, Navigation } from 'lucide-react';

const profileSchema = z.object({
  vehicle_type: z.enum(['Bike', 'Scooter', 'Car', 'Van', 'Truck', 'Bicycle', 'Walking']),
  vehicle_number: z.string().min(1, 'Vehicle number is required.'),
  driving_license_number: z.string().min(1, 'Driving license number is required.'),
  phone: z.string().min(5, 'Phone number is required.'),
  emergency_contact: z.string().min(5, 'Emergency contact is required.'),
  operating_radius: z.coerce.number().gt(0, 'Radius must be greater than 0 KM.'),
  current_address: z.string().min(1, 'Current address is required.'),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  country: z.string().min(1, 'Country is required.'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export default function VolunteerProfile() {
  const { data, isLoading } = useVolunteerProfileQuery();
  const updateProfile = useUpdateVolunteerProfileMutation();
  const updateStatus = useUpdateVolunteerStatusMutation();
  const [gpsLoading, setGpsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      vehicle_type: 'Bike',
      vehicle_number: '',
      driving_license_number: '',
      phone: '',
      emergency_contact: '',
      operating_radius: 10.0,
      current_address: '',
      city: '',
      state: '',
      country: '',
      latitude: null,
      longitude: null,
    },
  });

  const latValue = watch('latitude');
  const lngValue = watch('longitude');

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      setValue('vehicle_type', p.vehicle_type || 'Bike');
      setValue('vehicle_number', p.vehicle_number || '');
      setValue('driving_license_number', p.driving_license_number || '');
      setValue('phone', p.user?.phone || '');
      setValue('emergency_contact', p.emergency_contact || '');
      setValue('operating_radius', p.operating_radius || 10.0);
      setValue('current_address', p.current_address || '');
      setValue('city', p.city || '');
      setValue('state', p.state || '');
      setValue('country', p.country || '');
      setValue('latitude', p.current_latitude || null);
      setValue('longitude', p.current_longitude || null);
    }
  }, [data, setValue]);

  const captureCoordinates = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        }
      );
    }
  };

  const onSubmit = (formData) => {
    updateProfile.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading profile data...</div>
      </div>
    );
  }

  const currentOnlineStatus = data?.data?.online_status || 'OFFLINE';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 text-foreground">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border rounded-2xl p-6 shadow-sm gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> Complete Volunteer Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Configure your availability details and vehicle specifications.</p>
        </div>

        {/* Availability controls */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground font-semibold">Current Status:</div>
          <div className="flex gap-2">
            {['OFFLINE', 'ONLINE', 'BREAK'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateStatus.mutate({ online_status: status })}
                disabled={updateStatus.isPending}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  currentOnlineStatus === status
                    ? status === 'ONLINE'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : status === 'BREAK'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                    : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: vehicle + credentials */}
        <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Vehicle & License details</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Vehicle Type</label>
            <select
              {...register('vehicle_type')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {['Bike', 'Scooter', 'Car', 'Van', 'Truck', 'Bicycle', 'Walking'].map((type) => (
                <option key={type} value={type} className="bg-card">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Vehicle Plate Number</label>
            <input
              type="text"
              {...register('vehicle_number')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. WA-8899-77"
            />
            {errors.vehicle_number && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.vehicle_number.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Driving License Number</label>
            <input
              type="text"
              {...register('driving_license_number')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. DL-VOL-9988"
            />
            {errors.driving_license_number && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.driving_license_number.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Primary Contact Phone</label>
            <input
              type="text"
              {...register('phone')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. +15550200"
            />
            {errors.phone && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Emergency Contact Number</label>
            <input
              type="text"
              {...register('emergency_contact')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. +15550299"
            />
            {errors.emergency_contact && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.emergency_contact.message}</p>}
          </div>
        </div>

        {/* Right column: locations details */}
        <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Location & Operating bounds</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Operating Radius (KM)</label>
            <input
              type="number"
              step="0.1"
              {...register('operating_radius')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. 10.0"
            />
            {errors.operating_radius && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.operating_radius.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Current Address Line</label>
            <input
              type="text"
              {...register('current_address')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g. 123 Main Street"
            />
            {errors.current_address && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.current_address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-semibold">City</label>
              <input
                type="text"
                {...register('city')}
                className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.city && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.city.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-semibold">State</label>
              <input
                type="text"
                {...register('state')}
                className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.state && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.state.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold">Country</label>
            <input
              type="text"
              {...register('country')}
              className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {errors.country && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.country.message}</p>}
          </div>

          {/* Coordinates capture trigger */}
          <div className="flex flex-col gap-3 bg-muted/30 p-4 border border-border rounded-xl mt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-semibold">GPS Coordinate:</span>
              {latValue && lngValue ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Coordinates set
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold">Coordinates missing</span>
              )}
            </div>

            <button
              type="button"
              onClick={captureCoordinates}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              {gpsLoading ? 'Locating...' : 'Auto-Capture Geolocation'}
            </button>
          </div>
        </div>

        {/* Submit Card */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="px-8 py-3 text-sm font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Profile Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}
