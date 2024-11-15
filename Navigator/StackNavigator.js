import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Homescreen from '../Screens/Homescreen';
import OtheruserProfileScreen from '../Screens/OtherUserprofile';
import SignInScreen from '../Screens/SignInscreen';
import Createprofile from '../Screens/Createprofile';
import ProfileScreen from '../Screens/Profilescreen';
import Chatscreen from '../Screens/Chatscreen';
import Chatuserscreen from '../Screens/Chatuserscreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={SignInScreen} />
      <Stack.Screen name="createprofile" component={Createprofile} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="profileview"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="profileview"
          component={ProfileScreen}
        />
        {/* <Stack.Screen
          name="updateprofile"
          component={UpdateProfileScreen}
        /> */}
      </Stack.Navigator>
    )
  }

  const HomeStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="Homescreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Homescreen" component={Homescreen} />
        <Stack.Screen name="Otheruserprofile" component={OtheruserProfileScreen} />
      </Stack.Navigator>
    );
  };
  
  const ChatStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="Chatscreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Chatscreen" component={Chatscreen} />
        <Stack.Screen name="Chatuserscreen" 
         component={Chatuserscreen} 
       
         />
      </Stack.Navigator>
    );
  };

export { AuthStack ,ProfileStack, HomeStack, ChatStack };
