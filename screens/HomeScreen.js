import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput } from 'react-native';
import React, { useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import Tournaments from './Tournaments'
import Players from './Players'
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'tournaments', title: 'Upcoming Tournaments' },
    { key: 'players', title: 'Players' },
  ])
  const [searchQuery, setSearchQuery] = useState('');

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'tournaments':
        return <Tournaments />
      case 'players':
        return <Players/> 
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <View style={{ marginTop: 0, width: '100%', height: 180, backgroundColor: 'black', position: 'relative' }}>
          <Image
            source={require('../assets/basketball.jpeg')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
              borderRadius: 25,
              transform: [{ translateY: 20 }],
              // zIndex: 2,
            }}></Image>


          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 140,
              top: 230,
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <View style={{
              position: 'absolute',
              bottom: 50,
              right: 0,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'white',
              padding: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Image
                source={require('../assets/SIR1.jpg')}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 50,
                  borderWidth: 2,
                  resizeMode: 'cover',
                  borderColor: '#9f4ec2',
                }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: 'black',
          marginTop: 60,
          marginLeft: 20,
          fontFamily: Platform.select({
            ios: 'ComicRelief-Regular',    // iOS
            android: 'comicrelief_regular' // Android
          })
        }}>
          YBA</Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center', marginTop: 10, width: '90%', flexDirection: 'row',
          backgroundColor: 'white',
          borderRadius: 25,
          paddingHorizontal: 15,
          height: 45,
          marginHorizontal: 16,
          borderWidth: 2,
          borderColor: 'grey',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          gap: 10,
        }}>
          <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for players"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            style={{
              flex: 1,
              height: 50,
              fontSize: 15,
              color: '#333',
              paddingLeft: 10,
            }}
          />
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: '100%', }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: 'blue', // Deep purple
              height: 4,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
            style={{
              backgroundColor: '#ffffff',
              elevation: 0.5,
              shadowOpacity: 2,
              borderBottomWidth: 3,
              borderBottomColor: '#f0f0f0',
              height: 60,
            }}
            labelStyle={{
              fontWeight: '600',
              fontSize: 20,
              textTransform: 'none',
              marginBottom: 8,
            }}
            activeColor="#7b2cbf" // Deep purple
            inactiveColor="#6c757d" // Muted gray
            tabStyle={{
              borderRightWidth: 3,
              borderRightColor: 'grey',
              paddingBottom: 6,
            }}
            renderLabel={({ route, focused, color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  color,
                  fontWeight: focused ? '800' : '600',
                  fontSize: 20,
                  letterSpacing: 0.5,
                }}>
                  {route.title}
                </Text>
                {focused && (
                  <View style={{
                    width: 24,
                    height: 3,
                    backgroundColor: '#7b2cbf',
                    borderRadius: 3,
                    marginTop: 4,
                  }} />
                )}
              </View>
            )}
          />
        )}
      ></TabView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})