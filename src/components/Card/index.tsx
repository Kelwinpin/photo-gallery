import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Photo } from "../../services/photoService";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../../utils/fomatDate";
import { formatCoordinate } from "../../utils/fomatCoords";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../@types/navigation";

interface CardProps {
  item: Photo;
  handleDeletePhoto: (photoId: string) => void;
  cardWidth: number;
  imageHeight: number;
  cardMargin: number;
  TestId?: string;
}

export default function Card({
  item,
  handleDeletePhoto,
  cardWidth,
  imageHeight,
  cardMargin,
  TestId
}: CardProps) {
  const navigation = useNavigation<RootStackParamList>();

  const isSmallCard = cardWidth < 150;
  const isMediumCard = cardWidth >= 150 && cardWidth < 200;
  const isLargeCard = cardWidth >= 200;

  const locationFontSize = isSmallCard ? 10 : isMediumCard ? 11 : 12;
  const dateFontSize = isSmallCard ? 10 : isMediumCard ? 11 : 12;

  const iconSize = isSmallCard ? 12 : 14;
  const deleteIconSize = isSmallCard ? 16 : 18;

  const infoPadding = isSmallCard ? 8 : isMediumCard ? 12 : 15;
  const locationMarginBottom = isSmallCard ? 4 : 6;
  const deleteButtonSize = isSmallCard ? 28 : 32;
  const deleteButtonPadding = isSmallCard ? 4 : 6;
  const deleteButtonTop = isSmallCard ? 6 : 8;
  const deleteButtonRight = isSmallCard ? 6 : 8;

  const dynamicStyles = StyleSheet.create({
    photoContainer: {
      width: cardWidth,
      margin: cardMargin,
    },
    photoImage: {
      height: imageHeight,
    },
    deleteButton: {
      top: deleteButtonTop,
      right: deleteButtonRight,
      width: deleteButtonSize,
      height: deleteButtonSize,
      padding: deleteButtonPadding,
    },
    photoInfo: {
      padding: infoPadding,
    },
    locationContainer: {
      marginBottom: locationMarginBottom,
    },
    locationText: {
      fontSize: locationFontSize,
    },
    dateText: {
      fontSize: dateFontSize,
    },
  });

  return (
    <View style={[styles.photoContainer, dynamicStyles.photoContainer]} testID="card-container">
      <TouchableOpacity
        style={styles.photoTouchable}
        onPress={() => {
          navigation.navigate("PhotoDetails", { id: item.id });
        }}
      >
        <Image
          source={{ uri: item.uri }}
          style={[styles.photoImage, dynamicStyles.photoImage]}
          resizeMode="cover"
          testID="card-image"
        />

        <TouchableOpacity
          style={[styles.deleteButton, dynamicStyles.deleteButton]}
          onPress={() => handleDeletePhoto(item.id)}
          testID="delete-button"
        >
          <Ionicons name="trash" size={deleteIconSize} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={[styles.photoInfo, dynamicStyles.photoInfo]}>
        <View style={[styles.locationContainer, dynamicStyles.locationContainer]}>
          <Ionicons name="location" size={iconSize} color="#666" />
          <Text style={[styles.locationText, dynamicStyles.locationText]} numberOfLines={1}>
            {formatCoordinate(item.location.latitude)}, {formatCoordinate(item.location.longitude)}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="time" size={iconSize} color="#666" />
          <Text style={[styles.dateText, dynamicStyles.dateText]} numberOfLines={1}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInfo: {
    // Padding será aplicado dinamicamente
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
});