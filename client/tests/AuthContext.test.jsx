import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx';
import { MemoryRouter } from 'react-router-dom';

// Simple consumer component to expose context values during tests
const DummyConsumer = () => {
  const { isAuthenticated, loading } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'guest'}</span>
      <span data-testid="loading-status">{loading ? 'loading' : 'done'}</span>
    </div>
  );
};

describe('🧪 Client-Side Auth Context Unit Tests', () => {
  it('1. Throw exception when useAuth hook is consumed outside AuthProvider wrapper', () => {
    // Suppress console error output for expected exception logs
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<DummyConsumer />)).toThrow(
      'useAuth must be consumed within an AuthProvider wrapper.'
    );

    spy.mockRestore();
  });

  it('2. Render children and export default auth state properties', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <DummyConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    // Initial state check without active session should resolve to guest and done loading
    expect(screen.getByTestId('auth-status').textContent).toBe('guest');
    expect(screen.getByTestId('loading-status').textContent).toBe('done');
  });
});
