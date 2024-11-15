import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import auth from "@react-native-firebase/auth";
import BASE_URL from '../api/api';

const SignInScreen = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); 
  const [otpVerified, setOtpVerified] = useState(false); 
  const navigation = useNavigation();

  const onAuthStateChanged = async (user) => {
    if (user) {
      setOtpVerified(true); 
      await handleSignIn();
      Alert.alert('OTP Verified🎉🎉', 'The OTP has been verified automatically😎.');
    }
  }

  useEffect(() => {
    if (otpSent === true) {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return subscriber; 
    }
  }, [otpSent]);
  
  const signInwithphonenumber = async () => {
    try {
      setLoading(true);
      if (!mobileNumber) {
        throw new Error('Please enter your mobile number');
      }
      if (!/^[0-9]{10}$/.test(mobileNumber)) {
        throw new Error('Invalid mobile number. Please enter a 10-digit number');
      }
      const fullPhoneNumber = `+91${mobileNumber}`;
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setConfirm(confirmation);
      setOtpSent(true); 
    } catch (error) {
      console.log("error sending code", error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  
  const confirmCode = async () => {
    try {
      setLoading(true);
      if (!code) {
        Alert.alert("Error", "Please enter code first");
        return;
      }
      const usercredential = await confirm.confirm(code);
      const user = usercredential.user;
      if (user) {
        await handleSignIn();
      }
    } catch (error) {
      console.log("invalid code", error);
      Alert.alert("Error☹️", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/login`, { mobileNumber });
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      console.log('Sign-in response:', response.data);
      await fetchUser();
    } catch (error) {
      console.error('Sign-in error:', error.message);
      Alert.alert(' Unexpected Error', error.message);
    } finally {
      setLoading(false);
      setOtpVerified(false);
      setOtpSent(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/user/fetch-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigateBasedOnVerification(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  
  const navigateBasedOnVerification = (user) => {
    console.log(user.isVerified);
    if (user && user.isVerified) {
      navigation.navigate('Home1');
    } else {
      navigation.navigate('createprofile');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imagecontainer}>
        <Image
          source={require('../assets/sigin.png')}
          style={styles.image}
        />
      </View>
      <View style={styles.notimagecontainer}>
        {!confirm ? (
          <>
            <Text style={styles.title}>Sign In</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.input}
                placeholder="Enter your 10 digit mobile number"
                onChangeText={(text) => setMobileNumber(text)}
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verify OTP</Text>
            <TextInput
              style={[styles.input, { opacity: otpVerified ? 0.5 : 1 }] }
              placeholder="Enter the OTP sent"
              keyboardType="numeric"
              onChangeText={(text) => setCode(text)}
              editable={!otpVerified} 
            />
            <TouchableOpacity
              style={[styles.button, { opacity: otpVerified ? 0.5 : 1 }]} 
              onPress={confirmCode}
              disabled={loading || otpVerified} 
            >
              {loading || otpVerified ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
            {otpSent && !otpVerified && (
              <Text style={styles.sentOtpText}>OTP sent to +91{mobileNumber}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notimagecontainer: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    marginBottom: 40
  },
  image: {
    width: '100%',
    height: 500
  },
  imagecontainer: {
    flex: 1,
    marginTop: 40
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sentOtpText: {
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  }
});

export default SignInScreen;
