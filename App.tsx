import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Home';
import CameraScreen from './src/screens/Camera';
import PhotoDetails from './src/screens/PhotoDetails';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();



export default function App() {
  return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
              <Stack.Screen name="PhotoDetails" component={PhotoDetails} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
  )
}
