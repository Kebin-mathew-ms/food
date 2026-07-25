import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Key, Upload, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordPolicyMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Name must contain at least 2 characters.'),
  phone: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[\s-]/g, '') : val),
    z.string().regex(PHONE_REGEX, 'Please enter a valid phone number (E.164 format).')
  ),
  address: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(3, 'Address must contain at least 3 characters.').optional()),
  city: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(2, 'City must contain at least 2 characters.').optional()),
  state: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(2, 'State must contain at least 2 characters.').optional()),
  country: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(2, 'Country must contain at least 2 characters.').optional()),
  latitude: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
});

const passwordFormSchema = z.object({
  current_password: z.string().min(1, 'Current password is required.'),
  new_password: z.string().regex(PASSWORD_REGEX, passwordPolicyMessage),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match.',
  path: ['confirm_password'],
}).refine((data) => data.current_password !== data.new_password, {
  message: 'New password cannot be identical to current password.',
  path: ['new_password'],
});

/**
 * User Profile Management Dashboard view.
 */
export const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_image || '');
  const [selectedFile, setSelectedFile] = useState(null);

  // Profile fields form resolver
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || '',
      latitude: user?.latitude || undefined,
      longitude: user?.longitude || undefined,
    },
  });

  // Password fields form resolver
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed.');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }
      await updateProfile(formData);
      setSelectedFile(null);
    } catch (err) {
      // Error notifications handled by AuthContext toast
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      resetPasswordForm();
    } catch (err) {
      // Error notifications handled by AuthContext toast
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details, physical address, and password settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar Card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center flex flex-col items-center">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 bg-background mb-4">
            {avatarPreview ? (
              <img
                src={avatarPreview.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/..${avatarPreview}` : avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/40 bg-primary/5">
                <User className="w-12 h-12" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onAvatarChange}
          />
          <h3 className="text-lg font-bold text-foreground">{user?.full_name}</h3>
          <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
            {user?.role}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">
            Click photo to upload avatar. JPEG, PNG, or WEBP (Max 5MB).
          </p>
        </div>

        {/* Right Side: Tab Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form Card */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <User className="w-5 h-5 text-primary" /> Profile Information
            </h2>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('full_name')}
                  />
                  {profileErrors.full_name && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.full_name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Phone Number</label>
                  <input
                    type="text"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('phone')}
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.phone.message}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-muted-foreground">Email Address (Cannot change)</label>
                  <input
                    type="email"
                    disabled
                    className="mt-1 block w-full rounded-md border border-input bg-accent px-3 py-2 text-muted-foreground sm:text-sm cursor-not-allowed"
                    defaultValue={user?.email || ''}
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-foreground">Address</label>
                  <input
                    type="text"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('address')}
                  />
                  {profileErrors.address && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.address.message}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-semibold text-foreground">City</label>
                  <input
                    type="text"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('city')}
                  />
                  {profileErrors.city && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.city.message}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Country</label>
                  <input
                    type="text"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('country')}
                  />
                  {profileErrors.country && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.country.message}</p>
                  )}
                </div>

                {/* Latitude */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('latitude')}
                  />
                  {profileErrors.latitude && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.latitude.message}</p>
                  )}
                </div>

                {/* Longitude */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    disabled={isProfileSubmitting}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    {...registerProfile('longitude')}
                  />
                  {profileErrors.longitude && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.longitude.message}</p>
                  )}
                </div>

              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
                >
                  {isProfileSubmitting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Key className="w-5 h-5 text-primary" /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Current Password</label>
                  <input
                    type="password"
                    disabled={isPasswordSubmitting}
                    className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                      passwordErrors.current_password ? 'border-destructive focus:ring-destructive' : 'border-input'
                    }`}
                    placeholder="••••••••"
                    {...registerPassword('current_password')}
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-xs text-destructive">{passwordErrors.current_password.message}</p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <input
                    type="password"
                    disabled={isPasswordSubmitting}
                    className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                      passwordErrors.new_password ? 'border-destructive focus:ring-destructive' : 'border-input'
                    }`}
                    placeholder="••••••••"
                    {...registerPassword('new_password')}
                  />
                  {passwordErrors.new_password && (
                    <p className="mt-1 text-xs text-destructive">{passwordErrors.new_password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    disabled={isPasswordSubmitting}
                    className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                      passwordErrors.confirm_password ? 'border-destructive focus:ring-destructive' : 'border-input'
                    }`}
                    placeholder="••••••••"
                    {...registerPassword('confirm_password')}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="mt-1 text-xs text-destructive">{passwordErrors.confirm_password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
                >
                  {isPasswordSubmitting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Changing Password
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
