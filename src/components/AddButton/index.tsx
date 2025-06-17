import React from 'react';
import { StyledTouchableOpacity } from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IAddButton {
  onPress: () => void;
}

export default function AddButton({ onPress }: IAddButton) {
  return (
    <StyledTouchableOpacity onPress={onPress}>
       <Ionicons name="add-sharp" size={32} color="white" />
    </StyledTouchableOpacity>
  );
}