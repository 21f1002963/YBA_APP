import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native'
import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Alert } from 'react-native';

const Tournaments = () => {
  const [hovered, setHovered] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [openFromPicker, setOpenFromPicker] = useState(false);
  const [openToPicker, setOpenToPicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'past'
  const [filteredTournaments, setFilteredTournaments] = useState([]);

  const [tournaments, setTournaments] = useState([
    { 
    id: 1, 
    name: "Youth National Championship", 
    from: '2023-06-15',  // YYYY-MM-DD format
    to: '2023-06-20', 
    venue: 'Ahmedabad',
    date: 'Jun 15, 2023 - Jun 20, 2023'
  },
  { 
    id: 2, 
    name: "Senior Nationals", 
    from: '2023-12-10', 
    to: '2023-12-15', 
    venue: 'Delhi',
    date: 'Dec 10, 2023 - Dec 15, 2023'
  },
  ]);

  const [newTournament, setNewTournament] = useState({
    name: '',
    from: '',
    to: '',
    venue: '',
  });

  const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format for display (e.g. "Jun 15, 2023")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // From Date Handler
  const handleFromDateConfirm = (date) => {
    setOpenFromPicker(false);
    setFromDate(date);

    const formattedDate = formatDateString(date);
    setNewTournament(prev => ({
      ...prev,
      from: formattedDate
    }));

    // Auto-adjust To date if it's before From date
    if (new Date(newTournament.to) < date) {
      const newToDate = new Date(date);
      newToDate.setDate(date.getDate() + 1); // Default to next day
      setToDate(newToDate);
      setNewTournament(prev => ({
        ...prev,
        to: formatDateString(newToDate)
      }));
    }
  };

  // To Date Handler
  const handleToDateConfirm = (date) => {
    if (date < fromDate) {
      Alert.alert(
        'Invalid Date',
        'End date cannot be before start date',
        [{ text: 'OK' }]
      );
      return;
    }

    setOpenToPicker(false);
    setToDate(date);
    setNewTournament(prev => ({
      ...prev,
      to: formatDateString(date)
    }));
  };

  const handleHover = () => {
    Animated.spring(scaleValue, {
      toValue: hovered ? 1 : 1.05,
      useNativeDriver: true,
    }).start();
    setHovered(!hovered);
  };

  const handleDelete = (tournamentId) => {
    const tournamentToDelete = tournaments.find(t => t.id === tournamentId);

    Alert.alert(
      'Confirm Delete',
      `Delete ${tournamentToDelete?.name || 'this tournament'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => confirmDelete(tournamentId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = async (tournamentId) => {
    try {
      // Update state
      const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
      setTournaments(updatedTournaments);

      // Update AsyncStorage
      await AsyncStorage.setItem('tournamentData', JSON.stringify(updatedTournaments));

      // Show success message
      Alert.alert(
        'Success',
        'Tournament deleted successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete tournament');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('tournamentData');
      if (savedData) {
        setNewTournament(JSON.parse(savedData));
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newTournament.name || !newTournament.from || !newTournament.to || !newTournament.venue) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newTournamentObj = {
      id: Date.now(), // Use timestamp as unique ID
      name: newTournament.name,
      from: newTournament.from,
      to: newTournament.to,
      venue: newTournament.venue,
      date: `${formatDate(newTournament.from)} - ${formatDate(newTournament.to)}`
    };

    const updatedTournaments = [newTournamentObj, ...tournaments];
    setTournaments(sortTournaments(updatedTournaments));

    try {
      await AsyncStorage.setItem('tournamentData', JSON.stringify(updatedTournaments));
      setModalVisible(false);
      setNewTournament({
        name: '',
        from: '',
        to: '',
        venue: ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save tournament');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' // Added year for clarity
  });
  };

  const sortTournaments = (tournaments) => {
    // First ensure tournaments is an array
    const tournamentsArray = Array.isArray(tournaments) ? tournaments : [];

    // Then sort the array
    return [...tournamentsArray].sort((a, b) => {
      // Handle cases where dates might be missing or invalid
      const dateA = a.from ? new Date(a.from) : new Date(0);
      const dateB = b.from ? new Date(b.from) : new Date(0);
      return dateA.getTime() - dateB.getTime(); // Newest first
    });
  };

  const filterTournaments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeTab) {
      case 'upcoming':
        return tournaments.filter(t => {
        const fromDate = t.from ? new Date(t.from) : new Date(0);
        return fromDate >= today;
      });
      case 'past':
        return tournaments.filter(t => {
        const toDate = t.to ? new Date(t.to) : new Date(0);
        return toDate < today;
      });
      default:
        return tournaments;
    }
  };

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const savedData = await AsyncStorage.getItem('tournamentData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setTournaments(sortTournaments(parsedData));
        }
      } catch (error) {
        console.error('Failed to load tournaments', error);
      }
    };
    loadTournaments();
  }, []);

  useEffect(() => {
    setFilteredTournaments(sortTournaments(filterTournaments()));
  }, [activeTab, tournaments])

  return (
    <View style={{
      flex: 1,
      padding: 15,
      backgroundColor: '#F8F8F8',
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        elevation: 2,
      }}>
        <TouchableOpacity
          style={[{
            padding: 10,
            borderRadius: 5,
            flex: 1,
            alignItems: 'center'
          }, activeTab === 'all' && { backgroundColor: '#7b2cbf' }]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[{
            color: '#666',
            fontWeight: '600',
          }, activeTab === 'all' && { color: 'white', }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{
            padding: 10,
            borderRadius: 5,
            flex: 1,
            alignItems: 'center',
          }, activeTab === 'upcoming' && { backgroundColor: '#7b2cbf' }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[{ color: '#666', fontWeight: '600' }, activeTab === 'upcoming' && { color: 'white', }]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{
            padding: 10,
            borderRadius: 5,
            flex: 1,
            alignItems: 'center',
          }, activeTab === 'past' && { backgroundColor: '#7b2cbf' }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[{ color: '#666', fontWeight: '600', }, activeTab === 'past' && { color: 'white', }]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginBottom: 0 }}>
        {filteredTournaments.map((tournament) => (
          <View key={tournament.id} style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 19,
                fontWeight: '600',
                color: '#333',
              }}>{tournament.name}</Text>
              <Text style={{
                fontSize: 15,
                color: '#666',
                marginTop: 4,
              }}>{tournament.date}</Text>
              <Text style={{
                fontSize: 15,
                color: '#666',
                marginTop: 4,
                color: 'green',
              }}>{tournament.venue}</Text>
            </View>

            <View style={{
              flexDirection: 'column',
              alignItems: 'center',
            }}>

              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  marginLeft: 8,
                  backgroundColor: 'white',
                  borderColor: 'red',
                  borderWidth: 1,
                }}
                onPress={() => handleDelete(tournament.id)}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                }}><MaterialCommunityIcons name='delete' color='black' size={20}></MaterialCommunityIcons></Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Animated.View
        style={
          {
            position: 'absolute',
            bottom: 10,
            right: 160,
            backgroundColor: '#7b2cbf',
            borderRadius: 40,
            paddingVertical: 4,
            paddingHorizontal: 20,
            shadowColor: '#7b2cbf',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
            transform: [{ scale: scaleValue }],
            shadowOpacity: hovered ? 0.3 : 0.1,
            opacity: 0.8
          }
        }
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          onPressIn={handleHover}
          onPressOut={handleHover}
          activeOpacity={0.4}

        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center',
            // opacity: 0.7
          }}>
            <Text style={{
              color: 'white',
              fontSize: 38,
              marginBottom: 2,
            }}>+</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
            />
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '85%',
              maxWidth: 400,
            }}>
              <Text style={{
                fontSize: 22,
                fontWeight: 'bold',
                marginBottom: 20,
                color: '#333',
                textAlign: 'center',
              }}>Add New Tournament</Text>

              <Text style={{ fontSize: 17, marginBottom: 8, marginTop: 20 }}>Tournament : </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                }}
                placeholder="Tournament Name"
                value={newTournament.name}
                placeholderTextColor="#999"
                placeholderTextSize={15}
                onChangeText={(text) => setNewTournament({ ...newTournament, name: text })}
              />

              <View style={styles.container}>
                <Text style={styles.label}>From Date:</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="Select start date"
                    placeholderTextColor="#999"
                    value={formatDisplayDate(newTournament.from)}
                    editable={false}
                    onPressIn={() => setOpenFromPicker(true)}
                  />
                  <TouchableOpacity
                    style={styles.calendarButton}
                    onPress={() => setOpenFromPicker(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={24} color="#7b2cbf" />
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={openFromPicker}
                    date={fromDate}
                    mode="date"
                    minimumDate={new Date()} // Can't select past dates
                    onConfirm={handleFromDateConfirm}
                    onCancel={() => setOpenFromPicker(false)}
                  />
                </View>

                {/* To Date Picker */}
                <Text style={styles.label}>To Date:</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="Select end date"
                    placeholderTextColor="#999"
                    value={formatDisplayDate(newTournament.to)}
                    editable={false}
                    onPressIn={() => setOpenToPicker(true)}
                  />
                  <TouchableOpacity
                    style={styles.calendarButton}
                    onPress={() => setOpenToPicker(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={24} color="#7b2cbf" />
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={openToPicker}
                    date={toDate}
                    mode="date"
                    minimumDate={fromDate} // Can't select before From date
                    onConfirm={handleToDateConfirm}
                    onCancel={() => setOpenToPicker(false)}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 17, marginBottom: 8 }}>Venue : </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                }}
                placeholder="Venue"
                placeholderTextColor="#999"
                value={newTournament.venue}
                onChangeText={(text) => setNewTournament({ ...newTournament, venue: text })}
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}>
                <TouchableOpacity
                  style={{
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    minWidth: '48%',
                    alignItems: 'center',
                    backgroundColor: '#f0f0f0',
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{
                    color: '#ff7f50',
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 2,
                  }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    minWidth: '48%',
                    alignItems: 'center',
                    backgroundColor: '#7b2cbf',
                  }}
                  onPress={handleSubmit}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 2,
                  }}>Add </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
};


const styles = {
  container: {
    padding: 0,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    // fontWeight: '500',
  },
  dateInputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 0, // Space for calendar icon
  },
  calendarButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    padding: 8,
  },
};

export default Tournaments
