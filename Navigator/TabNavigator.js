import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import Documentupload from '../Screens/DocumentUpload';
import Searchdocument from '../Screens/SearchDocument';
import { ProfileStack, HomeStack , ChatStack} from './StackNavigator'



const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarItemStyle: {
    margin: 5,
    borderRadius: 10,
  }
};

const TabNavigator = () => {
  return (
    <Tab.Navigator {...{ screenOptions }}
      tabBarOptions={{
        keyboardHidesTabBar: true,
        activeTintColor: 'black',
        style: {
          elevation: 5,
          paddingVertical: 8,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Documentupload"
        component={Documentupload}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="upload" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Searchdocument"
        component={Searchdocument}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-search" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="user" size={24} color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
