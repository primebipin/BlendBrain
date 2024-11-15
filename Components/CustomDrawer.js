import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Linking } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, DrawerItem } from "@react-navigation/drawer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import BASE_URL from '../api/api';

const CustomDrawerContent = (props) => {
    const [user, setUser] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        if (isFocused) {
            fetchUserProfile();
        }
    }, [isFocused]);

    const fetchUserProfile = async () => {
        try {
            setRefreshing(true)
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/fetch-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Authscreen' }],
            });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleLinkedIn = () => {
        Linking.openURL('https://www.linkedin.com/in/saurabh-kumar-xrt/');
    };

    return (
        // <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={{ flex: 1 }}>

            <DrawerContentScrollView {...props}>
                <View style={styles.drawerHeader}>
                    <Image source={{ uri: user.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                    <View>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.bio}>{user.bio}</Text>
                    </View>
                </View>
                <DrawerItemList {...props} />
                <DrawerItem
                    label="Logout"
                    onPress={handleLogout}
                    icon={({ color, size }) => (
                        <MaterialCommunityIcons name="logout" size={size} color={color} />
                    )}
                />


            </DrawerContentScrollView>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Made with ❤️ by </Text>
                <Text style={[styles.footerText, styles.link]} onPress={handleLinkedIn}>Saurabh Kumar</Text>
            </View>


        </View>
        // </ScrollView>
    )
};

const styles = StyleSheet.create({
    drawerHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddigHorizontal: 10,
        paddingVertical: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bio: {
        fontSize: 14,
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#eee',
        padding: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
    },
    footer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',

    },
    footerText: {
        color: '#555',
        fontSize: 12,
    },
    link: {
        textDecorationLine: 'underline',
    },
});

export default CustomDrawerContent;
