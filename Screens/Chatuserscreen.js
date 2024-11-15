import React, { useState, useEffect,useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, FlatList, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../api/api';


const ChatScreen = ({ route }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const otheruserId = route.params.otheruserId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await fetchUserProfile();
                await fetchCurrentUserProfile();
                await fetchMessages();
                console.log('this is other user', user);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        if (otheruserId) {
            fetchData();
        }

    }, [otheruserId]);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/chat/messages/${otheruserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            setMessages(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(`${BASE_URL}/chat/sendMessage`, {
                sender: currentUser._id,
                receiver: user._id,
                text: message,

            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            await fetchMessages();
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    };

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/otheruser/fetch-user/${otheruserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            console.log('otheruser information', response.data);
        } catch (error) {
            console.error('Error fetching other user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUserProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/fetch-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCurrentUser(response.data);
            console.log('current user information', response.data);
        } catch (error) {
            console.error('Error fetching current user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="small" color="#000" />;
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <FlatList
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={[styles.messageContainer, { alignSelf: item.sender === currentUser._id ? 'flex-end' : 'flex-start' }]}>
                        {item.sender !== currentUser._id && (
                            <Image
                                source={{ uri: user.profileImage || 'https://placekitten.com/200/200' }}
                                style={styles.profileImage}
                            />
                        )}
                        <View style={[styles.messageContentContainer, { backgroundColor: item.sender === currentUser._id ? '#000' : '#fff' }]}>
                            <Text style={styles.messageTime}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Text>
                            <Text style={[styles.messageText, { color: item.sender === currentUser._id ? '#fff' : '#000' }]}>{item.content}</Text>

                        </View>
                        {item.sender === currentUser._id && (
                            <Image
                                source={{ uri: currentUser.profileImage || 'https://placekitten.com/200/200' }}
                                style={styles.profileImage}
                            />
                        )}

                    </View>
                )}

            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message..."
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        marginHorizontal: 10,
        alignItems: 'flex-end',
        // marginBottom: 50
    },
    messageContentContainer: {
        borderRadius: 8,
        //padding: 10,
        elevation: 100,
        maxWidth: '80%',
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
        marginLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ChatScreen;
