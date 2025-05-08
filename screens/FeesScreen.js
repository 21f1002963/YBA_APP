import { StyleSheet, Text, View, FlatList, TouchableOpacity, SectionList } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
const FeesScreen = () => {
  // Sample player data with payment status
  const [players, setPlayers] = useState([
    { id: 1, name: 'Rhythm Pawar', paid: true, lastPayment: '2023-10-15', amount: 5000 },
    { id: 2, name: 'Ayona Eldos', paid: false, lastPayment: '2023-08-20', amount: 5000, defaultMonths: 2 },
    { id: 3, name: 'Mohit Kumar', paid: false, lastPayment: '2023-06-10', amount: 5000, defaultMonths: 4 },
    { id: 4, name: 'Vijay Purohit', paid: true, lastPayment: '2023-10-01', amount: 5000 },
    { id: 5, name: 'Rahul Sharma', paid: false, lastPayment: '2023-05-15', amount: 5000, defaultMonths: 5 },
  ]);

  // State for new payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Mark payment for a player
  const markPayment = (playerId) => {
    setPlayers(players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          paid: true,
          lastPayment: new Date().toISOString().split('T')[0],
          defaultMonths: 0
        };
      }
      return player;
    }));
    setShowPaymentModal(false);
  };

  // Categorize players
  const paidPlayers = players.filter(player => player.paid);
  const unpaidPlayers = players.filter(player => !player.paid);
  const defaulters = players.filter(player => !player.paid && player.defaultMonths >= 3);

  // Sort defaulters by longest default time
  const sortedDefaulters = [...defaulters].sort((a, b) => b.defaultMonths - a.defaultMonths);

  // Data for section list
  const sections = [
    {
      title: '⚠️ Chronic Defaulters (3+ months)',
      data: sortedDefaulters,
    },
    {
      title: '⚠️ Recent Defaulters',
      data: unpaidPlayers.filter(player => !defaulters.includes(player)),
    },
    {
      title: '✅ Paid Players',
      data: paidPlayers,
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Payment Modal */}
      {showPaymentModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment for {selectedPlayer?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => markPayment(selectedPlayer.id)}
              >
                <Text style={styles.buttonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.playerCard,
            !item.paid && styles.unpaidCard,
            defaulters.includes(item) && styles.defaulterCard
          ]}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.paymentInfo}>
                {item.paid ? `Paid ₹${item.amount} on ${item.lastPayment}` : 
                 `Due: ₹${item.amount} (${item.defaultMonths || 0} months)`}
              </Text>
            </View>
            {!item.paid && (
              <TouchableOpacity 
                style={styles.payButton}
                onPress={() => {
                  setSelectedPlayer(item);
                  setPaymentAmount(item.amount.toString());
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
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Fees Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Total Players:</Text>
              <Text style={styles.summaryValue}>{players.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Paid Players:</Text>
              <Text style={[styles.summaryValue, styles.paidValue]}>{paidPlayers.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Unpaid Players:</Text>
              <Text style={[styles.summaryValue, styles.unpaidValue]}>{unpaidPlayers.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Chronic Defaulters:</Text>
              <Text style={[styles.summaryValue, styles.defaulterValue]}>{defaulters.length}</Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a237e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: '600',
  },
  paidValue: {
    color: '#4CAF50',
  },
  unpaidValue: {
    color: '#F44336',
  },
  defaulterValue: {
    color: '#FF5722',
  },
  sectionHeader: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  unpaidCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  defaulterCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF5722',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  paymentInfo: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
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
  },
});

export default FeesScreen;