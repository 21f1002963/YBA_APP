import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native'
import React from 'react'
import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tournaments = () => {
  const [hovered, setHovered] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTournamentId, setcurrentTournamentId] = useState(null);

  const tournaments = [
    { id: 1, name: "Youth National Championship", date: "Jun 15-20", venue: 'Ahmedabad' },
    { id: 2, name: "Senior Nationals", date: "Dec 10-15", venue: 'Delhi' },

    { id: 3, name: "Maharastra State Championship", date: "Mar 5-10", venue: 'Mumbai' },
  ];

  const [newTournament, setNewTournament] = useState({
    name: '',
    from: '',
    to: '',
    venue: '',
  });

  const handleFromDateConfirm = (date) => {
    setOpenDatePicker(false);
    setSelectedDate(date);

    const formattedDate = date.toISOString().split('T')[0];
    setNewTournament({ ...newTournament, from: formattedDate });
  };

  const handleToDateConfirm = (date) => {
    setOpenDatePicker(false);
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    setNewTournament({ ...newTournament, to: formattedDate });
  };

  const handleHover = () => {
    Animated.spring(scaleValue, {
      toValue: hovered ? 1 : 1.05,
      useNativeDriver: true,
    }).start();
    setHovered(!hovered);
  };

  const handleAddTournament = () => {
    setModalVisible(false);
    setNewTournament({
      name: '',
      date: '',
      venue: '',
    });
  }

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('tournamentData');
      if (savedData) {
        setNewTournament(JSON.parse(savedData));
      }
    };
    loadData();
  }, []);

  // Save data when form is submitted
  const handleSubmit = async () => {
    await AsyncStorage.setItem(
      'tournamentData',
      JSON.stringify(newTournament)
    );
  };




  return (
    <View style={{
      flex: 1,
      padding: 15,
      backgroundColor: '#F8F8F8',
    }}>
      <ScrollView style={{ marginBottom: 0 }}>
        {tournaments.map((tournament) => (
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
              <View style={{flex: 1}}>
              <Text style={{
                fontSize: 19,
                fontWeight: '600',
                color: '#333',
              }}>{tournament.name}</Text>
              <Text style={{
                fontSize: 15,
                color: '#666',
                marginTop: 4,
                // }}>{tournament.from} - {tournament.to}</Text>
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
          }
        }
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          onPressIn={handleHover}
          onPressOut={handleHover}
          activeOpacity={0.7}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 35,
              fontWeight: '600',
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

              <Text style={{ fontSize: 17, marginBottom: 8 }}>From : </Text>
              <View style={{
                position: 'relative',
                marginBottom: 16,
              }}>
                <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                  <View pointerEvents='none'>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        fontSize: 16,
                      }}
                      placeholder="From Date "
                      placeholderTextColor="#999"
                      value={newTournament.from}
                      onChangeText={(text) => setNewTournament({ ...newTournament, date: text })}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 15,
                    top: 12
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
                  onConfirm={handleFromDateConfirm}
                  onCancel={() => setOpenDatePicker(false)}
                />
              </View>

              <Text style={{ fontSize: 17, marginBottom: 8 }}>To : </Text>
              <View style={{
                position: 'relative',
                marginBottom: 16,
              }}>
                <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                  <View pointerEvents='none'>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        fontSize: 16,
                      }}
                      placeholder="To Date"
                      placeholderTextColor="#999"
                      value={newTournament.to}
                      onChangeText={(text) => setNewTournament({ ...newTournament, date: text })}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 15,
                    top: 12
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
                  onConfirm={handleFromDateConfirm}
                  onCancel={() => setOpenDatePicker(false)}
                />
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
    </View>
  );
};

export default Tournaments
