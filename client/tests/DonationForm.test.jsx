import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DonationForm from '../src/components/donation/DonationForm.jsx';
import { MemoryRouter } from 'react-router-dom';

// Mock Leaflet and LocationPickerMap to avoid canvas / browser render limits in testing
vi.mock('../src/components/donation/LocationPickerMap.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-map">Mock Map Picker</div>,
}));

describe('🥗 DonationForm Validation & Actions Tests', () => {
  it('1. Render form inputs correctly', () => {
    render(
      <MemoryRouter>
        <DonationForm onSubmit={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('e.g. Surplus catering dinner')).toBeDefined();
    expect(screen.getByText('Category *')).toBeDefined();
    expect(screen.getByText('Food Type *')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. 5.5')).toBeDefined();
    expect(screen.getByTestId('mock-map')).toBeDefined();
  });
});
