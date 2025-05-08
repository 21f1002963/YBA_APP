import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

const AttendanceScreen = ({ route }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const [markedDates, setMarkedDates] = useState({
    [todayString]: { selected: true, marked: true, dotColor: 'white', selectedColor: 'green', selectedTextColor: 'white' },
  });
  const [players, setPlayers] = useState([
    { id: 1, name: 'Rhythm Pawar', attendance: {} },
    { id: 2, name: 'Ayona Eldos', attendance: {} },
    { id: 3, name: 'Mohit Kumar', attendance: {} },
    { id: 4, name: 'Vijay Purohit', attendance: {} },
  ]);


  // Handle date selection
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Toggle attendance status for a player
  const toggleAttendance = (playerId) => {
    if (!selectedDate) return;

    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        const newStatus = player.attendance[selectedDate] === 'present' ? 'absent' : 'present';
        return {
          ...player,
          attendance: {
            ...player.attendance,
            [selectedDate]: newStatus
          }
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);

    // Update marked dates
    const presentCount = updatedPlayers.filter(p => p.attendance[selectedDate] === 'present').length;
    const newMarkedDates = {
      ...markedDates,
      [selectedDate]: {
        selected: true,
        marked: presentCount > 0,
        dotColor: presentCount === updatedPlayers.length ? 'green' : 'orange'
      }
    };
    setMarkedDates(newMarkedDates);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'black' }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Attendance</Text>
      </View>
      </View>

      <View style={{
        margin: 10,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 19,
        shadowColor: '#000',
        borderColor: 'black',
        borderWidth: 0.2,
        backgroundColor: 'white',
      }}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType={'multi-dot'}
          theme={{
            selectedDayBackgroundColor: '#1a237e',
            todayTextColor: '#1a237e',
            arrowColor: '#1a237e',
          }}
        />
      </View>

      {selectedDate && (
        <View style={{
          padding: 15,
          backgroundColor: '#e0f7fa',
          borderWidth: 1,
          marginHorizontal: 10,
          borderRadius: 15,
          marginTop: 5,
        }}>
          <Text style={{
            fontSize: 17,
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      )}

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playerItem}
            onPress={() => toggleAttendance(item.id)}
            disabled={!selectedDate}
          >
            <Text style={styles.playerName}>{item.name}</Text>
            <View style={[
              styles.attendanceIndicator,
              item.attendance[selectedDate] === 'present' ? styles.present : styles.absent
            ]}>
              <Text style={styles.attendanceText}>
                {item.attendance[selectedDate] === 'present' ? 'Present' : 'Absent'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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
    zIndex: 100, // Ensures header stays above other elements
    borderBottomWidth: 2,
    borderBottomColor: '#0d47a1',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700', // Extra bold
    textTransform: 'uppercase', // Makes text stand out more
    letterSpacing: 1.2, // Improves readability
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Subtle text shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    color: 'white',
  },
  
  listContainer: {
    padding: 10,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  attendanceIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
  },
  attendanceText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;