import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import BASE_URL from '../api/api';


const Userdetailcomponent = ({ user }) => {
    return (
        <View style={styles.detailsContainer}>
            {user.username && (
                <View style={styles.detailsItem}>
                    <Entypo name="user" size={20} color="black" />
                    <Text style={styles.detailsContainertext}>{user.username}</Text>
                </View>
            )}

            {user.college && (
                <View style={styles.detailsItem}>
                    <Entypo name="graduation-cap" size={20} color="black" />
                    <Text style={styles.detailsContainertext}>Studying in {user.college}</Text>
                </View>
            )}

            {user.branch && (
                <View style={styles.detailsItem}>
                    <Entypo name="briefcase" size={20} color="black" />
                    <Text style={styles.detailsContainertext}>Studying in {user.branch}</Text>
                </View>
            )}

            {user.year && (
                <View style={styles.detailsItem}>
                    <Entypo name="calendar" size={20} color="black" />
                    <Text style={styles.detailsContainertext}>Studying in {user.year}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    detailsContainertext: {
        color: '#000',
        fontSize: 15,
        fontWeight: '400'
    },
    detailsItem: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 5
    },
});

export default Userdetailcomponent;
