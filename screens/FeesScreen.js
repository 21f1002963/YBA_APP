import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, SectionList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playersData } from '../utils/playersData';
import { PlayersContext } from '../playersContext';
import { useContext } from 'react'; // Added for context


const FeesScreen = () => {
  // Sample player data
  const { players } = useContext(PlayersContext);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('5000');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [feesData, setFeesData] = useState({});

  // Get current month in YYYY-MM format
  const getCurrentMonthKey = () => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  };

  // Change month handler
  const changeMonth = (increment) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Load fees data from storage
  useEffect(() => {
    const loadFeesData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('feesData');
        if (storedData) {
          setFeesData(JSON.parse(storedData));
        } else {
          // Initialize with empty data structure
          const initialData = {};
          players.forEach(player => {
            initialData[player.id] = {};
          });
          setFeesData(initialData);
          await AsyncStorage.setItem('feesData', JSON.stringify(initialData));
        }
      } catch (error) {
        console.error('Error loading fees data:', error);
      }
    };

    loadFeesData();
  }, []);

  // Save fees data to storage
  useEffect(() => {
    const saveFeesData = async () => {
      try {
        await AsyncStorage.setItem('feesData', JSON.stringify(feesData));
      } catch (error) {
        console.error('Error saving fees data:', error);
      }
    };

    saveFeesData();
  }, [feesData]);

  // Mark payment for a player
  const markPayment = () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const monthKey = getCurrentMonthKey();
    const formattedDate = paymentDate.toISOString().split('T')[0];

    setFeesData(prevData => {
      const newData = { ...prevData };
      if (!newData[selectedPlayer.id]) {
        newData[selectedPlayer.id] = {};
      }
      newData[selectedPlayer.id][monthKey] = {
        paid: true,
        amount: Number(paymentAmount),
        date: formattedDate
      };
      return newData;
    });

    setShowPaymentModal(false);
    Alert.alert('Success', 'Payment recorded successfully');
  };

  // Get player payment status (simplified without defaulter logic)
  const getPlayerStatus = () => {
    const currentMonthKey = getCurrentMonthKey();
    
    return players.map(player => {
      const playerFees = feesData[player.id] || {};
      
      // Current month payment status
      const currentPayment = playerFees[currentMonthKey] || { 
        paid: false, 
        amount: 5000
      };

      return {
        ...player,
        currentPayment
      };
    });
  };

  const playerStatus = getPlayerStatus();
  const paidPlayers = playerStatus.filter(p => p.currentPayment.paid);
  const unpaidPlayers = playerStatus.filter(p => !p.currentPayment.paid);

  // Simplified sections - only paid and unpaid
  const sections = [
    {
      title: `❌ Unpaid for ${monthNames[selectedMonth]} ${selectedYear}`,
      data: unpaidPlayers,
    },
    {
      title: `✔️ Paid for ${monthNames[selectedMonth]} ${selectedYear}`,
      data: paidPlayers,
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ backgroundColor: 'black' }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Fee Payment</Text>
        </View>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <MaterialIcons name="chevron-left" size={30} color="#1a237e" />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {monthNames[selectedMonth]} {selectedYear}
        </Text>

        <TouchableOpacity onPress={() => changeMonth(1)}>
          <MaterialIcons name="chevron-right" size={30} color="#1a237e" />
        </TouchableOpacity>
      </View>

      {/* Simplified Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Fees Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={{fontSize: 17}}>Total Players:</Text>
          <Text style={styles.summaryValue}>{players.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{fontSize: 17}}>Paid Players:</Text>
          <Text style={[styles.summaryValue, styles.paidValue]}>{paidPlayers.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{fontSize: 17}}>Unpaid Players:</Text>
          <Text style={[styles.summaryValue, styles.unpaidValue]}>{unpaidPlayers.length}</Text>
        </View>
      </View>

      {/* Players List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.playerCard,
            !item.currentPayment.paid && styles.unpaidCard
          ]}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>

              {item.currentPayment.paid ? (
                <Text style={styles.paidInfo}>Paid ₹{item.currentPayment.amount} on {item.currentPayment.date.split('-').reverse().join('-')}</Text>
              ) : (
                <Text style={styles.unpaidInfo}>
                  Due: ₹{item.currentPayment.amount}
                </Text>
              )}
            </View>

            {!item.currentPayment.paid && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                  setSelectedPlayer(item);
                  setPaymentAmount('5000');
                  setPaymentDate(new Date());
                  setShowPaymentModal(true);
                }}
              >
                <MaterialIcons name="payment" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContainer}
      />

      {/* Payment Modal */}
      <Modal
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment for {selectedPlayer?.name}</Text>

            <Text style={styles.modalSubtitle}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>

            <Text style={styles.inputLabel}>Amount:</Text>
            <TextInput
              style={styles.input}
              placeholder="5000"
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />

            <Text style={styles.inputLabel}>Payment Date:</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{fontSize: 16}}>{paymentDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={paymentDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setPaymentDate(date);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={markPayment}
              >
                <Text style={styles.buttonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1a237e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 100,
    borderBottomWidth: 2,
    borderBottomColor: '#0d47a1',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    color: 'white',
    marginLeft: 92,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#e0e0e0',
  },
  monthText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1a237e',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    margin: 15,
    borderRadius: 10,
    elevation: 15,
  },
  summaryTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a237e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: '600',
    fontSize: 18,
  },
  paidValue: {
    color: '#4CAF50',
  },
  unpaidValue: {
    color: '#F44336',
  },
  sectionHeader: {
    backgroundColor: 'rgba(44, 225, 228, 0.28)',
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 225, 228, 0.85)',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    // color: '#333',
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 22,
    elevation: 10,
    borderLeftWidth: 5,
    borderLeftColor: 'green',
  },
  unpaidCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  paidInfo: {
    color: '#2e7d32',
    fontSize: 15,
  },
  unpaidInfo: {
    color: '#d32f2f',
    fontSize: 15,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a237e',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 19,
    color: 'black',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 17,
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 9,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 9,
    padding: 10,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 5,
  },
  modalButton: {
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default FeesScreen;