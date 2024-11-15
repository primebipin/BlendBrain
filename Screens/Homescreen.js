import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ActivityIndicator, RefreshControl, FlatList, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import UserCardList from '../Components/NonConnecteduser';
import { CommonActions } from '@react-navigation/native';
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



const Homescreen = () => {
    const [text, setText] = useState('');
    const [image, setImage] = useState('');
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [fetchcomments, setfetchComments] = useState([]);
    const [showCommentInput, setShowCommentInput] = useState(null);
    const [user, setUser] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [liking, setLiking] = useState(null);
    const [commenting, setCommenting] = useState(false);
    const [token, setToken] = useState(null);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const fetchuser = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/fetch-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setRefreshing(false);
        }
    }


    const handleotheruser = (otheruserId) => {
        const userId = user._id;
        if (userId === otheruserId) {
            navigation.navigate('Profile');
        } else {
            navigation.navigate('Otheruserprofile', { otheruserId });
        }
    }

    const fetchposts = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/user/posts`, {
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });
        console.log(result);
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        const fetchdata = async () => {
            const isAuthenticated = await Checkauth();
            if (isAuthenticated) {
                await fetchposts();
                await fetchuser();
            }
        };
        if (isFocused) {
            fetchdata();
        }
    }, [isFocused]);

    
    const Checkauth = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Authscreen' }],
                })
            );
            return false;
        }
        return true;
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchuser();
        await fetchposts();
        setRefreshing(false);
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


    const handlePost = async () => {
        try {
            setLoading(true);
            if(!text && !image){
                Alert.alert("Error", "you can not post blank");
                return;
            }
            const token = await AsyncStorage.getItem('token');
            const formdata = new FormData();
            formdata.append('text', text);
            if (image) {
                formdata.append('image', {
                    name: 'image',
                    type: 'image/jpeg',
                    uri: image,
                });
            }
            console.log(image);
            const response = await axios.post(
                `${BASE_URL}/user/posts`, formdata,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log('Post created successfully:', response.data);
            setText('');
            setImage('');
            await fetchposts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
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
            await fetchposts();
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setLiking(null);
        }
    };

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

                <TouchableOpacity onPress={() => handleotheruser(item.createdBy._id)} style={styles.userdetail}>
                    <Image source={{ uri: item.createdBy.profileImage || 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                    <View>
                        <Text style={styles.username}>{item.createdBy.username}</Text>
                        <Text >{formattedTimeAgo}</Text>
                    </View>
                </TouchableOpacity>

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
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
                    <View style={styles.admincardContainer}>
                        <View style={styles.adminContainer}>
                            <Image source={{ uri: user.profileImage || 'https://placekitten.com/200/200' }} style={{ width: 50, height: 50, borderRadius: 75, }} />
                            <TextInput
                                placeholder="Write your post here..."
                                value={text}
                                onChangeText={setText}
                                multiline
                                style={styles.writepostinput} />
                            <TouchableOpacity onPress={pickImage} style={styles.pickimage}>
                                {image && <Entypo name="cross" size={24} color="black" onPress={() => { setImage(''); }} />}
                                {!image && <Entypo name="image" size={24} color="black" />}
                            </TouchableOpacity>

                        </View>
                    </View>
                    <TouchableOpacity onPress={pickImage}>
                        {image && <Image source={{ uri: image }} style={{ width: 400, height: 400, marginBottom: 8, }} />}
                        {loading && (
                            <ActivityIndicator size="small" color="#000" style={styles.activityIndicator} />
                        )}
                    </TouchableOpacity>
                    <View style={styles.admincardContainerpost}>
                        <TouchableOpacity onPress={handlePost} style={styles.touchableOpacity}>
                            <Text style={styles.buttonText}>post</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: "#fff", marginBottom: 2 }}>
                        <UserCardList />
                    </View>
                    <View style={styles.postcard}>
                        <FlatList
                            data={posts}
                            keyExtractor={(item) => item._id}
                            renderItem={renderPostItem}
                            refreshing={refreshing}
                            onRefresh={fetchposts} />
                    </View>
                    <View style={styles.postcard}>
                        <View style={styles.cardContainer} >
                            <View style={styles.userdetail}>
                                <Image source={{ uri: 'https://placekitten.com/200/200' }} style={styles.profileImage} />
                                <View>
                                    <Text style={styles.username}>Saurabh kumar</Text>
                                    <Text >From Admin</Text>
                                </View>
                            </View>

                            <Text style={styles.postText}>
                                🌟 Introducing Blendbrain - Where Knowledge Meets Innovation! 🌟
                            </Text>
                            <Text style={styles.postText}>
                                🚀 Join us on a journey of boundless learning and groundbreaking discoveries BlendBrain - the ultimate destination for intellectual exploration and community engagement. 🚀
                            </Text>
                            <Text style={styles.postText}>
                                At Blendbrain, we're not just another app - we're a thriving ecosystem where minds converge, ideas flourish, and dreams become reality. With a plethora of cutting-edge features and a vibrant community of scholars, professionals, and enthusiasts, we're redefining the way you interact with knowledge.
                            </Text>
                            <Text style={styles.postText}>
                                🔥 Ignite your passion for learning and Connect with like-minded individuals, share insights, and embark on intellectual adventures that will broaden your horizons and inspire innovation.
                            </Text>
                            <Text style={styles.postText}>
                                🌐 Join a global network of visionaries With Blendbrain, the possibilities are limitless - because when knowledge meets innovation, anything is possible.
                            </Text>
                            <Text style={styles.postText}>
                                Experience the power of knowledge. Blendbrain.

                            </Text>

                            {/* {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />} */}
                        </View>
                    </View>

                </ScrollView>
            </View>
        </>

    );
};

const styles = StyleSheet.create({
    // container: {
    //     marginBottom: 20,
    // },
    postcard: {
        marginBottom: 10,
        marginTop: 0,
    },
    userdetail: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        gap: 15,
        paddingLeft: 15,
        paddingTop: 15,
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
    likecommentinput: {
        flexDirection: 'row',
        //justifyContent: 'center',
        //alignItems: 'center',
        //gap: 15,
        paddingLeft: 16,
        marginVertical: 10,
        justifyContent: 'space-between',
    },
    adminContainer: {
        marginBottom: 5,
        padding: 5,
        // backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 4,
        // elevation: 4,
    },
    writepostinput: {
        borderWidth: 1,
        width: '70%',
        padding: 5,
        borderRadius: 12,
    },
    admincardContainer: {

        paddingHorizontal: 16,
        paddingVertical: 5,
        backgroundColor: '#fff',
        // borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    admincardContainerpost: {
        marginBottom: 5,
        paddingHorizontal: 16,
        paddingVertical: 5,
        backgroundColor: '#fff',
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
        color: '#fff',
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
    commentsentText: {
        paddingRight: 20,
        paddingVertical: 8,
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
    commentAuthor: {
        color: "#000"
    },
    activityIndicator: {
        ...StyleSheet.absoluteFillObject,
    },
    // commentAuthor: {
    //   fontStyle: 'italic',
    // },
    commenttext: {
        color: "#000"
    }
});

export default Homescreen;
