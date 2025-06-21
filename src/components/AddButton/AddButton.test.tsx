// AddButton.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import AddButton from '.';

describe('AddButton Component', () => {
  const mockOnPress = jest.fn();

  it('should render the button with Ionicons add-sharp icon', () => {
    const { getByTestId } = render(<AddButton onPress={mockOnPress} />);

    const icon = getByTestId('add-button-icon');
    expect(icon).toBeTruthy();
    expect(icon).toHaveStyle({ fontSize: 32 });
    expect(icon).toHaveStyle({ color: 'white' });
  });

  it('should call onPress when button is pressed', () => {
    const { getByTestId } = render(<AddButton onPress={mockOnPress} />);

    const button = getByTestId('add-button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should have correct styles applied', () => {
    const { getByTestId } = render(<AddButton onPress={mockOnPress} />);

    const button = getByTestId('add-button');
    const flattenedStyle = StyleSheet.flatten(button.props.style);

    expect(flattenedStyle).toMatchObject({
      backgroundColor: '#6200EE',
      padding: 10,
      borderRadius: 32,
      marginBottom: 10,
      position: 'absolute',
      bottom: 20,
      right: 20,
    });
  });
});