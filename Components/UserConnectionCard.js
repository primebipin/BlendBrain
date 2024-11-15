import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../api/api';


const ConnectionCard = ({ connections }) => {
    const [user, setUser] = useState({});
    const navigation = useNavigation();

    const fetchUserProfile = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/user/fetch-user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      useEffect(() => {
        fetchUserProfile();
      },[connections._id]);

      const handleotheruser = () => {
        const userId = user._id;
        const otheruserId = connections._id;
    
        console.log('userId:', userId);
        console.log('otherUserId:', otheruserId);
    
        if (userId === otheruserId) {
            console.log('Navigating to Profile');
            navigation.navigate('Profile');
        } else {
            console.log('Navigating to Otheruserprofile');
            navigation.navigate('Otheruserprofile', { otheruserId });
        }
    };
    

    return (
        <View style={styles.connectionCard}>
            <View style={styles.userdetailwithdelete}>
                <View style={styles.userdetail}>
                    <Image source={{ uri: connections.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                    <TouchableOpacity onPress={() => handleotheruser()}>
                        <Text style={styles.username}>{connections.username}</Text>
                        <Text >{connections.bio}</Text>
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
        marginTop: 10,
    },
    username:{
        fontWeight: 'bold'
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
        backgroundColor: 'green',
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

export default ConnectionCard;
