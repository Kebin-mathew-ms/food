import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService.js';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

/**
 * ForgotPassword view request page.
 */
export const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await apiService.post('/auth/forgot-password', data);
      toast.success('If the email exists, a password reset link has been dispatched.');
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to dispatch reset request.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email-address" className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              disabled={isSubmitting}
              className={`mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${
                errors.email ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
              placeholder="name@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md bg-primary py-2 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
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

export default ForgotPassword;
