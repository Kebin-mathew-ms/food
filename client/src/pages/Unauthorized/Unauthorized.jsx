import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Unauthorized Access display view.
 */
export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Access Denied
        </h1>
        <p className="text-base text-muted-foreground">
          You do not have the required permissions or role validation to access this page. Please contact your system administrator.
        </p>
        <div className="pt-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Go back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
