import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Button } from '../../components/Button';
import { photoService } from '../../services/photoService';
import useResponsiveDimensions from '../../utils/hooks/useResponsiveDimensions';

const getResponsiveValues = (dimensions: ReturnType<typeof useResponsiveDimensions>) => {
  const { isTablet, isSmallScreen, isLargeTablet, isExtraLarge } = dimensions;
  
  const iconSize = isExtraLarge ? 60 : isLargeTablet ? 56 : isTablet ? 52 : isSmallScreen ? 40 : 48;
  const closeIconSize = isExtraLarge ? 50 : isLargeTablet ? 46 : isTablet ? 42 : isSmallScreen ? 32 : 40;
  const locationIconSize = isExtraLarge ? 24 : isLargeTablet ? 22 : isTablet ? 20 : isSmallScreen ? 16 : 20;
  
  const loadingFontSize = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  const messageFontSize = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  const locationFontSize = isExtraLarge ? 16 : isLargeTablet ? 14 : isTablet ? 13 : isSmallScreen ? 10 : 12;
  
  const buttonGap = isExtraLarge ? 60 : isLargeTablet ? 50 : isTablet ? 45 : isSmallScreen ? 30 : 40;
  const buttonContainerPadding = isExtraLarge ? 80 : isLargeTablet ? 72 : isTablet ? 68 : isSmallScreen ? 48 : 64;
  const closeButtonPadding = isExtraLarge ? 6 : isLargeTablet ? 4 : isTablet ? 3 : isSmallScreen ? 2 : 2;
  const closeButtonRadius = isExtraLarge ? 40 : isLargeTablet ? 36 : isTablet ? 34 : isSmallScreen ? 26 : 32;
  
  const locationTop = isTablet ? 60 : isSmallScreen ? 40 : 50;
  const locationRight = isExtraLarge ? 30 : isLargeTablet ? 25 : isTablet ? 22 : isSmallScreen ? 15 : 20;
  const locationPadding = isExtraLarge ? 12 : isLargeTablet ? 10 : isTablet ? 9 : isSmallScreen ? 6 : 8;
  const locationRadius = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 12 : 16;
  
  const messagePadding = isExtraLarge ? 30 : isLargeTablet ? 25 : isTablet ? 20 : isSmallScreen ? 12 : 16;
  
  return {
    iconSize,
    closeIconSize,
    locationIconSize,
    loadingFontSize,
    messageFontSize,
    locationFontSize,
    buttonGap,
    buttonContainerPadding,
    closeButtonPadding,
    closeButtonRadius,
    locationTop,
    locationRight,
    locationPadding,
    locationRadius,
    messagePadding,
  };
};

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const cameraRef = useRef<CameraView>(null);
  const navigate = useNavigation();
  const dimensions = useResponsiveDimensions();
  const responsiveValues = getResponsiveValues(dimensions);

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setErrorMsg('Erro ao obter localização');
      } finally {
        setIsLoading(false);
      }
    }

    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (permission !== null) {
      if (!isLoading || location !== null || errorMsg !== null) {
        setIsLoading(false);
      }
    }
  }, [permission, location, errorMsg, isLoading]);

  const saveImage = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    if (!location) {
      Alert.alert('Erro', 'Localização não disponível. Tente novamente.');
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Falha ao capturar a foto');
      }

      const savedPhoto = await photoService.savePhoto(
        photo.uri,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      );

      if (savedPhoto) {
        Alert.alert(
          'Sucesso!', 
          'Foto salva com sucesso!', 
          [
            {
              text: 'OK',
              onPress: () => navigate.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha ao salvar a foto. Tente novamente.');
      }

    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Falha ao salvar a foto. Tente novamente.');
    } finally {
      setIsCapturing(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    loadingText: {
      fontSize: responsiveValues.loadingFontSize,
    },
    message: {
      fontSize: responsiveValues.messageFontSize,
      paddingHorizontal: responsiveValues.messagePadding,
      paddingBottom: responsiveValues.messagePadding / 2,
    },
    buttonContainer: {
      paddingBottom: responsiveValues.buttonContainerPadding,
      gap: responsiveValues.buttonGap,
    },
    buttonClose: {
      borderRadius: responsiveValues.closeButtonRadius,
      padding: responsiveValues.closeButtonPadding,
    },
    locationIndicator: {
      top: responsiveValues.locationTop,
      right: responsiveValues.locationRight,
      padding: responsiveValues.locationPadding,
      borderRadius: responsiveValues.locationRadius,
    },
    locationText: {
      fontSize: responsiveValues.locationFontSize,
    },
  });

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
          Carregando câmera...
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
          Verificando permissões...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={[styles.message, dynamicStyles.message]}>
          Precisamos de permissão para usar a câmera
        </Text>
        <View style={styles.buttonPermissionContainer}>
          <Button text="Permitir" onPress={() => requestPermission()} />
          <Button text="Agora Não" onPress={() => navigate.goBack()} type='outlined' />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        facing={facing}
      >
        <View style={[styles.buttonContainer, dynamicStyles.buttonContainer]}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Icon 
              name="camera-reverse-sharp" 
              size={responsiveValues.iconSize} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isCapturing && styles.buttonDisabled]} 
            onPress={saveImage}
            disabled={isCapturing}
            testID="camera-button-save"
          >
            <Icon 
              name={isCapturing ? "hourglass" : "camera"} 
              size={responsiveValues.iconSize} 
              color={isCapturing ? "gray" : "white"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.buttonClose, dynamicStyles.buttonClose]} 
            onPress={() => navigate.goBack()}
            testID="camera-button-close"
          >
            <Icon 
              name="close" 
              size={responsiveValues.closeIconSize} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.locationIndicator, dynamicStyles.locationIndicator]}>
          <Icon 
            name={location ? "location" : "location-outline"} 
            size={responsiveValues.locationIconSize} 
            color={location ? "green" : "red"} 
          />
          <Text style={[styles.locationText, dynamicStyles.locationText]}>
            {location ? "GPS Ativo" : "GPS Inativo"}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  buttonPermissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#333',
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonClose: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F75A68',
    justifyContent: 'center',
  },
  locationIndicator: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
  },
});