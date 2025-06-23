import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface IButton {
  text: string;
  onPress: () => void;
  type?: 'outlined' | 'filled';
}

export function Button({ text, onPress, type = 'filled' }: IButton) {
  const style = type === 'outlined' ? styles.buttonOutlined : styles.button;

  return (
    <TouchableOpacity style={[style, styles.commons]} onPress={onPress} testID="button-touchable">
      <Text style={{ color: type === 'outlined' ? '#6200EE' : 'white' }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  commons:{
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonOutlined: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
});