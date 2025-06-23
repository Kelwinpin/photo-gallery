import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import PhotoDetails from '.';
import { photoService } from '../../services/photoService';

jest.mock('../../services/photoService');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            goBack: jest.fn(),
        }),
    };
});
jest.spyOn(Alert, 'alert');
jest.spyOn(Share, 'share');

const mockPhoto = {
    id: '123',
    uri: 'https://example.com/photo.jpg',
    timestamp: '2023-10-10T12:00:00Z',
    location: { latitude: -23.5505, longitude: -46.6333 },
};

describe('PhotoDetails screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render loading state initially', () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(mockPhoto);

        const { getByText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: '123' } }} />
            </NavigationContainer>
        );

        expect(getByText('Carregando foto...')).toBeTruthy();
    });

    it('should render photo after loading', async () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(mockPhoto);

        const { getByLabelText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: '123' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByLabelText('image')).toBeTruthy();
        });
    });

    it('should show error message if photo not found', async () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(null);

        const { getByText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: 'invalid' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Foto não encontrada')).toBeTruthy();
        });
    });

    it('should call delete confirmation dialog', async () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(mockPhoto);
        (photoService.deletePhoto as jest.Mock).mockResolvedValueOnce(true);

        const { getByLabelText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: '123' } }} />
            </NavigationContainer>
        );

        await waitFor(() => getByLabelText('delete'));

        const deleteButton = getByLabelText('delete');
        fireEvent.press(deleteButton);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir esta foto?',
            expect.any(Array)
        );
    });

    it('should trigger share functionality', async () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(mockPhoto);

        const { getByLabelText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: '123' } }} />
            </NavigationContainer>
        );

        await waitFor(() => getByLabelText('share'));

        const shareButton = getByLabelText('share');
        fireEvent.press(shareButton);

        await waitFor(() => {
            expect(Share.share).toHaveBeenCalled();
        });
    });

    it('should toggle panel on info button press', async () => {
        (photoService.getPhotoById as jest.Mock).mockResolvedValueOnce(mockPhoto);

        const { getByLabelText } = render(
            <NavigationContainer>
                <PhotoDetails route={{ params: { id: '123' } }} />
            </NavigationContainer>
        );

        const infoButton = await waitFor(() => getByLabelText('toggle-info'));

        act(() => {
            fireEvent.press(infoButton);
        });
    });
});
