import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getPlayerImage } from '../utils/playerStorage';
import { getISTDateString } from '../utils/dateUtils';
import { PlayersContext } from '../playersContext';
import { useContext } from 'react';

const AttendanceScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { players, playerPhotos, updatePlayers } = useContext(PlayersContext);

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = getISTDateString();

  // State management
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showMenu, setShowMenu] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // Initialize marked dates
  useEffect(() => {
    const datesWithAttendance = {};

    // Find all dates with attendance records
    players.forEach(player => {
      Object.keys(player.attendance || {}).forEach(date => {
        if (player.attendance[date]) {
          datesWithAttendance[date] = {
            marked: true,
            dotColor: 'blue',
            selected: date === todayString,
            selectedColor: date === todayString ? 'green' : 'black',
            selectedTextColor: 'white'
          };
        }
      });
    });

    // Ensure today is marked if it has attendance
    if (!datesWithAttendance[todayString]) {
      datesWithAttendance[todayString] = {
        selected: true,
        selectedColor: 'green',
        selectedTextColor: 'white'
      };
    }

    setMarkedDates(datesWithAttendance);
  }, [players]);

  // Load player photos
  useEffect(() => {
    const loadPlayerPhotos = async () => {
      const photos = {};
      await Promise.all(
        players.map(async (player) => {
          const imageUri = await getPlayerImage(player.id);
          if (imageUri) {
            photos[player.id] = imageUri;
          }
        })
      );
      // Update player photos in context
    };

    if (isFocused) {
      loadPlayerPhotos();
    }
  }, [isFocused, players]);

  const onDayPress = (day) => {
    const dateKey = day.dateString;
    const hasAttendance = players.some(p => p.attendance?.[dateKey]);

    const newMarkedDates = {
      ...markedDates,
      // Update selected date
      [dateKey]: {
        ...markedDates[dateKey],
        marked: hasAttendance,
        dotColor: hasAttendance ? 'blue' : undefined,
        selected: true,
        selectedColor: dateKey === todayString ? 'green' : 'black',
        selectedTextColor: 'white'
      },
      // Reset previous selection
      [selectedDate]: {
        ...markedDates[selectedDate],
        selected: false,
        selectedColor: undefined,
        selectedTextColor: undefined
      }
    };

    setSelectedDate(dateKey);
    setMarkedDates(newMarkedDates);
  };

  const toggleAttendance = (playerId) => {
    if (!selectedDate) return;

    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        const newStatus = player.attendance?.[selectedDate] === 'present' ? 'absent' : 'present';
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

    updatePlayers(updatedPlayers);

    // Check if any attendance exists for this date
    const hasAttendance = updatedPlayers.some(p => p.attendance?.[selectedDate]);

    setMarkedDates(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        marked: hasAttendance,
        dotColor: 'blue', // Always set to blue if marked
        selected: true,
        selectedColor: selectedDate === todayString ? 'green' : 'black',
        selectedTextColor: 'white'
      }
    }));
  };

  // Calendar theme configuration
  const calendarTheme = {
    todayTextColor: '#1a237e',
    arrowColor: '#1a237e',
    'stylesheet.calendar.header': {
      dayTextAtIndex0: { color: 'red' },
      dayTextAtIndex6: { color: 'red' }
    },
    'stylesheet.calendar.main': {
      dayContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        opacity: 1,
      }
    }
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

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType={'multi-dot'}
          theme={calendarTheme}
          current={todayString}
        />
      </View>

      {selectedDate && (
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
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
          >
            <View style={styles.playerImageContainer}>
              {playerPhotos[item.id] ? (
                <Image
                  source={{ uri: playerPhotos[item.id] }}
                  style={styles.playerImage}
                />
              ) : (
                <MaterialIcons name="person" size={32} color="#666" />
              )}
            </View>

            <Text style={styles.playerName}>{item.name}</Text>
            <View style={[
              styles.attendanceIndicator,
              item.attendance?.[selectedDate] === 'present' ? styles.present : styles.absent
            ]}>
              <Text style={styles.attendanceText}>
                {item.attendance?.[selectedDate] === 'present' ? 'Present' : 'Absent'}
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
  calendarContainer: {
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 19,
    shadowColor: '#000',
    borderColor: 'black',
    borderWidth: 0.2,
    backgroundColor: 'white',
  },
  dateDisplay: {
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    marginHorizontal: 10,
    borderRadius: 15,
    marginTop: 5,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
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
    fontSize: 19.5,
    fontWeight: '600',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginLeft: 10,
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuOptionText: {
    marginLeft: 15,
    fontSize: 17,
    color: '#1a237e',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
});

export default AttendanceScreen;