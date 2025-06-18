import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Share,
  Dimensions,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Photo, photoService } from "../../services/photoService";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { formatDate } from "../../utils/fomatDate";
import { formatCoordinate } from "../../utils/fomatCoords";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PhotoDetails({ route }: { route: { params: { id: string } } }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSharePhoto}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDeletePhoto}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: photo.uri }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#6200EE" />
              <Text style={styles.sectionTitle}>Data e Hora</Text>
            </View>
            <Text style={styles.primaryText}>{formatDate(photo.timestamp)}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#6200EE" />
              <Text style={styles.sectionTitle}>Localização</Text>
            </View>
            <View style={styles.coordinatesDetails}>
              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <Text style={styles.coordinateValue}>{photo.location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <Text style={styles.coordinateValue}>{photo.location.longitude.toFixed(6)}</Text>
              </View>
            </View>
          </View>  
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: screenHeight * 0.8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  primaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  coordinatesDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fileInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#6200EE',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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