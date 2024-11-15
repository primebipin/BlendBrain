import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import ConnectionCard from '../Components/UserConnectionCard';
import Userdetailcomponent from '../Components/UserDetailContainer';
import BASE_URL from '../api/api';


const timeAgo = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const seconds = Math.floor((now - createdAt) / 1000);
    if (seconds < 60) {
        return 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const options = { month: 'short', day: 'numeric' };
    return createdAt.toLocaleDateString('en-US', options);
};


const OtheruserProfileScreen = ({ route }) => {
    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchcomments, setfetchComments] = useState([]);
    const [showCommentInput, setShowCommentInput] = useState(null);
    const [activeView, setActiveView] = useState('posts');
    const [connections, setConnections] = useState([]);
    const [isconnected, setisConnected] = useState(false);
    const [sentconnection, setsentConnection] = useState(false);
    const [inmypendingconnection, setInmypendingconnection] = useState(false);
    const [liking, setLiking] = useState(null);
    const [commenting, setCommenting] = useState(false);
    //   const [pendingconnections, setPendingconnection] = useState([]);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const otheruserId = route.params.otheruserId;
    console.log(otheruserId);

    const handlechat = () => {
        const otheruserId = route.params.otheruserId;
        navigation.navigate('Chatuserscreen', { otheruserId });
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await checkconnection();
                await fetchUserProfile();
                await userfetchposts();
                await fetchconnections();
                await handlepost();
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchData();
        }
    }, [isFocused, otheruserId]);

    const handleRefresh = async() => {
        setRefreshing(true);
        await checkconnection();
        await fetchUserProfile();
        await userfetchposts();
        await fetchconnections();
        setRefreshing(false);
    };

    const checkconnection = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/otheruser/check-connection/${otheruserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.isconnected) {
                setisConnected(true);
                setsentConnection(false);
                setInmypendingconnection(false);
            } else if (response.data.connectionsent) {
                setisConnected(false);
                setsentConnection(true);
                setInmypendingconnection(false);
            } else if (response.data.inmypendingconnection) {
                setisConnected(false);
                setsentConnection(false);
                setInmypendingconnection(true);
            } else {
                setisConnected(false);
                setsentConnection(false);
                setInmypendingconnection(false);
            }

            console.log(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setRefreshing(false);
        }
    };

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
            await checkconnection();
            setInmypendingconnection(false);
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/otheruser/fetch-user/${otheruserId}`, {
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

    const fetchComments = async (postId) => {
        try {
            setCommenting(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/comments/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            //setfetchComments(response.data);
            setfetchComments({ ...fetchcomments, [postId]: response.data });
            console.log(response.data);

        } catch (error) {
            console.log("error fectching comment", error);
        } finally {
            setCommenting(false);
        }
    }

    const handleComment = async (postId, comment) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(
                `${BASE_URL}/user/comment/${postId}`,
                {
                    text: comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setComments('');
            await fetchComments(postId);
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };


    const userfetchposts = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/otheruser/posts/${otheruserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            setLiking(postId);
            const token = await AsyncStorage.getItem('token');
            await axios.post(
                `${BASE_URL}/user/like/${postId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            await userfetchposts();
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setLiking(null);
        }
    };

    const fetchconnections = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/otheruser/fetch-user-connections/${otheruserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setConnections(response.data.connectedUsers);
            //   setPendingconnection(response.data.pendingConnectionUsers);
            console.log(connections);
            //   console.log(pendingconnections);
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handlepost = async () => {
        // setRefreshing(true); 
        setActiveView('posts');
        // userfetchposts();
        // setRefreshing(false);
    }

    const handleconnection = () => {
        setActiveView('connections');
        // fetchconnections();
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
            handleRefresh();
            console.log(response.data);
        } catch (error) {
            console.error('error in sending connection request:', error);
        }

    }

    const renderPostItem = ({ item }) => {
        const handleToggleCommentInput = (postId) => {
            setShowCommentInput(showCommentInput === postId ? null : postId);
            if (showCommentInput !== postId) {
                fetchComments(item._id);
            }
        };

        const formattedTimeAgo = timeAgo(item.createdAt);

        return (
            <View style={styles.cardContainer} >
                <View style={styles.userdetailwithdelete}>
                    <View style={styles.userdetail}>
                        <Image source={{ uri: item.createdBy.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                        <View>
                            <Text style={styles.username}>{item.createdBy.username}</Text>
                            <Text >{formattedTimeAgo}</Text>
                        </View>
                    </View>
                    <View style={styles.deletepost}>

                    </View>
                </View>
                <Text style={styles.postText}>{item.text}</Text>

                {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
                <View style={styles.likecomment}>
                    <TouchableOpacity onPress={() => handleLike(item._id)}>
                        {liking == item._id ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.likeText}> {item.likes.length}Likes</Text>)}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleToggleCommentInput(item._id)}>
                        <Text style={styles.commentText}>Comments</Text>
                    </TouchableOpacity>
                </View>

                {showCommentInput === item._id && (
                    <>

                        <View style={styles.likecommentinput}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment"
                                value={comments[item._id] || ''}
                                onChangeText={(text) => setComments({ ...comments, [item._id]: text })}
                            />

                            <TouchableOpacity onPress={() => handleComment(item._id, comments[item._id])} style={styles.commentsentText} >
                                {/* <Text style={styles.commentText}>Comment</Text> */}
                                <FontAwesome name="send" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        {commenting ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <FlatList
                                data={fetchcomments[item._id] || []}
                                keyExtractor={(comment) => comment._id}
                                renderItem={({ item: comment }) => (
                                    <View style={styles.commentContainer}>
                                        <Image source={{ uri: comment.createdBy.profileImage || 'https://placekitten.com/200/200' }} style={styles.commentprofileImage} />
                                        <View>
                                            <Text style={styles.commenttext} >{comment.createdBy.username}</Text>
                                            <Text>{comment.text}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}
            </View>
        );
    };


    return (
        <>
            {/* <Header title="BrainBulb" /> */}
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.centeredContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
                        <View style={styles.currentuserdetailcontainer}>
                            <View style={styles.currentuserdetail}>
                                <Image source={{ uri: user.profileImage || 'https://placekitten.com/200/200' }} style={styles.userprofileImage} />
                                <View style={styles.nameTextx}>
                                    <Text style={styles.nameText}>{user.name}</Text>
                                    {user.bio && <Text style={styles.nameTextbio}>{user.bio}</Text>}
                                </View>
                            </View>
                            <Userdetailcomponent user={user} />
                        </View>
                        <View>
                            {inmypendingconnection ? (
                                <>
                                    <View style={styles.acceptx}>
                                        <TouchableOpacity style={styles.accept} onPress={() => handleaccept(user._id)}>
                                            <Text style={styles.text}>accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.imagecontainer}>
                                        <Image
                                            source={require('../assets/hello.png')}
                                            style={styles.image}
                                        />
                                    </View>
                                </>

                            ) : sentconnection ? (
                                <>
                                    <View style={styles.acceptx}>
                                        <View style={styles.accept} >
                                            <Text style={styles.text}>Connection request sent</Text>
                                        </View>
                                    </View>
                                    <View style={styles.imagecontainer}>
                                        <Image
                                            source={require('../assets/hello.png')}
                                            style={styles.image}
                                        />
                                    </View>
                                </>
                            ) : (!isconnected && !sentconnection && !inmypendingconnection) ? (
                                <>
                                    <View style={styles.acceptx}>
                                        <TouchableOpacity style={styles.accept} onPress={() => onSendRequest(user._id)}>
                                            <Text style={styles.text}>Send Request</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.imagecontainer}>
                                        <Image
                                            source={require('../assets/hello.png')}
                                            style={styles.image}
                                        />
                                    </View>
                                </>
                            ) : isconnected ? (
                                <>
                                    <View style={styles.buttonContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <TouchableOpacity
                                                style={[styles.sectionButton, activeView === 'posts' && styles.activeButton]}
                                                onPress={() => handlepost()}>
                                                <Text style={styles.nameText}>Posts</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.sectionButton, activeView === 'connections' && styles.activeButton]}
                                                onPress={() => handleconnection()}>
                                                <Text style={styles.nameText}>{connections.length}Connections</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.sectionButton}
                                                onPress={() => handlechat()}>
                                                <Text style={styles.nameText}>Chat</Text>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    </View>
                                    {activeView === 'posts' && (
                                        <View style={styles.postcard}>
                                            {posts.length === 0 ? (
                                                <Image source={{
                                                    uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707049271/y1khslwg6vwefkhup12o.jpg'
                                                }}
                                                    style={styles.nodata}

                                                />
                                            ) : (
                                                <FlatList
                                                    data={posts}
                                                    keyExtractor={(item) => item._id}
                                                    renderItem={renderPostItem}
                                                    refreshing={refreshing}
                                                    onRefresh={userfetchposts} />
                                            )}
                                        </View>
                                    )}

                                    {activeView === 'connections' && (
                                        <View style={styles.postcard}>
                                            {connections.length === 0 ? (
                                                <Image source={{
                                                    uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707049271/y1khslwg6vwefkhup12o.jpg'
                                                }}
                                                    style={styles.nodata}

                                                />
                                            ) : (
                                                <FlatList
                                                    data={connections}
                                                    keyExtractor={(item) => item._id}
                                                    renderItem={({ item }) => (
                                                        <ConnectionCard connections={item} />
                                                    )}
                                                    refreshing={refreshing}
                                                    onRefresh={handleconnection} />
                                            )}
                                        </View>
                                    )}

                                </>
                            ) : null}


                        </View>

                    </ScrollView>
                )}
            </View></>


    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginBottom: 1,
        // paddingHorizontal: 8,
    },
    likecommentinput: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        //gap: 15,
        paddingLeft: 16,
        marginVertical: 10,
        justifyContent: 'space-between',
    },
    commentInput: {
        marginBottom: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '85%',
    },
    commentsentText: {
        paddingRight: 20,
        paddingVertical: 8,
    },
    postcard: {
        marginBottom: 10,
        marginTop: 0,
    },
    sectionButton: {
        // flex: 1,
        justifyContent: 'space-between',
        // alignItems: 'center',
        marginHorizontal: 10,
        paddingVertical: 12,

        // borderBottomColor: '#fff',
    },
    activeButton: {
        // borderColor: 'blue',
        borderBottomWidth: 2,
    },

    likecomment: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        //gap: 15,
        paddingLeft: 16,
        marginVertical: 10,
        justifyContent: 'space-between',
    },
    deletepost: {
        marginRight: 25,

    },
    postImage: {
        width: 400,
        height: 400,
        marginBottom: 8,
    },
    likeText: {
        color: '#000',
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentText: {
        color: '#000',
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
        paddingRight: 10,
    },
    userdetailwithdelete: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //alignItems: 'center',
        gap: 15,
        paddingLeft: 15,
        paddingTop: 18,
    },
    container: {
        flex: 1,
        //alignItems: 'center',
        //justifyContent: 'center',
        //backgroundColor: 'green'
    },
    userprofileImage: {
        width: 100,
        height: 100,
        borderRadius: 75,
        marginBottom: 20,
    },
    userdetail: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        gap: 15,
    },
    currentuserdetail: {
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
    },
    // detailsContainer: {
    //   //alignItems: 'center',
    //   marginBottom: 1,
    // },
    nameTextx: {

        marginBottom: 40,

    },
    text: {

        color: '#fff',
    },
    acceptx: {
        backgroundColor: '#fff',

    },
    accept: {
        backgroundColor: '#000',
        marginBottom: 20,
        marginLeft: 10,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
        width: '40%',

    },
    nameTextbio: {
        fontStyle: 'italic'
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    detailsContainertext: {
        color: '#000',
        fontSize: 13,
    },
    adminText: {
        marginTop: 10,
        fontStyle: 'italic',
        color: 'gray',
    },
    updateButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonTextx: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardContainer: {
        marginBottom: 6,
        backgroundColor: '#fff',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 0.5,
    },
    currentuserdetailcontainer: {
        // marginBottom: 1,
        padding: 16,
        backgroundColor: '#fff',

    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    touchableOpacity: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    commentprofileImage: {
        width: 35,
        height: 35,
        borderRadius: 25,
        marginBottom: 8,
    },
    postText: {
        marginBottom: 5,
        paddingLeft: 16,
    },
    commentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        marginHorizontal: 16,
        gap: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nodata: {
        width: '100%',
        height: 500
    },
    image: {
        width: '100%',
        height: 300
    },
    imagecontainer: {
        flex: 1,
        marginTop: 10
    },
});

export default OtheruserProfileScreen;
