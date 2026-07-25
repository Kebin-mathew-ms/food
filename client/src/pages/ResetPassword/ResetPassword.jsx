import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService.js';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match.',
  path: ['confirm_password'],
});

/**
 * ResetPassword token execution view.
 */
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm_password: '' },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from path.');
      return;
    }

    try {
      await apiService.post('/auth/reset-password', {
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      toast.success('Password reset completed successfully. Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Password reset request failed.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                disabled={isSubmitting}
                className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                  errors.password ? 'border-destructive focus:ring-destructive' : 'border-input'
                }`}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                disabled={isSubmitting}
                className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                  errors.confirm_password ? 'border-destructive focus:ring-destructive' : 'border-input'
                }`}
                placeholder="••••••••"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="group relative flex w-full justify-center rounded-md bg-primary py-2 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
