import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/index.css';

/**
 * Main application Entry Component.
 */
export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          {/* Dynamic Route Handler */}
          <AppRoutes />
          
          {/* Global Toast Notification Toaster */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }} 
          />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
