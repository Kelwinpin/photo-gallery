import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Home';
import CameraScreen from './src/screens/Camera';

const Stack = createNativeStackNavigator();



export default function App() {
  return (
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
  )
}
