import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PHONE_REGEX } from '../../../../server/src/utils/regex.js'; // Reference backend validation phone regex
import LocationPickerMap from './LocationPickerMap.jsx';
import { MapPin, Sparkles, Loader2 } from 'lucide-react';

const formSchema = z.object({
  food_name: z.string().min(1, 'Food Name is required.'),
  food_category: z.enum([
    'Cooked Food',
    'Raw Food',
    'Packed Food',
    'Bakery',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Beverages',
    'Snacks',
    'Desserts',
    'Other',
  ]),
  food_type: z.enum(['VEG', 'NON_VEG', 'VEGAN', 'OTHER']),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.preprocess((val) => Number(val) || 0, z.number().gt(0, 'Quantity must be greater than 0.')),
  quantity_unit: z.string().min(1, 'Quantity unit is required.'),
  number_of_people: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().int().nonnegative().optional().nullable()),
  prepared_at: z.string().min(1, 'Prepared time is required.'),
  expiry_time: z.string().min(1, 'Expiry time is required.'),
  pickup_time: z.string().min(1, 'Pickup time is required.'),
  pickup_address: z.string().min(3, 'Pickup address is required.'),
  pickup_city: z.string().min(2, 'City is required.'),
  pickup_state: z.string().min(2, 'State is required.'),
  pickup_country: z.string().min(2, 'Country is required.'),
  postal_code: z.string().optional().nullable(),
  pickup_latitude: z.number().min(-90).max(90).optional().nullable(),
  pickup_longitude: z.number().min(-180).max(180).optional().nullable(),
  special_instructions: z.string().optional().nullable(),
  pickup_contact_name: z.string().optional().nullable(),
  pickup_contact_phone: z.string().regex(PHONE_REGEX, 'Invalid phone format (e.g. +15550100).').optional().nullable(),
  max_pickup_delay: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().int().nonnegative().optional().nullable()),
}).refine(
  (data) => new Date(data.expiry_time) > new Date(data.prepared_at),
  {
    message: 'Expiry time must be after food prepared time.',
    path: ['expiry_time'],
  }
).refine(
  (data) => new Date(data.pickup_time) < new Date(data.expiry_time),
  {
    message: 'Pickup time must be scheduled before food expiry time.',
    path: ['pickup_time'],
  }
);

/**
 * Reusable Form component for creating or editing donation listings.
 */
export const DonationForm = ({ initialValues, onSubmit, isSubmitting = false }) => {
  const [coords, setCoords] = useState({
    lat: initialValues?.pickup_latitude || 40.7128,
    lng: initialValues?.pickup_longitude || -74.006,
  });

  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      food_name: initialValues?.food_name || '',
      food_category: initialValues?.food_category || 'Cooked Food',
      food_type: initialValues?.food_type || 'VEG',
      description: initialValues?.description || '',
      quantity: initialValues?.quantity || '',
      quantity_unit: initialValues?.quantity_unit || 'kg',
      number_of_people: initialValues?.number_of_people || '',
      prepared_at: formatDateForInput(initialValues?.prepared_at),
      expiry_time: formatDateForInput(initialValues?.expiry_time),
      pickup_time: formatDateForInput(initialValues?.pickup_time),
      pickup_address: initialValues?.pickup_address || '',
      pickup_city: initialValues?.pickup_city || '',
      pickup_state: initialValues?.pickup_state || '',
      pickup_country: initialValues?.pickup_country || '',
      postal_code: initialValues?.postal_code || '',
      pickup_latitude: initialValues?.pickup_latitude || 40.7128,
      pickup_longitude: initialValues?.pickup_longitude || -74.006,
      special_instructions: initialValues?.special_instructions || '',
      pickup_contact_name: initialValues?.pickup_contact_name || '',
      pickup_contact_phone: initialValues?.pickup_contact_phone || '',
      max_pickup_delay: initialValues?.max_pickup_delay || '',
    },
  });

  // Track map changes and update form values
  const handleCoordsChange = (lat, lng) => {
    setCoords({ lat, lng });
    setValue('pickup_latitude', lat);
    setValue('pickup_longitude', lng);
  };

  const handleFormSubmit = (data) => {
    // Convert date inputs to standard ISO strings
    const formatted = {
      ...data,
      prepared_at: new Date(data.prepared_at).toISOString(),
      expiry_time: new Date(data.expiry_time).toISOString(),
      pickup_time: new Date(data.pickup_time).toISOString(),
    };
    onSubmit(formatted);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="w-5 h-5 text-primary" /> Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Food Name */}
          <div>
            <label className="text-sm font-semibold text-foreground">Food Name *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="e.g. Surplus catering dinner"
              {...register('food_name')}
            />
            {errors.food_name && (
              <p className="mt-1 text-xs text-destructive">{errors.food_name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-foreground">Category *</label>
            <select
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('food_category')}
            >
              <option value="Cooked Food">Cooked Food</option>
              <option value="Raw Food">Raw Food</option>
              <option value="Packed Food">Packed Food</option>
              <option value="Bakery">Bakery</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Dairy">Dairy</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Desserts">Desserts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Food Type */}
          <div>
            <label className="text-sm font-semibold text-foreground">Food Type *</label>
            <select
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('food_type')}
            >
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
              <option value="VEGAN">Vegan</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Description *</label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="Provide list of items, ingredients details, or allergies notes..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-semibold text-foreground">Quantity *</label>
            <input
              type="number"
              step="any"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. 5.5"
              {...register('quantity')}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Quantity Unit */}
          <div>
            <label className="text-sm font-semibold text-foreground">Quantity Unit *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. kg, items, boxes"
              {...register('quantity_unit')}
            />
            {errors.quantity_unit && (
              <p className="mt-1 text-xs text-destructive">{errors.quantity_unit.message}</p>
            )}
          </div>

          {/* Servings */}
          <div>
            <label className="text-sm font-semibold text-foreground">Estimated People Served</label>
            <input
              type="number"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. 20"
              {...register('number_of_people')}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <MapPin className="w-5 h-5 text-primary" /> Logistics & Schedule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prepared Time */}
          <div>
            <label className="text-sm font-semibold text-foreground">Prepared Time *</label>
            <input
              type="datetime-local"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('prepared_at')}
            />
            {errors.prepared_at && (
              <p className="mt-1 text-xs text-destructive">{errors.prepared_at.message}</p>
            )}
          </div>

          {/* Expiry Time */}
          <div>
            <label className="text-sm font-semibold text-foreground">Expiry Time *</label>
            <input
              type="datetime-local"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('expiry_time')}
            />
            {errors.expiry_time && (
              <p className="mt-1 text-xs text-destructive">{errors.expiry_time.message}</p>
            )}
          </div>

          {/* Pickup Time */}
          <div>
            <label className="text-sm font-semibold text-foreground">Pickup Schedule Time *</label>
            <input
              type="datetime-local"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('pickup_time')}
            />
            {errors.pickup_time && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_time.message}</p>
            )}
          </div>

          {/* Delay buffer */}
          <div>
            <label className="text-sm font-semibold text-foreground">Max Pickup Delay (Minutes)</label>
            <input
              type="number"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. 30"
              {...register('max_pickup_delay')}
            />
          </div>

          {/* Pickup Address */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Pickup Address *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="Street Address"
              {...register('pickup_address')}
            />
            {errors.pickup_address && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_address.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-foreground">City *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('pickup_city')}
            />
            {errors.pickup_city && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-semibold text-foreground">State *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('pickup_state')}
            />
            {errors.pickup_state && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_state.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold text-foreground">Country *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('pickup_country')}
            />
            {errors.pickup_country && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_country.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="text-sm font-semibold text-foreground">Postal Code</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              {...register('postal_code')}
            />
          </div>

          {/* Leaflet picker map */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-foreground">Choose Location on Map</label>
            <LocationPickerMap
              latitude={coords.lat}
              longitude={coords.lng}
              onChange={handleCoordsChange}
              readOnly={isSubmitting}
            />
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span>Lat: {coords.lat.toFixed(6)}</span>
              <span>Lng: {coords.lng.toFixed(6)}</span>
            </div>
          </div>

          {/* Contact Person Name */}
          <div>
            <label className="text-sm font-semibold text-foreground">Contact Person Name</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="John Doe"
              {...register('pickup_contact_name')}
            />
          </div>

          {/* Contact Person Phone */}
          <div>
            <label className="text-sm font-semibold text-foreground">Contact Person Phone</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="+15550999"
              {...register('pickup_contact_phone')}
            />
            {errors.pickup_contact_phone && (
              <p className="mt-1 text-xs text-destructive">{errors.pickup_contact_phone.message}</p>
            )}
          </div>

          {/* Special Instructions */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Special Instructions</label>
            <textarea
              rows={2}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
              placeholder="e.g. Ring buzzer 4, knock loudly..."
              {...register('special_instructions')}
            />
          </div>
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving Listing
            </span>
          ) : (
            'Save Donation'
          )}
        </button>
      </div>

    </form>
  );
};

export default DonationForm;
