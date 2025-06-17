import * as React from 'react';
import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Home';
import CameraScreen from './src/screens/Camera';
import { ThemeProvider } from 'styled-components';
import theme from './src/theme';

const Stack = createNativeStackNavigator();



export default function App() {
  return (
        <ThemeProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
  )
}
