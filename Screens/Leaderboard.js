import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import BASE_URL from '../api/api';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [user, setUser] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
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
    if (isFocused) {
      fetchUserProfile();
      fetchLeaderboard();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    await fetchUserProfile();
    await fetchLeaderboard();
  };

  const navigateToOtherUserProfile = (otheruserId) => {
    const userId = user._id;

    if (userId === otheruserId) {
      console.log('Navigating to Profile');
      navigation.navigate('Profile');
      // navigation.navigate('Home', {
      //   screen: 'Profile',
      // });

    } else {
      console.log('Navigating to Otheruserprofile');
      navigation.navigate('Otheruserprofile', { otheruserId });
      // navigation.navigate('Home', {
      //   screen: 'Otheruserprofile',
      //   params: { otheruserId  },
      // });
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/document/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setLeaderboardData(response.data.leaderboard);
      } else {
        console.error('Error fetching leaderboard:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View style={styles.container}>
        {/* <View style={styles.leaderboard}>
          <MaterialIcons name="leaderboard" size={24} color="black" />
          <Text style={styles.title}>Leaderboard</Text>
        </View> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <MaterialIcons name="leaderboard" size={24} color="black" />
          <Text style={{ fontSize: 20, marginLeft: 5 }}>Leaderboard</Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Rank</Text>
          <Text style={styles.headerCell}>username</Text>
          <Text style={styles.headerCell}>TotalCoins</Text>
        </View>
        {refreshing ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <FlatList
            data={leaderboardData}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.leaderboardItem}>
                <Text style={styles.rank}>{index + 1}</Text>
                <TouchableOpacity onPress={() => navigateToOtherUserProfile(item._id)}>
                  <Text style={styles.cellLink}>{item.username}</Text>
                </TouchableOpacity>
                <Text style={styles.views}>{item.totalViews} Coins</Text>
              </View>
            )}
          />
        )}
      </View>
      <View style={styles.faqContainer}>
        <Text style={styles.faqQuestion}>How does this leaderboard work?</Text>
        <Text style={styles.faqAnswer}>
          The leaderboard highlights the top-performing users, showcasing the individuals whose submitted documents have garnered the highest total views. This metric encapsulates the collective engagement garnered by each user's uploaded content, reflecting the cumulative impact of their contributions within the platform's community.
        </Text>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 10,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 12
  },

  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rank: {
    fontSize: 16,
  },
  username: {
    fontSize: 15,
    marginLeft: 8,
  },
  views: {
    fontSize: 15,
    marginRight: 8,
  },
  cellLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  faqContainer: {
    marginVertical: 16,
    marginHorizontal: 10,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 16,
  },
});

export default Leaderboard;
