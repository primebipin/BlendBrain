import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import BASE_URL from '../api/api';

const ChatScreen = () => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await fetchConnections();
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchConnections();
        setRefreshing(false);
    };

    const fetchConnections = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/chat/fetch-latest-messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setConnections(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setRefreshing(false);
        }
    };
    const navigationToChatUserScreen = (otheruserId) => {
        navigation.navigate('Chatuserscreen', { otheruserId })
    }

    return (
        <View style={styles.container}>
        {connections.length > 0 ? (
            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                data={connections}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigationToChatUserScreen(item.userId)}>
                        <View style={styles.chatItem}>
                            <Image source={{ uri: item.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                            <View style={styles.chatDetails}>
                                <Text style={styles.username}>{item.username}</Text>
                                {item.latestMessage && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.latestMessage, { color:  '#000' }]}>
                                            {item.latestMessage}
                                        </Text>
                                        <Text style={styles.timeAgo}>{formatDistanceToNow(new Date(item.timeAgo), { addSuffix: true })}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                />
                ) : (
                    <Text>you have no connections to chat with</Text>
                )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 1000
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    chatDetails: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    latestMessage: {
        fontSize: 14,
        flex: 1,
        maxWidth: '80%',
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
        marginLeft: 5,
    },
});

export default ChatScreen;
