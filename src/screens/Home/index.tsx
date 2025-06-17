import React from 'react';
import { Text } from 'react-native';
import { Container } from './styles';
import AddButton from '../../components/AddButton';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();

  return( 
    <Container>
        <Text>Home</Text>
        <AddButton onPress={() => navigation.navigate("Camera")} />
    </Container>
  );
}