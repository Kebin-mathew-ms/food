import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CountdownTimer from '../src/components/donation/CountdownTimer.jsx';

describe('⏰ CountdownTimer Interval and Expiry Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Render correct time remaining countdown state', () => {
    const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
    render(<CountdownTimer expiryTime={futureTime} />);

    // Verify time state contains hours remaining
    expect(screen.getByText(/2h/)).toBeDefined();
  });

  it('2. Fire expiration callback when listing time expires', () => {
    const expiredTime = new Date(Date.now() - 5000).toISOString(); // already expired
    const mockExpireCallback = vi.fn();

    render(<CountdownTimer expiryTime={expiredTime} onExpire={mockExpireCallback} />);

    expect(screen.getByText('Expired')).toBeDefined();
    expect(mockExpireCallback).toHaveBeenCalled();
  });
});
