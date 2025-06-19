import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface IAddButton {
  onPress: () => void;
}

export default function AddButton({ onPress }: IAddButton) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
       <Ionicons name="add-sharp" size={32} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 32,
    marginBottom: 10,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});