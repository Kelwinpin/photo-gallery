import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { photoService } from '../../services/photoService';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const navigate = useNavigation();

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

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

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de permissão para usar a câmera</Text>
        <Button onPress={requestPermission} title="Permitir" />
        <Button onPress={() => navigate.goBack()} title="Agora Não" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={{ flex: 1 }} 
        facing={facing}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-sharp" size={48} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isCapturing && styles.buttonDisabled]} 
            onPress={saveImage}
            disabled={isCapturing}
          >
            <Ionicons 
              name={isCapturing ? "hourglass" : "camera"} 
              size={48} 
              color={isCapturing ? "gray" : "white"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.buttonClose} onPress={() => navigate.goBack()}>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationIndicator}>
          <Ionicons 
            name={location ? "location" : "location-outline"} 
            size={20} 
            color={location ? "green" : "red"} 
          />
          <Text style={styles.locationText}>
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
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 64,
    flexDirection: 'row',
    gap: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonClose: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F75A68',
    borderRadius: 32,
    padding: 2,
  },
  locationIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 16,
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
  },
});