import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface IAddButton {
  onPress: () => void;
  testID?: string;
}

export default function AddButton({ onPress, testID }: IAddButton) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} testID={testID || 'add-button'}>
      <Icon name="add-sharp" size={32} color="white" testID="add-button-icon" />
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