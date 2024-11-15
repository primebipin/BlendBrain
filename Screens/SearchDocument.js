import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator, RefreshControl, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import BASE_URL from '../api/api';

const SearchDocument = () => {
  const [subjectName, setSubjectName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [topViewed, setTopViewed] = useState([]);
  const [user, setUser] = useState({});
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
      fetchTopViewed();
    }
  }, [isFocused]);

  const navigateToOtherUserProfile = (otheruserId) => {
    const userId = user._id;

    if (userId === otheruserId) {
      console.log('Navigating to Profile');
      navigation.navigate('Profile');
    } else {
      console.log('Navigating to Otheruserprofile');
      navigation.navigate('Otheruserprofile', { otheruserId });
    }
    // navigation.navigate('Otheruserprofile', {otheruserId });
  };

  const handleRefresh = async () => {
    fetchTopViewed();
  };

  const fetchTopViewed = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/document/top-views`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setTopViewed(response.data.topDocuments);
      } else {
        setTopViewed([]);
      }
    } catch (error) {
      console.error('Error fetching top-viewed documents:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const handleDownload = async (documentId, pdfLink) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/document/incrementViews`,
        { documentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Linking.openURL(pdfLink);
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      if (!subjectName) {
        Alert.alert('Error', 'Please provide subject name ');
        return;
      }
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/document/search?subjectName=${subjectName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSearchResults(response.data.documents);
      } else {
        setSearchResults([]);
        Alert.alert('No Results', 'No documents found with the given subject name.');
      }
      setSubjectName('');
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setSearching(false);
    }
  };


  return (
    <>
      {/* <Header title="BrainBulb" /> */}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Enter subject name"
            value={subjectName}
            onChangeText={setSubjectName} />
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
            <Text style={styles.resultsTitle}>Search Results:</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Subject Name</Text>
              <Text style={styles.headerCell}>uploadedBy</Text>
              <Text style={styles.headerCell}>Downloads</Text>
              <Text style={styles.headerCell}>Download</Text>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.documentItem}>
                  <Text style={styles.cell}>{item.subjectname}</Text>
                  <TouchableOpacity onPress={() => navigateToOtherUserProfile(item.uploadedBy._id)}>
                    <Text style={styles.cellLink}>{item.uploadedBy.username}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.cellview}>{item.views}</Text>
                    <MaterialIcons name="cloud-done" size={24} color="black" />
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(item._id, item.pdf)}
                  >
                    <Entypo name="download" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )} />
          </View>}
        <View style={styles.container}>
          <Text style={styles.resultsTitle}>Top Viewed Documents:</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Subject Name</Text>
            <Text style={styles.headerCell}>uploadedBy</Text>
            <Text style={styles.headerCell}>Downloads</Text>
            <Text style={styles.headerCell}>Download</Text>
          </View>
          {refreshing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <FlatList
              data={topViewed}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.documentItem}>
                  <Text style={styles.cell}>{item.subjectname}</Text>
                  <TouchableOpacity onPress={() => navigateToOtherUserProfile(item.uploadedBy._id)}>
                    <Text style={styles.cellLink}>{item.uploadedBy.username}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.cellview}>{item.views}</Text>
                    <MaterialIcons name="cloud-done" size={24} color="black" />
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(item._id, item.pdf)}
                  >
                    <Entypo name="download" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 12
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    borderRadius: 12
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
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cell: {
    width: '20%',
    fontSize: 12,
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
  downloadButton: {
    // backgroundColor: '#000',
    padding: 4,
    borderRadius: 5,
    alignItems: 'center',
  },
  cellLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  cellview: {
   fontWeight: 'bold',
   marginRight: 2
  }
});

export default SearchDocument;
