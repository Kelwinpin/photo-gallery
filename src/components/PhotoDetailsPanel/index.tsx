import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDate } from "../../utils/fomatDate";
import { Photo } from "../../services/photoService";

export default function PhotoDetailsPanel({ photo, closePanel }: { photo: Photo, closePanel: () => void }) {
  return (
    <>
        <View style={styles.panelHandle} />
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Detalhes da Foto</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
                    <Ionicons name="arrow-down-circle-outline" size={32} color="#6200EE" />
            </TouchableOpacity>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="time-outline" size={24} color="#6200EE" />
                    <Text style={styles.sectionTitle}>Data e Hora</Text>
                </View>
                <Text style={styles.primaryText}>{formatDate(photo.timestamp)}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="location-outline" size={24} color="#6200EE" />
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
    </>
  );
}

const styles = StyleSheet.create({
   closeButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
    section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  primaryText: {
    fontSize: 18,
    color: '#666',
    lineHeight: 26,
  },
  coordinatesDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  coordinateItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 16,
  },
  coordinateLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});