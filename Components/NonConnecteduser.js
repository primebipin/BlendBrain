import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Image, TouchableOpacity, RefreshControl, StyleSheet, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BASE_URL from '../api/api';


const UserCardList = () => {
    const [nonconnecteduser, setnonConnecteduser] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchdata = async () => {
            const isAuthenticated = await Checkauth();
            if (isAuthenticated) {
                fetchnonconnecteduser();
            }
        };
        
        if (isFocused) {
            fetchdata();
        }
    }, [isFocused]);

    const Checkauth = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            navigation.navigate('Authscreen');
            return false;
        }
        return true;
    };
    

    const handleRefresh = () => {
        setRefreshing(true);
        fetchnonconnecteduser();
        setRefreshing(false);
    };

    const fetchnonconnecteduser = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/fetch-non-connected-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setnonConnecteduser(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setRefreshing(false);
        }
    }

    const UserCard = ({ user }) => {
        const handleotheruser = (otheruserId) => {
            navigation.navigate('Otheruserprofile', { otheruserId });
        }

        const onSendRequest = async (userId) => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.post(
                    `${BASE_URL}/user/connect/${userId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                fetchnonconnecteduser();
                console.log(response.data);
            } catch (error) {
                console.error('error in sending connection request:', error);
            }

        }
        return (
            <View style={styles.cardContainer}>
                <TouchableOpacity onPress={() => handleotheruser(user._id)} style={styles.cardContainerx}>
                    <Image source={{ uri: user.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                    <Text style={styles.username}>{user.username}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onSendRequest(user._id)}>
                    <Text style={styles.buttonText}>Send Request</Text>
                </TouchableOpacity>
            </View>
        );
    };




    return (
        <>
            {nonconnecteduser.length > 3 &&
                <><Text style={styles.text}>peaople to connect</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

                    <FlatList
                        horizontal
                        data={nonconnecteduser}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <UserCard user={item} />} />
                </ScrollView></>
            }
        </>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        alignItems: 'center',
        marginLeft: 6,
        marginVertical: 5,
        backgroundColor: '#fff',
        shadowColor: '#000',
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        paddingVertical: 15,
        paddingHorizontal: 23,
        flex: 1,
    },
    cardContainerx: {
        alignItems: 'center',
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },
    username: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 13,
    },
    button: {
        backgroundColor: '#000',
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 10,
    },
    text: {
        fontSize: 13,
        fontWeight: 'bold',
        paddingVertical: 3,
        paddingLeft: 10,
        // borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        backgroundColor: '#fff',
    },
});



export default UserCardList;
