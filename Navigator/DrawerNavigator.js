import React from 'react';
import { Dimensions, Image, TouchableOpacity, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawerContent from '../Components/CustomDrawer';
import Leaderboard from '../Screens/Leaderboard';
import Coinscreen from '../Screens/Coinscreen';
import SearchUserScreen from '../Screens/SearchUserscreen';
import UpdateProfileScreen from '../Screens/UpdateProfilescreen';
import { AuthStack } from './StackNavigator';
import TabNavigator from './TabNavigator';
import { AntDesign, Entypo, Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { ChatStack } from './StackNavigator';

const Drawer = createDrawerNavigator();

const Root = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: Dimensions.get('window').width / 1.8,
                },
                drawerActiveTintColor: 'black',
                drawerInactiveTintColor: 'gray',
                drawerItemStyle: { marginVertical: 5 },
            }}
        >
            <Drawer.Screen
                name="Home"
                component={TabNavigator}
                options={{
                    drawerIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
                    headerTitle: () => (
                        <Image
                            style={{ width: 100, height: 50, marginLeft: 1 }}
                            source={{ uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707137936/auwhwgp0rx2mobbmbyso.png' }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />


            <Drawer.Screen
                name="Leaderboard"
                component={Leaderboard}
                options={{
                    drawerIcon: ({ color, size }) => <MaterialIcons name="leaderboard" size={24} color="black" />,
                    headerTitle: () => (
                        <Image
                            style={{ width: 100, height: 50, marginLeft: 1 }}
                            source={{ uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707137936/auwhwgp0rx2mobbmbyso.png' }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="Coins"
                component={Coinscreen}
                options={{
                    drawerIcon: ({ color, size }) => <FontAwesome6 name="coins" size={24} color="black" />,
                    headerTitle: () => (
                        <Image
                            style={{ width: 100, height: 50, marginLeft: 1 }}
                            source={{ uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707137936/auwhwgp0rx2mobbmbyso.png' }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="Chat"
                component={ChatStack}
                options={{
                    drawerIcon: ({ color, size }) =>  <Entypo name="chat" size={24} color="black" />,
                    headerTitle: () => (
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 1 }}>Chat</Text>
                    ),
                }}
            />
            <Drawer.Screen
                name="Searchuser"
                component={SearchUserScreen}
                options={{
                    drawerIcon: ({ color, size }) => <Entypo name="user" size={24} color="black" />,
                    headerTitle: () => (
                        <Image
                            style={{ width: 100, height: 50, marginLeft: 1 }}
                            source={{ uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707137936/auwhwgp0rx2mobbmbyso.png' }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="UpdateProfile"
                component={UpdateProfileScreen}
                options={{
                    drawerIcon: ({ color, size }) => <FontAwesome6 name="user-tie" size={24} color="black" />,
                    headerTitle: () => (
                        <Image
                            style={{ width: 100, height: 50, marginLeft: 1 }}
                            source={{ uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707137936/auwhwgp0rx2mobbmbyso.png' }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />


        </Drawer.Navigator>
    );
}

export default Root;
