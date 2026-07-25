import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProtectedRoute from '../src/routes/ProtectedRoute.jsx';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthContext from '../src/context/AuthContext.jsx';

// Helper to render ProtectedRoute with custom mock auth states
const renderWithAuthContext = (routeChildren, authState, initialEntries = ['/protected']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={authState}>
        <Routes>
          <Route path="/login" element={<span data-testid="login-view">login page</span>} />
          <Route path="/unauthorized" element={<span data-testid="unauth-view">unauthorized page</span>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute allowedRoles={routeChildren.props.allowedRoles}>
                {routeChildren}
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('🔒 ProtectedRoute Component Security Guards', () => {
  it('1. Display loading spinner fallback when auth state is loading', () => {
    const authState = { user: null, isAuthenticated: false, loading: true };
    renderWithAuthContext(<div data-testid="secret-content">Secret Content</div>, authState);

    expect(screen.queryByTestId('secret-content')).toBeNull();
  });

  it('2. Redirect unauthenticated requests to login page', () => {
    const authState = { user: null, isAuthenticated: false, loading: false };
    renderWithAuthContext(<div data-testid="secret-content">Secret Content</div>, authState);

    expect(screen.queryByTestId('secret-content')).toBeNull();
    expect(screen.getByTestId('login-view').textContent).toBe('login page');
  });

  it('3. Authorize and render contents when authenticated', () => {
    const authState = { user: { id: '1', role: 'DONOR' }, isAuthenticated: true, loading: false };
    renderWithAuthContext(<div data-testid="secret-content">Secret Content</div>, authState);

    expect(screen.getByTestId('secret-content').textContent).toBe('Secret Content');
  });

  it('4. Redirect to /unauthorized when user role is unauthorized', () => {
    const authState = { user: { id: '2', role: 'DONOR' }, isAuthenticated: true, loading: false };
    // Request requires NGO role
    renderWithAuthContext(
      <div data-testid="secret-content" allowedRoles={['NGO']}>
        NGO Area
      </div>,
      authState
    );

    expect(screen.queryByTestId('secret-content')).toBeNull();
    expect(screen.getByTestId('unauth-view').textContent).toBe('unauthorized page');
  });
});
