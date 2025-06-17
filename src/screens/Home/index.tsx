import React from 'react';
import { Text } from 'react-native';
import { Container } from './styles';
import AddButton from '../../components/AddButton';

export default function Home() {
  return( 
    <Container>
        <Text>Home</Text>
        <AddButton onPress={() => {}} />
    </Container>
  );
}