import React, { useState, useCallback, useEffect } from 'react';
import {
  Text,
  FlatList,
  Alert,
  RefreshControl,
  View,
  StyleSheet,
} from 'react-native';
import AddButton from '../../components/AddButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { photoService, Photo } from '../../services/photoService';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '../../components/Card';
import useResponsiveDimensions from '../../utils/hooks/useResponsiveDimensions';

const getResponsiveValues = (dimensions: ReturnType<typeof useResponsiveDimensions>) => {
  const { width, isTablet, isLandscape, isSmallScreen, isLargeTablet, isExtraLarge } = dimensions;
  
  let numColumns;
  if (isExtraLarge) {
    numColumns = isLandscape ? 5 : 4;
  } else if (isLargeTablet) {
    numColumns = isLandscape ? 4 : 3;
  } else if (isTablet) {
    numColumns = isLandscape ? 3 : 2;
  } else {
    numColumns = isSmallScreen ? 1 : 2;
  }
  
  const titleFontSize = isExtraLarge ? 36 : isLargeTablet ? 32 : isTablet ? 30 : isSmallScreen ? 24 : 28;
  const subtitleFontSize = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  const loadingFontSize = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  const emptyTitleFontSize = isExtraLarge ? 26 : isLargeTablet ? 24 : isTablet ? 22 : isSmallScreen ? 18 : 20;
  const emptySubtitleFontSize = isExtraLarge ? 20 : isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  
  const emptyIconSize = isExtraLarge ? 120 : isLargeTablet ? 100 : isTablet ? 90 : isSmallScreen ? 60 : 80;
  
  const headerPadding = isExtraLarge ? 40 : isLargeTablet ? 35 : isTablet ? 30 : isSmallScreen ? 20 : 30;
  const headerPaddingBottom = isTablet ? 15 : 10;
  const headerMarginTop = isTablet ? 20 : 16;
  
  const listPadding = isExtraLarge ? 20 : isLargeTablet ? 15 : isTablet ? 12 : isSmallScreen ? 8 : 10;
  const listPaddingBottom = isTablet ? 120 : 100;
  
  const cardMargin = isTablet ? 8 : 5;
  const availableWidth = width - (listPadding * 2);
  const totalMargins = cardMargin * 2 * numColumns;
  const cardWidth = (availableWidth - totalMargins) / numColumns;
  
  const imageHeight = isSmallScreen ? cardWidth * 0.8 : cardWidth * 0.75;
  
  const emptyPaddingTop = isTablet ? 150 : isSmallScreen ? 80 : 100;
  const emptyPaddingHorizontal = isTablet ? 60 : 40;
  
  return {
    numColumns,
    titleFontSize,
    subtitleFontSize,
    loadingFontSize,
    emptyTitleFontSize,
    emptySubtitleFontSize,
    emptyIconSize,
    headerPadding,
    headerPaddingBottom,
    headerMarginTop,
    listPadding,
    listPaddingBottom,
    cardMargin,
    cardWidth,
    imageHeight,
    emptyPaddingTop,
    emptyPaddingHorizontal,
  };
};

export default function Home() {
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dimensions = useResponsiveDimensions();
  const responsiveValues = getResponsiveValues(dimensions);

  const loadPhotos = async () => {
    try {
      const loadedPhotos = await photoService.getAllPhotos();
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

  const dynamicStyles = StyleSheet.create({
    header: {
      padding: responsiveValues.headerPadding,
      paddingBottom: responsiveValues.headerPaddingBottom,
    },
    title: {
      fontSize: responsiveValues.titleFontSize,
      marginBottom: dimensions.isTablet ? 6 : 4,
      marginTop: responsiveValues.headerMarginTop,
    },
    subtitle: {
      fontSize: responsiveValues.subtitleFontSize,
    },
    listContainer: {
      padding: responsiveValues.listPadding,
      paddingBottom: responsiveValues.listPaddingBottom,
    },
    row: {
      justifyContent: responsiveValues.numColumns === 1 ? 'center' : 'space-evenly',
      marginBottom: dimensions.isTablet ? 12 : 8,
    },
    loadingText: {
      fontSize: responsiveValues.loadingFontSize,
    },
    emptyContainer: {
      paddingTop: responsiveValues.emptyPaddingTop,
      paddingHorizontal: responsiveValues.emptyPaddingHorizontal,
    },
    emptyTitle: {
      fontSize: responsiveValues.emptyTitleFontSize,
      marginTop: dimensions.isTablet ? 20 : 16,
      marginBottom: dimensions.isTablet ? 12 : 8,
    },
    emptySubtitle: {
      fontSize: responsiveValues.emptySubtitleFontSize,
    },
  });

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
      <Ionicons 
        name="camera-outline" 
        size={responsiveValues.emptyIconSize} 
        color="#ccc" 
      />
      <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>
        Nenhuma foto ainda
      </Text>
      <Text style={[styles.emptySubtitle, dynamicStyles.emptySubtitle]}>
        Toque no botão + para tirar sua primeira foto
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
            Carregando fotos...
          </Text>
        </View>
        <AddButton onPress={() => navigation.navigate("Camera")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <Text style={[styles.title, dynamicStyles.title]}>
          Minhas Fotos
        </Text>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
        </Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card 
            item={item} 
            handleDeletePhoto={handleDeletePhoto}
            cardWidth={responsiveValues.cardWidth}
            imageHeight={responsiveValues.imageHeight}
            cardMargin={responsiveValues.cardMargin}
          />
        )}
        numColumns={responsiveValues.numColumns}
        key={`${responsiveValues.numColumns}-${dimensions.width}`}
        contentContainerStyle={dynamicStyles.listContainer}
        columnWrapperStyle={responsiveValues.numColumns > 1 ? dynamicStyles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9bbb85']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={responsiveValues.numColumns * 4}
        windowSize={10}
        initialNumToRender={responsiveValues.numColumns * 6}
      />

      <AddButton onPress={() => navigation.navigate("Camera")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    color: '#666',
  },
  photoContainer: {
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
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtitle: {
    color: '#ccc',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
});