import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const FeesScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 25, fontWeight: 'bold', alignItems: 'center', width: '80%' }}>1) Players who haven't paid the fees, and yet to pay</Text>
        <Text style={{ fontSize: 25, fontWeight: 'bold', alignItems: 'center', width: '80%', marginTop: 20 }}>2) Option to mark the payment</Text>
        <Text style={{ fontSize: 25, fontWeight: 'bold', alignItems: 'center', width: '80%', marginTop: 20 }}>3) Shows past payment history</Text>
      </View>
    </SafeAreaView>
  )
}

export default FeesScreen

const styles = StyleSheet.create({})