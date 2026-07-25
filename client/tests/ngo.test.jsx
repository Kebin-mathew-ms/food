import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DistanceBadge from '../src/components/ngo/DistanceBadge.jsx';
import FeedbackForm from '../src/components/ngo/FeedbackForm.jsx';
import NGOProfileForm from '../src/components/ngo/NGOProfileForm.jsx';

// Mock Leaflet and React-Leaflet to prevent headless browser errors
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ setView: vi.fn(), getZoom: vi.fn().mockReturnValue(13) }),
  useMapEvents: vi.fn(),
}));

vi.mock('leaflet', () => {
  const mockIcon = vi.fn().mockImplementation(() => ({}));
  const mockMerge = vi.fn();
  
  const DefaultClass = function() {};
  DefaultClass.prototype = {};
  DefaultClass.mergeOptions = mockMerge;
  mockIcon.Default = DefaultClass;

  return {
    default: {
      icon: mockIcon,
      Icon: mockIcon,
      Marker: {
        prototype: {
          options: {
            icon: {},
          },
        },
      },
    },
  };
});

describe('DistanceBadge Component', () => {
  it('renders nothing when distance is undefined', () => {
    const { container } = render(<DistanceBadge distance={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders distance value correct format', () => {
    render(<DistanceBadge distance={12.6} />);
    expect(screen.getByText('12.6 km away')).toBeDefined();
  });
});

describe('FeedbackForm Component', () => {
  it('submits rating values correctly', async () => {
    const handleSubmit = vi.fn();
    render(<FeedbackForm onSubmit={handleSubmit} />);

    // Type comment
    const textarea = screen.getByPlaceholderText(/Share details on volunteer friendliness/i);
    fireEvent.change(textarea, { target: { value: 'Delivered quickly and safely' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith({
      rating: 5,
      packaging_quality: 'GOOD',
      delivery_timeliness: 'ON_TIME',
      volunteer_coordination: 'EXCELLENT',
      comments: 'Delivered quickly and safely',
    });
  });
});

describe('NGOProfileForm Component', () => {
  it('renders locked warning when NGO status is VERIFIED', () => {
    render(
      <NGOProfileForm
        initialValues={{ organization_name: 'Hope Kitchen' }}
        onSubmit={vi.fn()}
        status="VERIFIED"
      />
    );
    expect(screen.getByText('Profile Details Locked')).toBeDefined();
  });
});
