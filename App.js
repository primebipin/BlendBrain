import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import DrawerNavigator from './Navigator/DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';
import SignInScreen from './Screens/SignInscreen';
import { AuthStack } from './Navigator/StackNavigator';
import Root from './Navigator/DrawerNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();


export default function App() {


  useEffect(() => {
    StatusBar.setBackgroundColor('#000');
    StatusBar.setBarStyle('light-content');

    return () => {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');
    };


  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home1"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home1" component={Root} />
        <Stack.Screen name="Authscreen" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
