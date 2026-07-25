import React from 'react';

/**
 * Global Footer component.
 */
export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Food Waste Redistribution Platform. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#terms"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#privacy"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#support"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Platform Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
