// Button.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '.';
import { StyleSheet } from 'react-native';

describe('Button Component', () => {
    const mockOnPress = jest.fn();

    it('should render the button with correct text', () => {
        const { getByText } = render(<Button text="Clique aqui" onPress={mockOnPress} />);
        expect(getByText('Clique aqui')).toBeTruthy();
    });

    it('should apply filled style by default', () => {
        const { getByTestId } = render(
            <Button text="Salvar" onPress={mockOnPress} />
        );

        const button = getByTestId('button-touchable');
        const flattenedStyle = StyleSheet.flatten(button.props.style);

        expect(flattenedStyle).toMatchObject({
            backgroundColor: '#6200EE',
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
            minWidth: 100,
            alignItems: 'center',
            justifyContent: 'center',
        });
    });

    it('should apply outlined style when type is "outlined"', () => {
        const { getByTestId } = render(
            <Button text="Cancelar" onPress={mockOnPress} type="outlined" />
        );

        const button = getByTestId('button-touchable');
        const flattenedStyle = StyleSheet.flatten(button.props.style);

        expect(flattenedStyle).toMatchObject({
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#6200EE',
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
            minWidth: 100,
            alignItems: 'center',
            justifyContent: 'center',
        });
    });

    it('should call onPress function when pressed', () => {
        const { getByTestId } = render(
        <Button text="Enviar" onPress={mockOnPress} />
        );

        const button = getByTestId('button-touchable');
        fireEvent.press(button);

        expect(mockOnPress).toHaveBeenCalled();
    });

  it('should have white text color for filled button', () => {
    const { getByText } = render(
      <Button text="Ok" onPress={mockOnPress} />
    );

    const text = getByText('Ok');
    const flattenedStyle = StyleSheet.flatten(text.props.style);

    expect(flattenedStyle).toMatchObject({ color: 'white' });
  });

  it('should have purple text color for outlined button', () => {
    const { getByText } = render(
      <Button text="Voltar" onPress={mockOnPress} type="outlined" />
    );

    const text = getByText('Voltar');
    const flattenedStyle = StyleSheet.flatten(text.props.style);

    expect(flattenedStyle).toMatchObject({ color: '#6200EE' });
  });
});