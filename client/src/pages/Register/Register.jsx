import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const passwordPolicyMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

const registerFormSchema = z.object({
  full_name: z.string().min(2, 'Name must contain at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[\s-]/g, '') : val),
    z.string().regex(PHONE_REGEX, 'Please enter a valid phone number (E.164 format).')
  ),
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER']),
  password: z.string().regex(PASSWORD_REGEX, passwordPolicyMessage),
  confirm_password: z.string(),
  address: z.preprocess((val) => (val === '' ? undefined : val), z.string().min(3, 'Address must contain at least 3 characters.').optional()),
  city: z.preprocess((val) => (val === '' ? undefined : val), z.string().min(2, 'City must contain at least 2 characters.').optional()),
  state: z.preprocess((val) => (val === '' ? undefined : val), z.string().min(2, 'State must contain at least 2 characters.').optional()),
  country: z.preprocess((val) => (val === '' ? undefined : val), z.string().min(2, 'Country must contain at least 2 characters.').optional()),
  latitude: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match.',
  path: ['confirm_password'],
});

/**
 * User Registration Page.
 */
export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      role: 'DONOR',
      password: '',
      confirm_password: '',
      address: '',
      city: '',
      state: '',
      country: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (err) {
      // Error notifications handled by AuthContext toast
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-start justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Food Waste Redistribution Platform.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="John Doe"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <input
                type="email"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="john@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-foreground">Phone Number</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="+15550100"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-foreground">Register as</label>
              <select
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                {...register('role')}
              >
                <option value="DONOR">Food Donor</option>
                <option value="NGO">NGO / Charity Partner</option>
                <option value="VOLUNTEER">Volunteer Courier</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-foreground">Password</label>
              <input
                type="password"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-foreground">Confirm Password</label>
              <input
                type="password"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="••••••••"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Address</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="123 Street Name"
                {...register('address')}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-semibold text-foreground">City</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="City"
                {...register('city')}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-semibold text-foreground">Country</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Country"
                {...register('country')}
              />
              {errors.country && (
                <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
              )}
            </div>

            {/* Latitude */}
            <div>
              <label className="text-sm font-semibold text-foreground">Latitude</label>
              <input
                type="number"
                step="any"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="40.7128"
                {...register('latitude')}
              />
              {errors.latitude && (
                <p className="mt-1 text-xs text-destructive">{errors.latitude.message}</p>
              )}
            </div>

            {/* Longitude */}
            <div>
              <label className="text-sm font-semibold text-foreground">Longitude</label>
              <input
                type="number"
                step="any"
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="-74.0060"
                {...register('longitude')}
              />
              {errors.longitude && (
                <p className="mt-1 text-xs text-destructive">{errors.longitude.message}</p>
              )}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md bg-primary py-2 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
