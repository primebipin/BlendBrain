import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../api/api';


const UpdateProfileScreen = () => {
    const [name, setName] = useState('');
    const [username, setUserName] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [college, setCollege] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const handleSetUserName = (input) => {
        setUserName(input.toLowerCase());
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
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            console.log(token);
            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
            formData.append('year', year);
            formData.append('college', college);
            formData.append('branch', branch);
            //formData.append('studyingIn', studyingIn);
            formData.append('bio', bio);
            if (profileImage) {
                formData.append('profileImage', {
                    name: 'profileImage',
                    type: 'image/jpeg',
                    uri: profileImage,

                });

            }
            console.log(profileImage);
            const response = await axios.put(`${BASE_URL}/user/updateprofile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.existingusername) {
                Alert.alert('Error', 'This username is alraeady taken please try other');
                return;
            }
            console.log('Profile updated successfully:', response.data);
            setProfileImage('');
            navigation.navigate('profileview');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setRefreshing(false);
        }

    };

    return (
        <>
            {/* <Header title="BrainBulb" /> */}
            <ScrollView contentContainerStyle={styles.container}>
                {refreshing ? (
                    <ActivityIndicator size="medium" color="#000" />
                ) : (
                    <>
                        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                            {profileImage && (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            )}
                            {!profileImage && <><Text style={styles.selectImageText}>Select Image</Text><Entypo name="image" size={24} color="black" /></>}
                        </TouchableOpacity>
                        <Text style={styles.label}>Name:</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name" />
                        <Text style={styles.label}>username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUserName}
                            placeholder="Enter your username"
                            autoCapitalize="none" />

                        <Text style={styles.label}>year</Text>
                        <TextInput
                            style={styles.input}
                            value={year}
                            onChangeText={setYear}
                            placeholder="Enter your college year" />

                        <Text style={styles.label}>Branch</Text>
                        <TextInput
                            style={styles.input}
                            value={branch}
                            onChangeText={setBranch}
                            placeholder="Enter your branch name" />

                        <Text style={styles.label}>College</Text>
                        <TextInput
                            style={styles.input}
                            value={college}
                            onChangeText={setCollege}
                            placeholder="Enter your college name" />


                        <Text style={styles.label}>Short Bio:</Text>
                        <TextInput
                            style={styles.input}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            placeholder="Enter a short bio" />

                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
                            <Text style={styles.buttonText}>Update Profile</Text>
                        </TouchableOpacity>
                    </>
                )} 
            </ScrollView></>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    imageContainer: {
        //alignItems: 'center',
        marginBottom: 1,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    selectImageText: {
        color: '#000',
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    updateButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UpdateProfileScreen;
