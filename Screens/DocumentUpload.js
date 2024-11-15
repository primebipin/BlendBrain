import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Linking, TouchableOpacity, ActivityIndicator, RefreshControl, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BASE_URL from '../api/api';


const DocumentUpload = () => {
  const [subjectName, setSubjectName] = useState('');
  const [file, setFile] = useState('');
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const [deleting, setDeleting] = useState(null);
  const [isValidDriveUrl, setIsValidDriveUrl] = useState(false);

  const handleRefresh = async () => {
    fetchDocuments();
  };

  const handleInputChange = (text) => {
    setFile(text);
    const isValid = validateDriveUrl(text);
    setIsValidDriveUrl(isValid);

  };

  const validateDriveUrl = (url) => {
    const driveUrlRegex = /^https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([^\/\?]+)/;
    return driveUrlRegex.test(url);
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

  const fetchDocuments = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/document/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setDocuments(response.data.documents);
      } else {
        Alert.alert('Error', 'Failed to fetch documents.');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDocuments();
    }
  }, [isFocused]);

  const handleUpload = async () => {

    if (!subjectName) {
      Alert.alert('Error', 'Please provide subject name ');
      return;
    }
    if (!file) {
      Alert.alert('Error', 'Please provide a link.');
      return;
    }
    if (!isValidDriveUrl) {
      Alert.alert('Error', 'Please provide a valid Google Drive link.');
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/document/upload`, { subjectName, file }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        Alert.alert('Upload Successful', 'File uploaded successfully.');
        console.log(response.data);
        setFile('');
        setSubjectName("");
        await fetchDocuments();
      } else {
        Alert.alert('Upload Failed', 'Failed to upload the file.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      setDeleting(documentId);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(
        `${BASE_URL}/document/${documentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchDocuments();
        Alert.alert('Success', 'Document deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete the document.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {/* <Header title="BrainBulb" /> */}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={styles.container}>
          <Text style={styles.label}>Subject Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter subject name"
            value={subjectName}
            onChangeText={setSubjectName}
          />
          <Text style={styles.label}>Enter the public Google Drive URL of your document:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter file Google Drive link"
            value={file}
            onChangeText={handleInputChange}
          />


          {/* Additional UI components if needed */}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upload Document</Text>
            )}

          </TouchableOpacity>
        </View>
        {documents.length === 0 && (
          <View style={styles.noDocumentsContainer}>
            <Text style={styles.noDocumentsText}>
              It appears you haven't uploaded any documents yet. Consider sharing your expertise by uploading helpful documents that can benefit others in the community😊.
            </Text>
          </View>
        )}

        {documents.length > 0 &&
          <View style={styles.container}>
            <Text style={styles.documentsTitle}>Documents uploaded by you:</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Subject Name</Text>
              <Text style={styles.headerCell}>Downloads</Text>
              <Text style={styles.headerCell}>Download</Text>
              <Text style={styles.headerCell}>Delete</Text>
            </View>
            {refreshing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <FlatList
                data={documents}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.documentItem}>
                    <Text style={styles.cell}>{item.subjectname}</Text>
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
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Document',
                          'Are you sure you want to delete this document?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'OK',
                              onPress: () => handleDelete(item._id),
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
                )}
              />)}
          </View>
        }
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
  noDocumentsContainer: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center'
  },
  noDocumentsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555'
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    borderRadius: 12
  },
  uploadButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  documentsTitle: {
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
    width: '30%',
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
  documentName: {
    fontSize: 16,
  },
  documentViews: {
    // Add styles as needed
  },
  downloadButton: {
    padding: 4,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  cellview: {
    fontWeight: 'bold',
    marginRight: 2
   }
});

export default DocumentUpload;


