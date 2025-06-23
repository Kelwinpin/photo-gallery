import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Share,
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
import { useNavigation } from '@react-navigation/native';
import { formatDate } from "../../utils/fomatDate";
import { formatCoordinate } from "../../utils/fomatCoords";
import PhotoDetailsPanel from "../../components/PhotoDetailsPanel";
import useResponsiveDimensions from "../../utils/hooks/useResponsiveDimensions";
import Icon from 'react-native-vector-icons/Ionicons';


const getResponsiveValues = (dimensions: ReturnType<typeof useResponsiveDimensions>) => {
  const { width, height, isTablet, isLandscape, isSmallScreen } = dimensions;

  let panelHeight;
  if (isTablet) {
    panelHeight = isLandscape ? height * 0.6 : height * 0.45;
  } else {
    panelHeight = isLandscape ? height * 0.7 : isSmallScreen ? height * 0.65 : height * 0.4;
  }

  const iconSize = isSmallScreen ? 24 : isTablet ? 32 : 28;
  const infoButtonSize = isSmallScreen ? 50 : isTablet ? 70 : 60;
  const headerPadding = isSmallScreen ? 12 : isTablet ? 24 : 20;

  return {
    panelHeight,
    iconSize,
    infoButtonSize,
    headerPadding,
    maxImageWidth: isTablet && isLandscape ? width * 0.7 : width,
  };
};

export default function PhotoDetails({ route }: { route: { params: { id: string } } }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigation = useNavigation();
  const dimensions = useResponsiveDimensions();
  const responsiveValues = getResponsiveValues(dimensions);

  const translateY = useSharedValue(responsiveValues.panelHeight);
  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    loadPhoto();
  }, []);

  useEffect(() => {
    if (!isPanelOpen) {
      translateY.value = responsiveValues.panelHeight;
    }
  }, [responsiveValues.panelHeight, isPanelOpen]);

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

    translateY.value = withSpring(isOpening ? 0 : responsiveValues.panelHeight, {
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
      const newTranslateY = Math.max(0, Math.min(responsiveValues.panelHeight, event.translationY));
      translateY.value = newTranslateY;

      const progress = 1 - (newTranslateY / responsiveValues.panelHeight);
      headerOpacity.value = interpolate(
        progress,
        [0, 1],
        [1, 0.3],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldOpen = event.translationY < responsiveValues.panelHeight / 2;

      translateY.value = withSpring(shouldOpen ? 0 : responsiveValues.panelHeight, {
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
      [0, responsiveValues.panelHeight],
      [0.5, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      pointerEvents: translateY.value < responsiveValues.panelHeight ? 'auto' : 'none',
    };
  });

  const dynamicStyles = StyleSheet.create({
    header: {
      paddingHorizontal: responsiveValues.headerPadding,
      paddingTop: (StatusBar.currentHeight || (dimensions.isTablet ? 50 : 44)) + 16,
      paddingBottom: dimensions.isTablet ? 32 : 24,
    },
    headerButton: {
      padding: dimensions.isSmallScreen ? 8 : dimensions.isTablet ? 16 : 12,
      borderRadius: dimensions.isTablet ? 30 : 25,
    },
    headerActions: {
      gap: dimensions.isSmallScreen ? 12 : dimensions.isTablet ? 20 : 16,
    },
    infoButton: {
      bottom: dimensions.isLandscape ? 40 : 60,
      right: dimensions.isSmallScreen ? 16 : 24,
      width: responsiveValues.infoButtonSize,
      height: responsiveValues.infoButtonSize,
      borderRadius: responsiveValues.infoButtonSize / 2,
    },
    infoPanel: {
      height: responsiveValues.panelHeight,
      borderTopLeftRadius: dimensions.isTablet ? 32 : 24,
      borderTopRightRadius: dimensions.isTablet ? 32 : 24,
    },
    imageContainer: {
      width: dimensions.width,
      height: dimensions.height,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenImage: {
      width: responsiveValues.maxImageWidth,
      height: dimensions.height,
      maxWidth: dimensions.width,
      maxHeight: dimensions.height,
    },
    loadingText: {
      fontSize: dimensions.isTablet ? 18 : 16,
    },
    errorText: {
      fontSize: dimensions.isTablet ? 20 : 18,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    backButton: {
      paddingHorizontal: dimensions.isTablet ? 32 : 24,
      paddingVertical: dimensions.isTablet ? 16 : 12,
      borderRadius: dimensions.isTablet ? 12 : 8,
    },
    backButtonText: {
      fontSize: dimensions.isTablet ? 18 : 16,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
            Carregando foto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            size={dimensions.isTablet ? 80 : 64}
            color="#ccc"
          />
          <Text style={[styles.errorText, dynamicStyles.errorText]}>
            Foto não encontrada
          </Text>
          <TouchableOpacity
            style={[styles.backButton, dynamicStyles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, dynamicStyles.backButtonText]}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <View style={dynamicStyles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={dynamicStyles.fullscreenImage}
          resizeMode="contain"
          accessibilityLabel="image"
        />
      </View>

      <Animated.View style={[styles.header, dynamicStyles.header, animatedHeaderStyle]}>
        <TouchableOpacity
          style={[styles.headerButton, dynamicStyles.headerButton]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={responsiveValues.iconSize} color="white" />
        </TouchableOpacity>

        <View style={[styles.headerActions, dynamicStyles.headerActions]}>
          <TouchableOpacity
            style={[styles.headerButton, dynamicStyles.headerButton]}
            onPress={handleSharePhoto}
            accessibilityLabel="share"
          >
            <Icon name="share-outline" size={responsiveValues.iconSize} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, dynamicStyles.headerButton]}
            onPress={handleDeletePhoto}
            accessibilityLabel="delete"
          >
            <Icon name="trash-outline" size={responsiveValues.iconSize} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={[styles.infoButton, dynamicStyles.infoButton]}
        onPress={togglePanel}
        activeOpacity={0.8}
      >
        <Icon
          name={isPanelOpen ? "close" : "information-circle-outline"}
          size={responsiveValues.iconSize + 4}
          color="white"
        />
      </TouchableOpacity>

      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.infoPanel, dynamicStyles.infoPanel, animatedPanelStyle]} accessibilityLabel="toggle-info">
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  infoButton: {
    position: 'absolute',
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
    backgroundColor: '#fff',
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
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6200EE',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});