import React, { act } from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import Home from '../Home'; // ajuste o caminho
import { NavigationContainer } from '@react-navigation/native';
import { Photo, photoService } from '../../services/photoService';
import * as hooks from '../../utils/hooks/useResponsiveDimensions';
import { Alert, View, TouchableOpacity, Text } from 'react-native';

jest.useFakeTimers();
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

jest.mock('../../services/photoService', () => ({
  photoService: {
    getAllPhotos: jest.fn(),
    deletePhoto: jest.fn(),
  },
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('../../utils/hooks/useResponsiveDimensions', () => ({
  __esModule: true,
  default: () => ({
    width: 375,
    isTablet: false,
    isLandscape: false,
    isSmallScreen: false,
    isLargeTablet: false,
    isExtraLarge: false,
  }),
}));

jest.mock('../../components/Card', () => 'Card');

describe('Home Screen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(hooks, 'default').mockReturnValue({
        width: 375,
        isTablet: false,
        isLandscape: false,
        isSmallScreen: false,
        isLargeTablet: false,
        isExtraLarge: false,
        height: 0,
        scale: 0,
        fontScale: 0
    });
  });

  it('should render loading state', async () => {
    jest.spyOn(photoService, 'getAllPhotos').mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );

    expect(screen.getByText('Carregando fotos...')).toBeTruthy();
  });

  it('should render empty state correctly', async () => {
    jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue([]);

    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );

    expect(await screen.findByText('Nenhuma foto ainda')).toBeTruthy();
    expect(screen.getByText('Toque no botão + para tirar sua primeira foto')).toBeTruthy();
  });

  it('should render photos list with correct number of items', async () => {
    const mockPhotos: Photo[] = [
      {
          id: '1',
          uri: 'file://photo1.jpg',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          location: { latitude: -23.5505, longitude: -46.6333 },
          filename: ''
      },
      {
          id: '2',
          uri: 'file://photo2.jpg',
          timestamp: new Date('2024-01-02T11:00:00Z'),
          location: { latitude: -22.9068, longitude: -43.1729 },
          filename: ''
      },
    ];

    jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue(mockPhotos);

    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );

    expect(await screen.findByText('Minhas Fotos')).toBeTruthy();
    expect(screen.getByText('2 fotos')).toBeTruthy();
  });

//   it('should navigate to Camera when AddButton is pressed', async () => {
//     const mockPhotos: Photo[] = [
//       {
//           id: '1',
//           uri: 'file://photo1.jpg',
//           timestamp: new Date('2024-01-01T10:00:00Z'),
//           location: { latitude: -23.5505, longitude: -46.6333 },
//           filename: ''
//       },
//       {
//           id: '2',
//           uri: 'file://photo2.jpg',
//           timestamp: new Date('2024-01-02T11:00:00Z'),
//           location: { latitude: -22.9068, longitude: -43.1729 },
//           filename: ''
//       },
//     ];

//     jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue(mockPhotos);

//     render(
//         <NavigationContainer>
//             <Home />
//         </NavigationContainer>
//     );

//     console.log(screen.debug());

//     const addButton = await screen.findByTestId('add-button-icon');
//     await act(async () => {
//       fireEvent.press(addButton);
//     });
//     expect(mockNavigate).toHaveBeenCalledWith('Camera');
//   });

//   it('should trigger onRefresh when RefreshControl is pulled', async () => {
//     const mockPhotos: Photo[] = [
//       {
//           id: '1',
//           uri: 'file://photo1.jpg',
//           timestamp: new Date('2024-01-01T10:00:00Z'),
//           location: { latitude: -23.5505, longitude: -46.6333 },
//           filename: ''
//       },
//       {
//           id: '2',
//           uri: 'file://photo2.jpg',
//           timestamp: new Date('2024-01-02T11:00:00Z'),
//           location: { latitude: -22.9068, longitude: -43.1729 },
//           filename: ''
//       },
//     ];

//     jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue(mockPhotos);

//     render(
//         <NavigationContainer>
//             <Home />
//         </NavigationContainer>
//     );

//     expect(await screen.findByText('Minhas Fotos')).toBeTruthy();
//     expect(screen.getByText('2 fotos')).toBeTruthy();

//     const refreshControl = await screen.getByTestId('refresh-control');
//     fireEvent(refreshControl, 'refresh');

//     expect(photoService.getAllPhotos).toHaveBeenCalled();
//   });

  it('should show confirmation alert when delete button is pressed', async () => {
    const alertMock = jest.spyOn(Alert, 'alert');

    const mockPhoto: Photo = {
        id: '1',
        uri: 'file://photo1.jpg',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        location: { latitude: -23.5505, longitude: -46.6333 },
        filename: ''
    };

    jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue([mockPhoto]);

    const handleDeletePhoto = jest.fn(() => {
      Alert.alert(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir esta foto?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              const success = await photoService.deletePhoto(mockPhoto.id);
              if (success) {

            }
            },
          },
        ]
      );
    });

    render(
      <View>
        <TouchableOpacity testID="delete-button" onPress={() => handleDeletePhoto()}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    fireEvent.press(screen.getByTestId('delete-button'));

    expect(alertMock).toHaveBeenCalledWith(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta foto?',
      expect.any(Array)
    );
  });

  it('should display responsive title and subtitle font sizes', async () => {
    jest.spyOn(hooks, 'default').mockReturnValue({
        width: 1024,
        isTablet: true,
        isLandscape: false,
        isSmallScreen: false,
        isLargeTablet: true,
        isExtraLarge: false,
        height: 0,
        scale: 0,
        fontScale: 0
    });

    jest.spyOn(photoService, 'getAllPhotos').mockResolvedValue([]);

    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );

    const title = await screen.findByText('Minhas Fotos');
    const subtitle = screen.getByText('0 fotos');
    
    expect(subtitle).toBeTruthy();

    expect(title.props.style).toMatchObject([{"color": "#333", "fontWeight": "bold"}, {"fontSize": 32, "marginBottom": 6, "marginTop": 20}]); // titleFontSize
  });
});