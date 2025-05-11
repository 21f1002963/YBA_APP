import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

const AttendanceChart = ({ route }) => {
  const { players } = route.params;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate all days for the selected month
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 2);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const allDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Calculate daily attendance counts for all days in month
  const dailyAttendance = allDaysInMonth.map(date => {
    const presentCount = players.filter(player =>
      player.attendance[date] === 'present'
    ).length;
    return {
      date,
      presentCount,
      dayOfMonth: new Date(date).getDate()
    };
  });

  // Prepare chart data
  const chartData = {
    labels: dailyAttendance.map(item => item.dayOfMonth.toString()),
    datasets: [{
      data: dailyAttendance.map(item => item.presentCount),
    }]
  };

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Change month (handles year wrapping)
  const changeMonth = (increment) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Calculate chart height based on number of days
  const chartHeight = Math.max(400, dailyAttendance.length * 16);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'black' }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 26,
              left: 18,
              zIndex: 1,
              padding: 10,
              backgroundColor: 'white',
              borderRadius: 50,
              elevation: 25,
            }}
          >
            <AntDesign name="arrowleft" size={25} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>MONTHLY ATTENDANCE</Text>
        </View>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <MaterialIcons name="chevron-left" size={30} color="#1a237e" />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {monthNames[selectedMonth]} {selectedYear}
        </Text>

        <TouchableOpacity onPress={() => changeMonth(1)}>
          <MaterialIcons name="chevron-right" size={30} color="#1a237e" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true} >
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width, dailyAttendance.length * 40)}
            height={chartHeight}
            fromZero
            yAxisLabel=" "
            xAxisLabel=" "
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: () => '#228B22',
              labelColor: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
              fillShadowGradient: '#228B22', // Ensures fill is solid
              fillShadowGradientOpacity: 1,
              // barPercentage: 0.5,
              style: {
                borderRadius: 16,
                paddinRight: 0,
                paddingBottom: 0,
              },
              barPercentage: 0.8,
              propsForLabels: {
                fontSize: 14,
                fontWeight: 'bold'
              },
              propsForBackgroundLines: {
                strokeWidth: 1.5
              },
              propsForVerticalLabels: {
                fontSize: 15,
                fontWeight: 'bold'
              },
              propsForHorizontalLabels: {
                fontSize: 15,
                fontWeight: 'bold',
              }
            }}
            verticalLabelRotation={0}
            horizontalLabelRotation={0}
            showBarTops={true}
            style={styles.chart}

          />
        </View>
      </ScrollView>

      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>X-Axis: Day of Month</Text>
        <Text style={styles.legendText}>Y-Axis: Number of Players Present</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 15,
  },
  header: {
    padding: 30,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    elevation: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 35,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#e0e0e0',
  },
  monthText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1a237e',
  },
  chartWrapper: {
    padding: 10,
    marginTop: 20,
  },
  chart: {
    marginVertical: 8,
    // borderWidth: 1,
    borderRadius: 10,
    paddingTop: 15,
    paddingLeft: -20,
    paddingBottom: 0,
    marginBottom: 0,
  },
  legendContainer: {
    padding: 0,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    // marginVertical: 3,
    marginBottom: 20,
  },
});

export default AttendanceChart;