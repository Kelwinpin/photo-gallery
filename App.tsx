import * as React from 'react';
import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Home';
import { ThemeProvider } from 'styled-components';
import theme from './src/theme';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);


export default function App() {
  return (
        <ThemeProvider theme={theme}>
          <Navigation />
        </ThemeProvider>
  )
}
