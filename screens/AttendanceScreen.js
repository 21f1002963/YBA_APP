import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const AttendanceScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 25, fontWeight: 'bold', alignItems: 'center', width: '80%' }}>1) Attendance of the player, Option to mark it daily</Text>
        <Text style={{ fontSize: 25, fontWeight: 'bold', marginTop: 25, alignItems: 'center', width: '80%' }}>2) Shows daily, weekly and monthly Attendance rankers</Text>
      </View>
    </SafeAreaView>
  )
}

export default AttendanceScreen

const styles = StyleSheet.create({})