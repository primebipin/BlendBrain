import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BASE_URL from '../api/api';

const Coinscreen = () => {
    const [totalCoins, setTotalCoins] = useState(0);
    const [equivalentRupees, setEquivalentRupees] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchTotalCoins();
        }
    }, [isFocused]);

    const fetchTotalCoins = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/document/totalcoins`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setTotalCoins(response.data.totalCoins);
                calculateEquivalentRupees(response.data.totalCoins);
            } else {
                console.error('Error fetching total coins:', response.data.error);
            }
        } catch (error) {
            console.error('Error fetching total coins:', error);
        }
    };

    const calculateEquivalentRupees = (coins) => {
        const rupees = coins / 10;
        setEquivalentRupees(rupees.toFixed(2));
    };

    const handleWithdraw = async () => {
        if (totalCoins < 500) {
            Alert.alert('Minimum Withdrawal Amount', 'You need at least 500 coins to withdraw.');
        } else {
            Alert.alert('Notice', "Attention: Our diligent team is currently reviewing the accumulation of your total coins to ensure the utmost integrity and authenticity. We are committed to maintaining a fair and transparent environment where each user's contributions are valued and rewarded ethically. Thank you for your patience as we meticulously assess your earned coins. Rest assured, our efforts are dedicated to upholding the standards of excellence that define our organization. Your trust and satisfaction are our top priorities. Stay tuned for updates. Thank you for being a valued member of our community.");
        }

     
    };

    return (
        <>
            <ScrollView>
                <View style={styles.container}>
                    <View >
                        <Text style={styles.title}>Your Coins</Text>
                        <Text style={styles.coinsText}>{totalCoins} Coins</Text>
                    </View>
                    <View style={styles.coins}>

                        <Text style={styles.rupeesText}>{equivalentRupees} Rupees</Text>

                        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
                            <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.details}>
                        Your total coins represent the sum of views from all the documents you've uploaded. Each view contributes
                        to your coin balance – 1 view equals 1 coin. Accumulate coins and exchange them for real money.
                        The equivalent value of your coins in rupees is calculated based on the exchange rate of 1 coin = 0.1 rupees.
                        The minimum withdrawal amount is 50 rupees.
                    </Text>
                    <Text style={styles.details}>
                        Welcome to the heart of your success journey on our platform. Your total coins are not just a number;
                        they are a testament to the impact your uploaded documents have made. Each view from your audience
                        contributes to your coin balance – it's not just a statistic, it's a measure of your influence.
                        With each click, you are not only accumulating coins but building a connection with your audience.
                    </Text>
                    <Text style={styles.details}>
                        Your journey doesn't stop there. Your coins hold real-world value, and here's the exciting part –
                        they can be exchanged for real money. The equivalent value of your coins in rupees is calculated
                        based on a generous exchange rate of 1 coin = 0.1 rupees. It's not just about virtual coins; it's about
                        turning your digital success into tangible rewards. Your efforts are not only recognized but rewarded
                        in a way that amplifies your achievements beyond the digital realm.
                    </Text>
                    <Text style={styles.details}>
                        But, like every great journey, there are milestones to achieve. The minimum withdrawal amount is set at 500 coins.
                        This isn't just a number; it's a target, a stepping stone towards realizing the value you've created.
                        As you surpass this milestone, your journey transcends into the realm of tangible rewards.
                        Your first withdrawal is not just a financial transaction; it's a celebration of your success.
                    </Text>
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
        elevation: 4,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderRadius: 12
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    details: {
        fontSize: 16,
        marginBottom: 16,
        color: '#555',
    },
    coinsText: {
        fontSize: 18,
        marginBottom: 8,
    },
    rupeesText: {
        fontSize: 18,

        color: '#4CAF50',
    },
    withdrawButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 8,
    },
    withdrawButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    coins: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 5
        // justifyContent: 'space-between'

    }
});
export default Coinscreen;
