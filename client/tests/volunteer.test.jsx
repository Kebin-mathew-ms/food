import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignaturePad from '../src/components/volunteer/SignaturePad.jsx';
import DeliveryTimeline from '../src/components/volunteer/DeliveryTimeline.jsx';
import DistanceBadge from '../src/components/ngo/DistanceBadge.jsx';

// Mock Leaflet and React-Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div />,
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
      latLngBounds: vi.fn().mockReturnValue({}),
    },
  };
});

describe('SignaturePad Component', () => {
  it('renders canvas signature details correctly', () => {
    const handleSave = vi.fn();
    render(<SignaturePad onSave={handleSave} />);
    expect(screen.getByText('Recipient Signature Canvas')).toBeDefined();
  });
});

describe('DeliveryTimeline Component', () => {
  it('renders all stage node steps correctly', () => {
    render(<DeliveryTimeline currentStatus="PICKED_UP" />);
    expect(screen.getByText('Delivery Progress Timeline')).toBeDefined();
  });
});

describe('DistanceBadge Component', () => {
  it('renders operating distance correctly', () => {
    render(<DistanceBadge distance={15.4} />);
    expect(screen.getByText('15.4 km away')).toBeDefined();
  });
});
