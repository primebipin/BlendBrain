import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Image,Alert, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import BASE_URL from '../api/api';

const SearchUserScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [nonconnecteduser, setnonConnecteduser] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        if (isFocused) {
            fetchnonconnecteduser();
        }
    }, [isFocused]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchnonconnecteduser();
        setRefreshing(false);
    };

    const navigateToOtherUserProfile = (otheruserId) => {
        navigation.navigate('Otheruserprofile', { otheruserId });
    };

    const handleSearch = async () => {
        try {
            setSearching(true);
            if (!searchQuery) {
                Alert.alert('Error', 'Please provide username');
                return;
              }
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/otheruser/search?username=${searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSearchResults(response.data);
            setSearchQuery('');
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const fetchnonconnecteduser = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/document/fetch-non-connected-user`, {
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
                await fetchnonconnecteduser();
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
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
            <View style={styles.containercontain}>
                <View style={styles.container}>
                    <Text style={styles.searchtext}>Search User</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter  username"
                        value={searchQuery}
                        onChangeText={setSearchQuery} />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        {searching ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Search</Text>
                        )}
                    </TouchableOpacity>
                </View>
                {searchResults.length > 0 &&
                    <View style={styles.container}>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <>

                                    <TouchableOpacity onPress={() => navigateToOtherUserProfile(item._id)}>
                                        <View style={styles.userCard}>
                                            <Image source={{ uri: item.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                                            <Text style={styles.username}>{item.username}</Text>
                                        </View>
                                    </TouchableOpacity>

                                </>
                            )}
                        />
                    </View>
                }
                {nonconnecteduser.length > 0 &&
                    <View style={styles.container}>

                        <Text style={styles.text}>people to connect</Text>

                        <FlatList
                            data={nonconnecteduser}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => <UserCard user={item} />} />

                    </View>
                }

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    searchtext: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardContainerx: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#000',
        padding: 2,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 1,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        alignItems: 'center'
    },
    container: {
        marginVertical: 16,
        marginHorizontal: 10,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#fff',
        elevation: 1000,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderRadius: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
        borderRadius: 10,
    },
    searchButton: {
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },

    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    username: {
        fontSize: 16,
    },
});

export default SearchUserScreen;
