import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { Rating } from 'react-native-ratings';
import AntDesign from 'react-native-vector-icons/AntDesign';
const PlayerDetail = ({ route }) => {
    const { player } = route.params;
    const [notes, setNotes] = useState('');
    const [coachNotes, setCoachNotes] = useState([]);
    const [metrics, setMetrics] = useState({
        name: '',
        value: ''
    });
    const [playerMetrics, setPlayerMetrics] = useState([]);
    const [rating, setRating] = useState(3);

    const addCoachNote = () => {
        if (notes.trim()) {
            setCoachNotes([...coachNotes, {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString(),
                note: notes
            }]);
            setNotes('');
        }
    };

    const addPlayerMetric = () => {
        if (metrics.name.trim() && metrics.value.trim()) {
            setPlayerMetrics([...playerMetrics, {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString(),
                ...metrics
            }]);
            setMetrics({ name: '', value: '' });
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Player Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: player.image || 'https://via.placeholder.com/150' }}
                    style={styles.profileImage}
                />
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <AntDesign name="calendar" size={20} color="#555" />
                        <Text style={styles.detailText}>DOB: {player.dob}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <AntDesign name="phone" size={20} color="#555" />
                        <Text style={styles.detailText}>Contact: {player.contact}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <AntDesign name="enviroment" size={20} color="#555" />
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
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addCoachNote}>
                        <Text style={styles.buttonText}>Add Note</Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={coachNotes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.noteCard}>
                            <Text style={styles.noteDate}>{item.date}</Text>
                            <Text style={styles.noteText}>{item.note}</Text>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </View>

            {/* Player Metrics Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Metrics</Text>
                <View style={styles.metricInputContainer}>
                    <TextInput
                        style={[styles.input, { flex: 2 }]}
                        placeholder="Metric name"
                        value={metrics.name}
                        onChangeText={(text) => setMetrics({...metrics, name: text})}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1, marginLeft: 10 }]}
                        placeholder="Value"
                        value={metrics.value}
                        onChangeText={(text) => setMetrics({...metrics, value: text})}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addPlayerMetric}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={playerMetrics}
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
            </View>

            {/* Player Rating Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Player Rating</Text>
                <Rating
                    type='star'
                    ratingCount={5}
                    imageSize={30}
                    showRating
                    startingValue={rating}
                    onFinishRating={setRating}
                    style={styles.rating}
                />
                <Text style={styles.ratingText}>Current Rating: {rating}/5</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#1a237e',
        marginBottom: 15,
    },
    playerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 15,
    },
    detailCard: {
        backgroundColor: 'white',
        width: '100%',
        padding: 20,
        borderRadius: 10,
        elevation: 3,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#555',
    },
    section: {
        marginBottom: 25,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 15,
        borderBottomWidth: 1,
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
    },
    addButton: {
        backgroundColor: '#1a237e',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noteCard: {
        backgroundColor: '#f0f7ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    noteDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    noteText: {
        fontSize: 16,
    },
    metricCard: {
        backgroundColor: '#f5fff0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    metricDate: {
        fontSize: 12,
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
        fontSize: 16,
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
});

export default PlayerDetail;