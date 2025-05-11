import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal,
  TouchableWithoutFeedback, Keyboard, TextInput, Animated, Image,
  Alert, PermissionsAndroid, Platform // Added Alert, PermissionsAndroid, Platform
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react'; // Grouped React imports
import { BlurView } from '@react-native-community/blur';
import DatePicker from 'react-native-date-picker'; // Imported but not used in JSX, kept as is.
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native'; // Added for navigation
import { useFocusEffect } from '@react-navigation/native'; // Added for focus effect
import { PlayerDetail } from './PlayerDetail'; // Assuming PlayerDetail is in the same directory
import AwesomeAlert from 'react-native-awesome-alerts';
import { getPlayerImage } from '../utils/playerStorage';
import { playersData } from '../utils/playersData';
import { PlayersContext } from '../playersContext';
import { useContext } from 'react'; // Added for context

const Players = () => {
  const [hovered, setHovered] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigation = useNavigation(); // Added for navigation
  const getAgeCategory = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate full years
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    // Calculate exact age in years and months
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    if (dayDiff < 0) months--; // Adjust if birthday hasn't passed this month
    const exactAge = months / 12; // Age in decimal years (e.g., 14.5)

    // Basketball Federation of India Age Categories
    if (exactAge < 12) return 'U12';
    if (exactAge > 12 && exactAge <= 14) return 'U14';  // 12-13.99 years
    if (exactAge > 14 && exactAge <= 17) return 'U17';  // 14-15.99 years
    if (exactAge > 16 && exactAge <= 19) return 'U19';  // 16-17.99 years
    if (exactAge > 18 && exactAge <= 23) return 'U23'; // 18-23 years
    return 'Senior'; // 24+ years
  };
  const { players, playerPhotos, addPlayer, deletePlayer, updatePlayerPhoto } = useContext(PlayersContext);


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
      setPlayerPhotos(photos);
    };
    loadPlayerPhotos();
  }, [players]);

  const initialNewPlayerState = {
    name: '',
    position: '',
    dob: '',
    contact: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0], // Default to today
  };

  const [newPlayer, setNewPlayer] = useState(initialNewPlayerState);

  const handleHover = () => {
    Animated.spring(scaleValue, {
      toValue: hovered ? 1 : 1.05,
      useNativeDriver: true,
    }).start();
    setHovered(!hovered);
  };

  useEffect(() => {
    AsyncStorage.setItem('PlayerData', JSON.stringify(players))
      .then(() => console.log('Player data saved successfully'))
      .catch(error => console.error('Failed to save player data', error));
  }
    , [players]); // Save players to AsyncStorage whenever it changes

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('PlayerData');
        if (savedData) {
          setNewPlayer(prevState => ({ ...prevState, ...JSON.parse(savedData) }));
        }
      } catch (error) {
        console.error("Failed to load player data from storage", error);
      }
    };
    loadData();
  }, []);

  const handleDelete = (playerId) => {
    const playerToDelete = players.find(t => t.id === playerId);

    Alert.alert(
      'Confirm Delete',
      `Delete ${playerToDelete?.name || 'this player'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => confirmDelete(playerId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = (playerId) => {
    deletePlayer(playerId); // Use context function
    Alert.alert('Success', 'Player deleted successfully');
  };

  // Filter players by selected category
  const filteredPlayers = selectedCategory === 'All'
    ? players
    : players.filter(player => getAgeCategory(player.dob) === selectedCategory);

  // Group players by month they joined
  const groupPlayersByJoinMonth = (players) => {
    // First sort all players by joinDate in descending order (newest first)
    const sortedPlayers = [...players].sort((a, b) => {
      return new Date(b.joinDate) - new Date(a.joinDate);
    });

    const grouped = {};

    sortedPlayers.forEach(player => {
      const joinDate = new Date(player.joinDate);
      const monthYear = `${joinDate.toLocaleString('default', { month: 'long' })} ${joinDate.getFullYear()}`;

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(player);
    });

    return grouped;
  };

  const groupedPlayers = groupPlayersByJoinMonth(filteredPlayers);

  const handleDOBConfirm = (date) => {
    setOpenDatePicker(false);
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    setNewPlayer({ ...newPlayer, dob: formattedDate });
  };

  const handleSubmit = async () => {
    if (!newPlayer.name || !newPlayer.dob || !newPlayer.position) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    addPlayer(newPlayer); // Use context function
    setModalVisible(false);
    setNewPlayer(initialNewPlayerState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {['All', 'Senior', 'U12', 'U14', 'U17', 'U19', 'U23'].map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={{ marginBottom: 0 }}>
        {Object.keys(groupedPlayers).length > 0 ? (
          Object.entries(groupedPlayers).map(([monthYear, monthPlayers]) => (
            <View key={monthYear}>
              <Text style={styles.monthHeader}>{monthYear}</Text>

              {monthPlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => navigation.navigate('PlayerDetail', {
                    playerId: player.id,
                    onPhotoUpdate: (newImageUri) => {
                      setPlayerPhotos(prev => ({
                        ...prev,
                        [player.id]: newImageUri
                      }));
                    }
                  })}
                  style={styles.playerCard}
                >
                  <View style={styles.playerPhotoContainer}>
                    {playerPhotos[player.id] ? (
                      <Image
                        source={{ uri: playerPhotos[player.id] }}
                        style={styles.playerPhoto}
                      />
                    ) : (
                      <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#666" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerAge}>
                      Joined On - {player.joinDate.split('-').reverse().join('-')}
                    </Text>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(player.id)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={22} color="red" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

            </View>
          ))
        ) : (
          <Text style={styles.noPlayersText}>No players found in this category</Text>
        )}
      </ScrollView>


      <Animated.View
        style={[
          styles.addButtonContainer,
          { transform: [{ scale: scaleValue }], shadowOpacity: hovered ? 0.3 : 0.1 }
        ]}
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          onPressIn={handleHover}
          onPressOut={handleHover}
          activeOpacity={0.2}
        >
          <View style={styles.addButtonContent}>
            <Text style={styles.addButtonText}>+</Text>
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
          <View style={styles.modalOverlay}>
            <BlurView
              style={styles.absolute}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Player</Text>

              <Text style={styles.inputLabel}>Player Name:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter player name"
                value={newPlayer.name}
                placeholderTextColor="#999"
                onChangeText={(text) => setNewPlayer({ ...newPlayer, name: text })}
              />

              <Text style={styles.inputLabel}>Position:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter player position"
                value={newPlayer.position}
                placeholderTextColor="#999"
                onChangeText={(text) => setNewPlayer({ ...newPlayer, position: text })}
              />


              <Text style={styles.inputLabel}>DOB:</Text>
              <View style={{
                position: 'relative',
                marginBottom: 8,
              }}>
                <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                  <View pointerEvents='none'>
                    <TextInput
                      style={styles.textInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#999"
                      value={newPlayer.dob} // Added value prop
                      onChangeText={(text) => setNewPlayer({ ...newPlayer, dob: text })} // Corrected state field
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 6
                  }}
                  onPress={() => setOpenDatePicker(true)}
                >
                  <Text style={{ fontSize: 20 }}>📅</Text>
                </TouchableOpacity>

                <DatePicker
                  modal
                  open={openDatePicker}
                  date={selectedDate}
                  mode="date"
                  onConfirm={handleDOBConfirm}
                  onCancel={() => setOpenDatePicker(false)}
                />
              </View>

              <Text style={styles.inputLabel}>Contact:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter contact number"
                placeholderTextColor="#999"
                value={newPlayer.venue}
                onChangeText={(text) => setNewPlayer({ ...newPlayer, contact: text })}
              />

              <Text style={styles.inputLabel}>Address:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter address"
                placeholderTextColor="#999"
                value={newPlayer.venue}
                onChangeText={(text) => setNewPlayer({ ...newPlayer, address: text })}
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Add Player</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

export default Players;

const styles = StyleSheet.create({
  // In Players.js styles
  playerPhotoContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  playerPhoto: {
    width: '100%',
    height: '100%',
  },

  // In PlayerDetail.js styles
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#1a237e',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryScroll: {
    paddingHorizontal: 5,
    gap: 0
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 9,
  },
  selectedCategoryButton: {
    backgroundColor: '#6200EE',
  },
  categoryButtonText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#6200EE',
    paddingLeft: 10,
  },
  playerPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  playerAge: {
    fontSize: 13,
    color: 'orange',
    marginTop: 2,
  },
  noPlayersText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 18,
    fontWeight: '500',
    verticalAlign: 'middle',
    lineHeight: 100, // Centering text vertically
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F8F8F8',
  },
  playerCard: {
    backgroundColor: 'white', // A light, pleasant color
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Increased slightly for better visibility
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerPhotoContainer: {
    width: 55, // Slightly larger for better touch
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#E0E0E0', // A neutral placeholder background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Increased margin
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  playerPhoto: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    fontSize: 19,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'column', // Or 'row' if you prefer side-by-side
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8, // Made it a bit more touch-friendly
    // Removed background and border for a cleaner icon-button look
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20, // Adjusted for better screen fit
    alignSelf: 'center', // Centered the button
    backgroundColor: '#4CAF50', // A standard green for add
    borderRadius: 30, // Fully rounded
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 10,
    shadowColor: '#000', // Softer shadow
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    opacity: 0.8
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, // Fixed size for the circle
    height: 40,
  },
  addButtonText: {
    color: 'white',
    fontSize: 38, // Adjusted for visibility
    lineHeight: 30, // Adjust line height for vertical centering if needed
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay for better focus
  },
  absolute: { // For BlurView if used
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%', // Responsive width
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16, // Clearer label size
    color: '#555', // Softer color
    marginBottom: 6,
    marginTop: 4, // Spacing between fields
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333', // Text color
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25, // More space before buttons
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '48%', // Ensure buttons take up space
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0', // Light gray for cancel
  },
  cancelButtonText: {
    color: '#555', // Dark gray text for cancel
    fontSize: 17, // Consistent font size
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6200EE', // A common primary color (Material Design purple)
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});