import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Photo } from '../../services/photoService';
import PhotoDetailsPanel from '.';

jest.mock('../../utils/fomatDate', () => ({
  formatDate: jest.fn((date) => `Formatted Date ${date.toISOString()}`),
}));

jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
  __esModule: true,
  default: () => ({
    isTablet: false,
    isLandscape: false,
    isSmallScreen: false,
    isLargeTablet: false,
  }),
}));

describe('PhotoDetailsPanel Component', () => {
  const mockClosePanel = jest.fn();

  const mockPhoto: Photo = {
      id: '1',
      uri: 'file://photo.jpg',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      location: {
          latitude: -23.5505,
          longitude: -46.6333,
      },
      filename: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render panel title and close button', () => {
    render(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    expect(screen.getByText('Detalhes da Foto')).toBeTruthy();
    expect(screen.getByTestId('close-button')).toBeTruthy();
  });

  it('should call closePanel when close button is pressed', () => {
    render(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    fireEvent.press(screen.getByTestId('close-button'));
    expect(mockClosePanel).toHaveBeenCalled();
  });

  it('should format date using formatDate utility', () => {
    const mockFormatDate = require('../../utils/fomatDate').formatDate;

    render(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);
    expect(screen.getByText(`Formatted Date ${mockPhoto.timestamp.toISOString()}`)).toBeTruthy();
    expect(mockFormatDate).toHaveBeenCalledWith(mockPhoto.timestamp);
  });

  it('should display latitude and longitude correctly', () => {
    render(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    expect(screen.getByText(mockPhoto.location.latitude.toFixed(6))).toBeTruthy();
    expect(screen.getByText(mockPhoto.location.longitude.toFixed(6))).toBeTruthy();
  });

  it('should render section titles with icons', () => {
    render(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    expect(screen.getByTestId('icon-time-outline')).toBeTruthy();
    expect(screen.getByTestId('icon-location-outline')).toBeTruthy();
  });

  it('should apply correct layout for small screens', () => {
    jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
      __esModule: true,
      default: () => ({
        isTablet: false,
        isLandscape: false,
        isSmallScreen: true,
        isLargeTablet: false,
      }),
    }));

    const { rerender } = render(
      <PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />
    );

    rerender(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    const coordinateItems = screen.getAllByTestId('coordinate-item');
    expect(coordinateItems[0].props.style).toMatchObject([{"backgroundColor": "#f8f9fa"}, {"borderRadius": 16, "flex": 1, "justifyContent": "center", "minHeight": 70, "padding": 18}])
  });

  it('should have column layout for coordinates on small screen or landscape tablet', () => {
    jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
      __esModule: true,
      default: () => ({
        isTablet: true,
        isLandscape: true,
        isSmallScreen: false,
        isLargeTablet: false,
      }),
    }));

    const { rerender } = render(
      <PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />
    );

    rerender(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    const coordinatesDetails = screen.getByTestId('coordinates-details');
    expect(coordinatesDetails.props.style).toMatchObject([{"justifyContent": "space-between"}, {"flexDirection": "row", "gap": 12, "marginLeft": 12}])
  });

  it('should have responsive font sizes based on device type', () => {
    jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
      __esModule: true,
      default: () => ({
        isTablet: true,
        isLandscape: false,
        isSmallScreen: false,
        isLargeTablet: true,
      }),
    }));

    const { rerender } = render(
      <PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />
    );

    rerender(<PhotoDetailsPanel photo={mockPhoto} closePanel={mockClosePanel} />);

    const title = screen.getByText('Detalhes da Foto');
    expect(title.props.style).toMatchObject([{"color": "#333", "fontWeight": "700"}, {"fontSize": 24, "marginBottom": 24}])
  });
});