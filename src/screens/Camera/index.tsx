import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonContainer, Container } from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const navigate = useNavigation();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Container>
        <Text style={styles.message}>Precisamos de permissão para usar a câmera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </Container>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const saveImage = async () => {
    // const options = { quality: 0.5, base64: true };

    // try {
    //   const data = await camera.takePictureAsync(options);
    //   console.log(data.uri);
    // } catch (error) {
    //   console.log(error);
    // }
    console.log("Save Image"); 
  };

  return (
    <Container>
      <CameraView style={{ flex: 1 }} facing={facing}>
        <ButtonContainer>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-sharp" size={48} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => saveImage()}>
            <Ionicons name="camera" size={48} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonClose} onPress={() => navigate.goBack()}>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
        </ButtonContainer>
      </CameraView>
    </Container>
  );
}

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    margin: 64,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonClose: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F75A68',
    borderRadius: 32,
    padding: 2,
  },
});
