import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image,Alert, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Entypo } from '@expo/vector-icons';
import ConnectionCard from '../Components/UserConnectionCard';
import PendingConnectionCard from '../Components/PendingConnectionCard';
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


const ProfileScreen = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchcomments, setfetchComments] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [activeView, setActiveView] = useState('posts');
  const [connections, setConnections] = useState([]);
  const [pendingconnections, setPendingconnection] = useState([]);
  const [liking, setLiking] = useState(null);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchUserProfile();
        await fetchconnections();
        await userfetchposts();
        await fetchpendingconnections();
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
  }, [isFocused]);

  const handleRefresh = async() => {
    setRefreshing(true);
    await fetchUserProfile();
    await userfetchposts();
    await fetchconnections();
    await fetchpendingconnections();
    setRefreshing(false);
  };

  const fetchUserProfile = async () => {
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


  const userfetchposts = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/user/profile/posts`, {
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
  const handledelete = async (postId) => {
    try {
      setDeleting(postId);
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/user/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await userfetchposts();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleting(false);
    }
  };

  const fetchconnections = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/user/fetch-user-connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchpendingconnections = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/user/fetch-user-pendingconnections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingconnection(response.data);
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
  const handleconnectionrequest = () => {
    setActiveView('pendingconnections');
    // fetchpendingconnections();
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
          <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Document',
                          'Are you sure you want to delete this post?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'OK',
                              onPress: () => handledelete(item._id),
                            },
                          ]
                        );
                      }}
                    >
                      {deleting === item._id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Entypo name="trash" size={24} color="red" />)}
                    </TouchableOpacity>
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
                  <Text style={styles.nameText}>{connections.length} Connections</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sectionButton, activeView === 'pendingconnections' && styles.activeButton]}
                  onPress={() => handleconnectionrequest()}>
                  <Text style={styles.nameText}>{pendingconnections.length} Connection Requests</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.sectionButton}
                  onPress={handleUpdateProfile}>
                  <Text style={styles.nameText}>Update Profile</Text>
                </TouchableOpacity> */}
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

            {activeView === 'pendingconnections' && (
              <View>
                {pendingconnections.length === 0 ? (
                  <Image source={{
                    uri: 'https://res.cloudinary.com/dar4ws6v6/image/upload/v1707049271/y1khslwg6vwefkhup12o.jpg'
                  }}
                    style={styles.nodata}

                  />
                ) : (
                  <FlatList
                    data={pendingconnections}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <PendingConnectionCard connections={item} handleconnectionrequest={handleconnectionrequest} />
                    )}
                    refreshing={refreshing}
                    onRefresh={handleconnection} />
                )}
              </View>
            )}
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
  nameTextbio: {
    fontStyle: 'italic'
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
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
  buttonText: {
    color: 'green',
    fontSize: 16,
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
  }
});

export default ProfileScreen;


