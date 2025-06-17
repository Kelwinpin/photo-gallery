import React, { useState, useCallback } from 'react';
import { 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  View,
  StyleSheet 
} from 'react-native';
import { Container } from './styles';
import AddButton from '../../components/AddButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { photoService, Photo } from '../../services/photoService';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Home() {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPhotos = async () => {
    try {
      const loadedPhotos = await photoService.getAllPhotos();
      console.log("🚀 ~ loadPhotos ~ loadedPhotos:", loadedPhotos)
      const sortedPhotos = loadedPhotos.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setPhotos(sortedPhotos);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      Alert.alert('Erro', 'Não foi possível carregar as fotos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const handleDeletePhoto = (photoId: string) => {
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
            const success = await photoService.deletePhoto(photoId);
            if (success) {
              await loadPhotos();
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a foto');
            }
          },
        },
      ]
    );
  };

  const formatCoordinate = (coord: number): string => {
    return `${Math.abs(coord).toFixed(6)}°`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <View style={styles.photoContainer}>
      <TouchableOpacity 
        style={styles.photoTouchable}
        onPress={() => {
          console.log('Foto selecionada:', item.id);
        }}
      >
        <Image 
          source={{ uri: item.uri }} 
          style={styles.photoImage}
          resizeMode="cover"
        />
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeletePhoto(item.id)}
        >
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
      
      <View style={styles.photoInfo}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText}>
            {formatCoordinate(item.location.latitude)}, {formatCoordinate(item.location.longitude)}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.dateText}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma foto ainda</Text>
      <Text style={styles.emptySubtitle}>
        Toque no botão + para tirar sua primeira foto
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
        <AddButton onPress={() => navigation.navigate("Camera")} />
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Fotos</Text>
        <Text style={styles.subtitle}>
          {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
        </Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhotoItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200EE']}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      <AddButton onPress={() => navigation.navigate("Camera")} />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 30,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoTouchable: {
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 6,
  },
  photoInfo: {
    padding: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});