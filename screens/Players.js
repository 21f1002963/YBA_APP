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

const Players = () => {
  const [hovered, setHovered] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation = useNavigation(); // Added for navigation
  const [playerPhotos, setPlayerPhotos] = useState({}); // Store player photos {id: uri}
  const [players, setPlayers] = useState([ // Made players a state for potential dynamic changes
    { id: 1, name: "Rhythm Pawar", dob: "2000-01-01", contact: "1234567890", address: "123 Street" },
    { id: 2, name: "Ayona Eldos", dob: "2001-02-02", contact: "0987654321", address: "456 Avenue" },
    { id: 3, name: "Mohit Kumar", dob: "1999-03-03", contact: "1122334455", address: "789 Boulevard" },
    { id: 4, name: "Ponnu ", dob: "1998-04-04", contact: "5566778899", address: "101 Parkway" },
  ]);

  const initialNewPlayerState = {
    name: '',
    dob: '',
    contact: '',
    address: '',
  };

  const [newPlayer, setNewPlayer] = useState(initialNewPlayerState);

  const handleDOBConfirm = (date) => {
    setOpenDatePicker(false);
    setSelectedDate(date);

    const formattedDate = date.toISOString().split('T')[0];
    setNewTournament({ ...newTournament, dob: formattedDate });
  };

  const handleHover = () => {
    Animated.spring(scaleValue, {
      toValue: hovered ? 1 : 1.05,
      useNativeDriver: true,
    }).start();
    setHovered(!hovered);
  };

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

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("Camera permission request error:", err);
        return false;
      }
    }
    return true; // For iOS, permissions are typically handled via Info.plist or prompted by the library
  };

  const handleTakePhoto = async (playerId) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: true, // Useful to save the photo to the device gallery
    };

    try {
      const result = await launchCamera(options);

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        Alert.alert("Camera Error", `Could not take photo: ${result.errorMessage || result.errorCode}`);
        console.error('ImagePicker Error: ', result.errorCode, result.errorMessage);
      } else if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setPlayerPhotos(prev => ({
          ...prev,
          [playerId]: result.assets[0].uri
        }));
      } else {
        Alert.alert("Camera Error", "Could not get photo URI.");
      }
    } catch (error) {
      console.error('Launch camera error:', error);
      Alert.alert("Camera Error", "Failed to launch camera. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      await AsyncStorage.setItem(
        'PlayerData', // Consider if this should store the whole players list or just form template
        JSON.stringify(newPlayer)
      );
    } catch (error) {
      console.error("Failed to save player data", error);
    }
    setModalVisible(false);
    setNewPlayer(initialNewPlayerState); // Reset form
  };

  const handleDelete = (playerIdToDelete) => {
    Alert.alert("Delete Player", `Player with ID ${playerIdToDelete} would be deleted. (Implement actual deletion)`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 0 }}>
        {players.map((player) => (
          <TouchableOpacity
            key={player.id}
            onPress={() => navigation.navigate('PlayerDetail', { player })} // Navigate to PlayerDetail
            style={styles.playerCard} // Apply styles to the card
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
          activeOpacity={0.7}
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
    fontSize: 28, // Adjusted for visibility
    fontWeight: 'bold', // Make it bolder
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