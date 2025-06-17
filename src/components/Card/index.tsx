import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Photo } from "../../services/photoService";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../../utils/fomatDate";
import { formatCoordinate } from "../../utils/fomatCoords";

export default function Card({ item, handleDeletePhoto }: { item: Photo, handleDeletePhoto: (photoId: string) => void }) {
    return (
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
}

const styles = StyleSheet.create({
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
        height: 200,
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
});