import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  Share,
  Dimensions,
  SafeAreaView,
  StatusBar
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Photo, photoService } from "../../services/photoService";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { formatDate } from "../../utils/fomatDate";
import { formatCoordinate } from "../../utils/fomatCoords";
import PhotoDetailsPanel from "../../components/PhotoDetailsPanel";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PANEL_HEIGHT = screenHeight * 0.4;

export default function PhotoDetails({ route }: { route: { params: { id: string } } }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigation = useNavigation();

  const translateY = useSharedValue(PANEL_HEIGHT);
  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    loadPhoto();
  }, []);

  const loadPhoto = async () => {
    try {
      const loadedPhoto = await photoService.getPhotoById(route.params.id);
      setPhoto(loadedPhoto);
    } catch (error) {
      console.error('Erro ao carregar foto:', error);
      Alert.alert('Erro', 'Não foi possível carregar a foto');
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    const isOpening = !isPanelOpen;
    
    translateY.value = withSpring(isOpening ? 0 : PANEL_HEIGHT, {
      damping: 20,
      stiffness: 90,
    });
    
    headerOpacity.value = withTiming(isOpening ? 0.3 : 1, {
      duration: 300,
    });

    runOnJS(setIsPanelOpen)(isOpening);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateY = Math.max(0, Math.min(PANEL_HEIGHT, event.translationY));
      translateY.value = newTranslateY;
      
      const progress = 1 - (newTranslateY / PANEL_HEIGHT);
      headerOpacity.value = interpolate(
        progress,
        [0, 1],
        [1, 0.3],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldOpen = event.translationY < PANEL_HEIGHT / 2;
      
      translateY.value = withSpring(shouldOpen ? 0 : PANEL_HEIGHT, {
        damping: 20,
        stiffness: 90,
      });
      
      headerOpacity.value = withTiming(shouldOpen ? 0.3 : 1, {
        duration: 300,
      });

      runOnJS(setIsPanelOpen)(shouldOpen);
    });

  const handleDeletePhoto = () => {
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
            if (photo) {
              const success = await photoService.deletePhoto(photo.id);
              if (success) {
                Alert.alert('Sucesso', 'Foto excluída com sucesso', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  }
                ]);
              } else {
                Alert.alert('Erro', 'Não foi possível excluir a foto');
              }
            }
          },
        },
      ]
    );
  };

  const handleSharePhoto = async () => {
    if (!photo) return;

    try {
      await Share.share({
        url: photo.uri,
        message: `Foto tirada em ${formatDate(photo.timestamp)} 
        - Localização: ${formatCoordinate(photo.location.latitude)}, 
        ${formatCoordinate(photo.location.longitude)}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a foto');
    }
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const animatedPanelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, PANEL_HEIGHT],
      [0.5, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      pointerEvents: translateY.value < PANEL_HEIGHT ? 'auto' : 'none',
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando foto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Foto não encontrada</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <Image 
        source={{ uri: photo.uri }} 
        style={styles.fullscreenImage}
        resizeMode="cover"
      />

      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSharePhoto}
          >
            <Ionicons name="share-outline" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDeletePhoto}
          >
            <Ionicons name="trash-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity 
        style={styles.infoButton}
        onPress={togglePanel}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isPanelOpen ? "close" : "information-circle-outline"} 
          size={32} 
          color="white" 
        />
      </TouchableOpacity>

      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.infoPanel, animatedPanelStyle]}>
            <PhotoDetailsPanel photo={photo} closePanel={togglePanel} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: (StatusBar.currentHeight || 44) + 16,
    paddingBottom: 24,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  infoButton: {
    position: 'absolute',
    bottom: 60,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});