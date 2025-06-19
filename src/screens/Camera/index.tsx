import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  
  const cameraRef = useRef<CameraView>(null);
  const navigate = useNavigation();

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando câmera...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de permissão para usar a câmera</Text>
        <View style={styles.buttonPermissionContainer}>
          <TouchableOpacity onPress={() => requestPermission()} style={styles.button}>
            <Text style={{ color: 'white' }}>Conceder Permissão</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate.goBack()} style={styles.buttonOutlined}>
            <Text style={{ color: '#6200EE' }}>Agora Não</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 16,
  },
  buttonPermissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutlined:{
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
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