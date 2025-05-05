import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import React from 'react'
import BasketballAnimation from '../components/basketball';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native';

const Popup = () => {
    // const backgroundImage = require('../assets/background.jpg');
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', borderColor: 'black', borderWidth: 2, borderRadius: 20, margin: 5, padding: 5 }}>
            {/* <ImageBackground source={backgroundImage} style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}> */}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                    <BasketballAnimation />
                    {/* <Text style={{
                        fontSize: 80,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.25)',
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 4,
                        elevation: 5,
                        marginTop: 10,
                        letterSpacing: 2
                    }}>YBA</Text> */}
                    <Image source={require('../assets/YBA.jpg')}
                    style={{
                        width: 370,
                        height: 220,
                        borderRadius: 2,
                        resizeMode: 'cover',
                        // marginTop: 30,
                        marginBottom: 70,
                        marginRight: 7
                      }}></Image>
                    {/* <Text style={{ fontSize: 19, opacity: 0.7 }}>Youth Basketball Academy</Text> */}
                    {/* <Text style={{ fontSize: 19, opacity: 0.7 }}>Udaipur</Text> */}
                    <Text style={{ fontStyle: 'italic', marginTop: 40, paddingBottom: 90, fontSize: 18, fontWeight: '700' }}>' We will Sir '</Text>
                    <ActivityIndicator size="large" color="#007AFF" style={{ paddingBottom: 90 }} />
                </View>
            {/* </ImageBackground> */}
        </SafeAreaView>
    );
}

export default Popup

const styles = StyleSheet.create({})