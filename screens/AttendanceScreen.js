import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';
import  MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const AttendanceScreen = ({ route }) => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('todayString');

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const [showMenu, setShowMenu] = useState(false)
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
        <TouchableOpacity onPress={() => setShowMenu(true)}>
            <MaterialIcons name="menu" size={28} color="white" />
        </TouchableOpacity>
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

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('AttendanceChart', { players });
              }}
            >
              <MaterialIcons name="insert-chart" size={24} color="#1a237e" />
              <Text style={styles.menuOptionText}>Attendance Chart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('AttendanceRankers', { players });
              }}
            >
              <MaterialIcons name="leaderboard" size={24} color="#1a237e" />
              <Text style={styles.menuOptionText}>Attendance Rankers</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Menu Card (white rounded container for options)
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    width: '80%', // Covers 80% of screen width
    elevation: 5, // Shadow (Android)
    shadowColor: '#000', // Shadow (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginLeft: 10,
    marginBottom: 20,
  },

  // Individual Menu Option (row with icon + text)
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  // Text style for menu options
  menuOptionText: {
    marginLeft: 15,
    fontSize: 17,
    color: '#1a237e', // Dark blue (matches your icon color)
    fontWeight: '500',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginLeft: 92,
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