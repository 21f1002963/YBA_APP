import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { Rating } from 'react-native-ratings';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoachAssessment from './CoachAssessment';
import DailyMetrics from './DailyMetrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { savePlayerImage, getPlayerImage } from '../utils/playerStorage';
import { playersData } from '../utils/playersData';
import { PlayersContext } from '../playersContext';
import { useContext } from 'react'; // Added for context


const PlayerDetail = ({ route }) => {
    const { playerId } = route.params;
    const { players, playerPhotos, updatePlayerPhoto } = useContext(PlayersContext);
    const player = players.find(p => p.id === playerId);
    const [notes, setNotes] = useState('');
    const navigation = useNavigation();
    const [coachNotes, setCoachNotes] = useState([]);
    const [metrics, setMetrics] = useState({
        name: '',
        value: ''
    });
    const [playerMetrics, setPlayerMetrics] = useState([]);
    const [rating, setRating] = useState(3);
    if (!player) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Player not found</Text>
            </SafeAreaView>
        );
    }
    const [playerImage, setPlayerImage] = useState(playerPhotos[playerId] || '');

    const addCoachNote = () => {
        if (notes.trim()) {
            setCoachNotes([...coachNotes, {
                id: Date.now().toString(),
                date: new Date().toLocaleString(),
                note: notes
            }]);
            setNotes('');
        }
    };

    const addPlayerMetric = () => {
        if (metrics.name.trim() && metrics.value.trim()) {
            setPlayerMetrics([...playerMetrics, {
                id: Date.now().toString(),
                date: new Date().toLocaleString(),
                ...metrics
            }]);
            setMetrics({ name: '', value: '' });
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';

        const [day, month, year] = dob.split('-').reverse().join('-').split(/[\/-]/); // Works for both DD-MM-YYYY and DD/MM/YYYY
        const birthDate = new Date(`${year}-${month}-${day}`);
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        // Adjust for negative months/days
        if (days < 0) {
            months--;
            // Get last day of the previous month
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} y, ${months} m, ${days} d`;
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message: "App needs access to your camera",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert('Permission denied', 'You need to grant camera permissions to take photos');
                    return false;
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS always returns true
    };

    useEffect(() => {
        const loadPlayerImage = async () => {
            const imageUri = await getPlayerImage(player.id);
            if (imageUri) {
                setPlayerImage(imageUri);
            }
        };
        loadPlayerImage();
    }, [player.id]);

    // PlayerDetail.js
    const handleImageResponse = async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
            Alert.alert('Error', `Failed to capture photo: ${response.errorMessage}`);
            return;
        }

        if (response.assets?.[0]?.uri) {
            const uri = response.assets[0].uri;
            setPlayerImage(uri);
            await savePlayerImage(player.id, uri);
            updatePlayerPhoto(player.id, uri);
            Alert.alert('Success', 'Profile picture updated');
        }
    };

    const capturePhotoWithBackCamera = async () => {
        try {
            console.log('Attempting to open camera...');

            // 1. Request camera permissions
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                Alert.alert('Permission required', 'Camera access is needed to take photos');
                return;
            }

            // 2. Set camera options
            const options = {
                mediaType: 'photo',
                quality: 0.8, // Reduced quality for better performance
                maxWidth: 800,
                maxHeight: 800,
                includeBase64: false,
                cameraType: 'back',
                saveToPhotos: Platform.OS === 'ios', // Only save to photos on iOS
                durationLimit: 30, // For video, but good to have
                videoQuality: 'high',
            };

            console.log('Launching camera with options:', options);

            // 3. Launch camera
            const response = await launchCamera(options);
            console.log('Camera response:', response);

            // 4. Handle response
            if (response.didCancel) {
                console.log('User cancelled camera');
                return;
            }

            if (response.errorCode) {
                console.error('Camera Error:', response.errorMessage);
                Alert.alert('Error', `Camera error: ${response.errorMessage || 'Unknown error'}`);
                return;
            }

            if (!response.assets || !response.assets[0]?.uri) {
                console.error('Invalid response:', response);
                Alert.alert('Error', 'No image was captured');
                return;
            }

            const uri = response.assets[0].uri;
            console.log('Captured image URI:', uri);

            // 5. Update state and storage
            setPlayerImage(uri);

            const playerData = {
                ...player,
                image: uri
            };

            await AsyncStorage.setItem(`player_${player.id}`, JSON.stringify(playerData));

            if (onPhotoUpdate) {
                onPhotoUpdate(uri);
            }

            Alert.alert('Success', 'Profile picture updated!');

        } catch (error) {
            console.error('Camera capture failed:', error);
            Alert.alert('Error', `Failed to capture photo: ${error.message || 'Unknown error'}`);
        }
    };

    const handleImagePick = async (source) => {
        const options = {
            mediaType: 'photo',
            quality: 1,
            maxWidth: 500,
            maxHeight: 500,
            includeBase64: false,
            selectionLimit: 1,
            saveToPhotos: true,
        };

        try {
            let response;
            if (source === 'camera') {
                const hasPermission = await requestCameraPermission();
                if (!hasPermission) return;
                response = await launchCamera(options);
            } else {
                response = await launchImageLibrary(options);
            }
            handleImageResponse(response); // This is where we use it for both camera and gallery
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const recentCoachNotes = [...coachNotes]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1);

    // Get only the last 3 metrics (sorted by date)
    const recentPlayerMetrics = [...playerMetrics]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1);

    // Navigation functions for older records
    const navigateToCoachAssessment = () => {
        navigation.navigate('CoachAssessment', {
            playerId: player.id,
            notes: coachNotes
        });
    };

    const navigateToDailyMetrics = () => {
        navigation.navigate('DailyMetrics', {
            playerId: player.id,
            metrics: playerMetrics
        });
    };

    useEffect(() => {
        const storeData = async () => {
            try {
                const playerDetails = {
                    coachNotes,
                    DailyMetrics
                };
                await AsyncStorage.setItem('PlayerDetails', JSON.stringify(playerDetails));
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };
        storeData();
    }, [coachNotes, DailyMetrics]);

    useEffect(() => {
        const loadPlayerDetails = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('PlayerDetails');
                if (jsonValue !== null) {
                    const parsedData = JSON.parse(jsonValue);
                    // Set the data to your state variables
                    setCoachNotes(parsedData.coachNotes || []);
                    setMetrics(parsedData.metrics || []);
                } else {
                    console.log('No data found in AsyncStorage');
                    // Initialize with empty arrays if no data exists
                    setCoachNotes([]);
                    setMetrics([]);
                }
            } catch (e) {
                console.error('Error reading data:', e);
                // Handle error case appropriately
                Alert.alert('Error', 'Failed to load player details');
            }
        };
        loadPlayerDetails();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <ScrollView style={styles.container}>
                {/* Player Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute',
                            top: 5,
                            left: 1,
                            zIndex: 1,
                            padding: 10,
                            backgroundColor: 'white',
                            borderRadius: 50,
                            elevation: 25,
                        }}
                    >
                        <AntDesign name="arrowleft" size={30} color="black" />
                    </TouchableOpacity>

                    <View style={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        marginBottom: 20,
                        marginTop: 40,
                        alignSelf: 'center',
                        borderRadius: 100,
                        borderWidth: 4,
                        borderColor: '#1a237e',
                    }}>
                        <TouchableOpacity
                            onPress={() => handleImagePick('gallery')}
                            onLongPress={capturePhotoWithBackCamera}
                        >
                            <Image
                                source={playerImage ? { uri: playerImage } : require('../assets/dp.jpg')}
                                style={styles.profileImage}
                            />
                            <View style={styles.cameraIconContainer}>
                                <MaterialIcons name="photo-camera" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={{ fontSize: 17, marginBottom: 20, fontWeight: '500', color: 'green' }}>{player.position}</Text>
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <AntDesign name="calendar" size={22} color="black" />
                            <Text style={styles.detailText}>DOB: {player.dob.split('-').reverse().join('-')}</Text>
                            <Text style={{ fontSize: 17, fontWeight: '500', fontStyle: 'italic', color: 'blue' }}>  ({calculateAge(player.dob)})</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <AntDesign name="phone" size={22} color="black" />
                            <Text style={styles.detailText}>Contact: {player.contact}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <AntDesign name="enviroment" size={22} color="black" />
                            <Text style={styles.detailText}>Address: {player.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Coach Notes Section */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coach's Assessment</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Write your assessment note..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            placeholderTextColor={'#aaa'}
                            marginBottom={15}
                            numberOfLines={4}
                            borderColor={'#aaa'}
                            borderWidth={1}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addCoachNote}>
                            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>Add Note</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={recentCoachNotes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.noteCard}>
                                <Text style={styles.noteDate}>{item.date}</Text>
                                <Text style={styles.noteText}>{item.note}</Text>
                            </View>
                        )}
                        scrollEnabled={false}
                    />

                    {coachNotes.length > -1 && (
                        <TouchableOpacity
                            style={styles.showMoreButton}
                            onPress={navigateToCoachAssessment}
                        >
                            <Text style={styles.showMoreText}>Show Older Records</Text>
                            <AntDesign name="right" size={16} color="#1a237e" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Player Metrics Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Metrics</Text>
                    <View style={styles.metricInputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 2 }]}
                            placeholder="Metric name"
                            value={metrics.name}
                            onChangeText={(text) => setMetrics({ ...metrics, name: text })}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1, marginLeft: 10 }]}
                            placeholder="Value"
                            value={metrics.value}
                            onChangeText={(text) => setMetrics({ ...metrics, value: text })}
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={addPlayerMetric}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={recentPlayerMetrics}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.metricCard}>
                                <Text style={styles.metricDate}>{item.date}</Text>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricName}>{item.name}:</Text>
                                    <Text style={styles.metricValue}>{item.value}</Text>
                                </View>
                            </View>
                        )}
                        scrollEnabled={false}
                    />

                    {playerMetrics.length > -1 && (
                        <TouchableOpacity
                            style={styles.showMoreButton}
                            onPress={navigateToDailyMetrics}
                        >
                            <Text style={styles.showMoreText}>Show Older Records</Text>
                            <AntDesign name="right" size={16} color="#1a237e" />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    showMoreText: {
        color: '#1a237e',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 5,
    },
    container: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: '#1a237e',
        marginBottom: 15,
        marginTop: 50
    },
    playerName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 10,
    },
    detailCard: {
        backgroundColor: 'white',
        width: '100%',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 17,
        marginLeft: 10,
        // marginRight: 10,
        color: 'black',
        fontWeight: '400',
    },
    section: {
        marginBottom: 25,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 15,
        borderBottomWidth: 3,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    inputContainer: {
        marginBottom: 15,
    },
    metricInputContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    addButton: {
        backgroundColor: '#1a237e',
        padding: 12,
        borderRadius: 8,
        marginLeft: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    noteCard: {
        backgroundColor: '#f0f7ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    noteDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    noteText: {
        fontSize: 17,
    },
    metricCard: {
        backgroundColor: '#f5fff0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    metricDate: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    metricValue: {
        fontSize: 17,
    },
    rating: {
        paddingVertical: 15,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    uploadOptions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imageContainer: {
        position: 'relative',
        width: 150,
        height: 150,
        marginBottom: 20,
        alignSelf: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
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
});

export default PlayerDetail;