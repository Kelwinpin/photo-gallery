import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { photoService } from '../../services/photoService';
import { useNavigation } from '@react-navigation/native';
import CameraScreen from '.';
import { cleanup } from '@testing-library/react-native';

// Mocks
jest.mock('expo-camera', () => ({
    CameraView: 'CameraView',
    CameraType: {
        back: 'back',
        front: 'front',
    },
    useCameraPermissions: jest.fn(),
}));

afterEach(cleanup);

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../../services/photoService', () => ({
    photoService: {
        savePhoto: jest.fn(),
    },
}));

jest.mock('../../components/Button', () => ({
    Button: 'Button',
}));

jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isTablet: false,
        isSmallScreen: false,
        isLargeTablet: false,
        isExtraLarge: false,
    })),
}));

// Spy no Alert
jest.spyOn(Alert, 'alert');

describe('CameraScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
    };

    const mockLocationObject = {
        coords: {
            latitude: -19.9191,
            longitude: -43.9386,
        },
        timestamp: Date.now(),
    };

    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigation as jest.Mock).mockReturnValue(mockNavigation);

        // Reset all mocks to default state
        mockUseCameraPermissions.mockReturnValue([
            { granted: true },
            jest.fn(),
        ]);
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'granted',
        });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocationObject);
        (photoService.savePhoto as jest.Mock).mockResolvedValue(true);
    });

    describe('Loading States', () => {
        it('should show loading screen while checking permissions and location', async () => {
            mockUseCameraPermissions.mockReturnValue([null, jest.fn()]);
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocationObject);

            const { getByText } = render(<CameraScreen />);

            expect(getByText('Carregando câmera...')).toBeTruthy();
        });
    });

    describe('Permissions', () => {
        it('should show permission request screen when camera permission is not granted', async () => {
            mockUseCameraPermissions.mockReturnValue([
                { granted: false },
                jest.fn(),
            ]);

            const { getByText } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByText('Precisamos de permissão para usar a câmera')).toBeTruthy();
            });
        });
    });

    describe('Location Services', () => {
        it('should show GPS Active when location is available', async () => {
            const { getByText } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByText('GPS Ativo')).toBeTruthy();
            });
        });

        it('should show GPS Inactive when location permission is denied', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const { getByText } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByText('GPS Inativo')).toBeTruthy();
            });
        });

        it('should show GPS Inactive when location request fails', async () => {
            (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
                new Error('Location error')
            );

            const { getByText } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByText('GPS Inativo')).toBeTruthy();
            });
        });
    });

    describe('Camera Functionality', () => {
        it('should render camera controls when permissions are granted', async () => {
            const { getByTestId } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByTestId('camera-button-save')).toBeTruthy();
                expect(getByTestId('camera-button-close')).toBeTruthy();
            });
        });

        it('should navigate back when close button is pressed', async () => {
            const { getByTestId } = render(<CameraScreen />);

            await waitFor(() => {
                const closeButton = getByTestId('camera-button-close');
                fireEvent.press(closeButton);
            });

            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    describe('Responsive Design', () => {
        it('should handle different screen sizes', async () => {
            const mockUseResponsiveDimensions = require('../../utils/hooks/useResponsiveDimensions').default;

            mockUseResponsiveDimensions.mockReturnValue({
                isTablet: true,
                isSmallScreen: false,
                isLargeTablet: false,
                isExtraLarge: false,
            });

            const { getByTestId } = render(<CameraScreen />);

            await waitFor(() => {
                expect(getByTestId('camera-button-save')).toBeTruthy();
            });
        });
    });
});