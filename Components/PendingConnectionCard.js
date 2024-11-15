import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../api/api';

const PendingConnectionCard = ({ connections, handleconnectionrequest }) => {
    const navigation = useNavigation();
    const handleaccept = async (usertoacceptId) => {
        try {

            const token = await AsyncStorage.getItem('token');
            console.log(token);
            await axios.post(
                `${BASE_URL}/user/accept-conection-request/${usertoacceptId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('accepted request');
            handleconnectionrequest();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleotheruser = async (otheruserId) => {

        navigation.navigate('Otheruserprofile', { otheruserId });

    }

    return (
        <View style={styles.connectionCard}>
            <View style={styles.userdetailwithdelete}>
                <View style={styles.userdetail}>
                    <Image source={{ uri: connections.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                    <TouchableOpacity onPress={() => handleotheruser(connections._id)}>
                        <Text style={styles.username}>{connections.username}</Text>
                        <Text >{connections.bio}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.accept}>
                    <TouchableOpacity onPress={() => handleaccept(connections._id)}>
                        <Text style={styles.text}>accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    connectionCard: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 10,
        marginBottom: 5,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    deletepost: {
        marginRight: 25,

    },
    userdetailwithdelete: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //alignItems: 'center',
        gap: 15,
        paddingLeft: 15,
        paddingTop: 18,
    },
    userdetail: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        gap: 15,

    },
    text: {

        color: '#fff',
    },
    accept: {
        backgroundColor: '#000',
        marginBottom: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    }
    //   openRoomButton: {
    //     backgroundColor: '#000',
    //     padding: 10,
    //     borderRadius: 8,
    //   },
    //   buttonText: {
    //     color: '#fff',
    //     fontSize: 16,
    //     fontWeight: 'bold',
    //   },
});

export default PendingConnectionCard;
