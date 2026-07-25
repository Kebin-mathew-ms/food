import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import apiService from '../../services/apiService.js';

/**
 * VerifyEmail verification activation callback view.
 */
export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Activation token is missing from URL parameters.');
        return;
      }

      try {
        await apiService.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Your email address has been verified successfully. Your account is active.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The token may be invalid or has expired.');
      }
    };

    activateEmail();
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-xl shadow-lg text-center">
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Verifying Email...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we activate your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            <h2 className="text-3xl font-extrabold text-foreground">Verification Successful</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h2 className="text-3xl font-extrabold text-foreground">Verification Failed</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold border border-input bg-background text-foreground hover:bg-accent transition-all"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
