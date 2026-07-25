import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LocationPickerMap from '../donation/LocationPickerMap.jsx';
import { ShieldAlert, Compass, Loader2 } from 'lucide-react';

const ngoFormSchema = z.object({
  organization_name: z.string().min(1, 'Organization Name is required.'),
  registration_number: z.string().min(1, 'Registration Number is required.'),
  license_number: z.string().optional(),
  organization_type: z.enum([
    'NGO',
    'Charity',
    'Food Bank',
    'Shelter',
    'Old Age Home',
    'Orphanage',
    'Religious Organization',
    'Government Organization',
    'Community Kitchen',
    'Disaster Relief',
    'Other',
  ]),
  description: z.string().optional(),
  website: z.string().url('Website must be a valid URL.').or(z.string().length(0)),
  email: z.string().email('Valid email address is required.').or(z.string().length(0)),
  phone: z.string().min(5, 'Valid contact phone number is required.').or(z.string().length(0)),
  address: z.string().min(3, 'Street Address is required.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  country: z.string().min(2, 'Country is required.'),
  postal_code: z.string().optional(),
  operating_radius: z.preprocess((val) => Number(val) || 10, z.number().gt(0, 'Operating radius must be greater than 0 KM.')),
  working_days: z.string().optional(),
  working_hours: z.string().optional(),
  emergency_contact: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const NGOProfileForm = ({ initialValues, onSubmit, isSubmitting = false, status }) => {
  const [coords, setCoords] = useState({
    lat: initialValues?.latitude || 40.7128,
    lng: initialValues?.longitude || -74.006,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ngoFormSchema),
    defaultValues: {
      organization_name: initialValues?.organization_name || '',
      registration_number: initialValues?.registration_number || '',
      license_number: initialValues?.license_number || '',
      organization_type: initialValues?.organization_type || 'NGO',
      description: initialValues?.description || '',
      website: initialValues?.website || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      address: initialValues?.address || '',
      city: initialValues?.city || '',
      state: initialValues?.state || '',
      country: initialValues?.country || '',
      postal_code: initialValues?.postal_code || '',
      operating_radius: initialValues?.operating_radius || 10,
      working_days: initialValues?.working_days || 'Mon-Fri',
      working_hours: initialValues?.working_hours || '09:00-17:00',
      emergency_contact: initialValues?.emergency_contact || '',
      latitude: initialValues?.latitude || 40.7128,
      longitude: initialValues?.longitude || -74.006,
    },
  });

  const handleCoordsChange = (lat, lng) => {
    setCoords({ lat, lng });
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const isLocked = ['VERIFIED', 'SUSPENDED'].includes(status);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {isLocked && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg flex items-start gap-2 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Profile Details Locked</p>
            <p className="text-xs mt-0.5">Your organization verification details are verified. Contact support to modify core values.</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Compass className="w-5 h-5 text-primary" /> Organization Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organization Name */}
          <div>
            <label className="text-sm font-semibold text-foreground">Organization Name *</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="e.g. City Hope Shelter"
              {...register('organization_name')}
            />
            {errors.organization_name && (
              <p className="mt-1 text-xs text-destructive">{errors.organization_name.message}</p>
            )}
          </div>

          {/* Registration Number */}
          <div>
            <label className="text-sm font-semibold text-foreground">Registration Number *</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="NGO-XXXX-YYYY"
              {...register('registration_number')}
            />
            {errors.registration_number && (
              <p className="mt-1 text-xs text-destructive">{errors.registration_number.message}</p>
            )}
          </div>

          {/* License Number */}
          <div>
            <label className="text-sm font-semibold text-foreground">License / Authority Number</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('license_number')}
            />
          </div>

          {/* Org Type */}
          <div>
            <label className="text-sm font-semibold text-foreground">Organization Type *</label>
            <select
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('organization_type')}
            >
              <option value="NGO">NGO</option>
              <option value="Charity">Charity</option>
              <option value="Food Bank">Food Bank</option>
              <option value="Shelter">Shelter</option>
              <option value="Old Age Home">Old Age Home</option>
              <option value="Orphanage">Orphanage</option>
              <option value="Religious Organization">Religious Organization</option>
              <option value="Government Organization">Government Organization</option>
              <option value="Community Kitchen">Community Kitchen</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Description / Mission Statement</label>
            <textarea
              rows={3}
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="Describe who you serve and your operational guidelines..."
              {...register('description')}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Compass className="w-5 h-5 text-primary" /> Contact & Location Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-foreground">Contact Email</label>
            <input
              type="email"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="contact@shelter.org"
              {...register('email')}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-foreground">Contact Phone</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="+15550999"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="text-sm font-semibold text-foreground">Website URL</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="https://www.shelter.org"
              {...register('website')}
            />
            {errors.website && (
              <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="text-sm font-semibold text-foreground">Operating Radius (KM) *</label>
            <input
              type="number"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('operating_radius')}
            />
            {errors.operating_radius && (
              <p className="mt-1 text-xs text-destructive">{errors.operating_radius.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Street Address *</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-foreground">City *</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('city')}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-semibold text-foreground">State *</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('state')}
            />
            {errors.state && (
              <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>
            )}
          </div>

          {/* Working hours/days */}
          <div>
            <label className="text-sm font-semibold text-foreground">Working Days</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. Mon-Fri"
              {...register('working_days')}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Working Hours</label>
            <input
              type="text"
              disabled={isSubmitting || isLocked}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. 09:00-17:00"
              {...register('working_hours')}
            />
          </div>

          {/* Leaflet pick map */}
          <div className="md:col-span-2 space-y-2 text-sm text-foreground">
            <label className="font-semibold block">Map Coordinates Details</label>
            <LocationPickerMap
              latitude={coords.lat}
              longitude={coords.lng}
              onChange={handleCoordsChange}
              readOnly={isSubmitting || isLocked}
            />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Lat: {coords.lat.toFixed(6)}</span>
              <span>Lng: {coords.lng.toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile
              </span>
            ) : (
              'Save NGO Profile'
            )}
          </button>
        </div>
      )}

    </form>
  );
};

export default NGOProfileForm;
