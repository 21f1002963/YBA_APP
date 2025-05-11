import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, SectionList, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

const AttendanceRankers = ({ route }) => {
  const { players } = route.params;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current week number
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);

  // Helper function to get week number
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

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

  // Get all dates the coach has marked attendance for
  const getAllMarkedDates = (players) => {
    const allDates = new Set();
    players.forEach(player => {
      Object.keys(player.attendance).forEach(date => {
        allDates.add(date); // Add each unique date
      });
    });
    return allDates; // Return a Set with unique dates
  };

  // Calculate attendance for time period
  const calculateAttendance = (player, timeFilter, allMarkedDates) => {
    const dates = Object.keys(player.attendance).filter(date => {
      const d = new Date(date);
      if (timeFilter === 'weekly') {
        return getWeekNumber(d) === currentWeek && d.getFullYear() === currentDate.getFullYear();
      } else if (timeFilter === 'monthly') {
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }
      return true;
    });

    // Present count (how many times player was marked present)
    const presentCount = dates.filter(d => player.attendance[d] === 'present').length;

    // Total days = the number of unique days the coach has marked attendance for
    const totalDays = allMarkedDates.size;

    return {
      presentCount,
      totalDays,
      percentage: (presentCount / totalDays) * 100
    };
  };

  // Get all the unique dates that attendance was marked for
  const allMarkedDates = getAllMarkedDates(players);

  // Prepare all players data
  const allPlayers = players.map(player => {
    const weekly = calculateAttendance(player, 'weekly', allMarkedDates);
    const monthly = calculateAttendance(player, 'monthly', allMarkedDates);
    const overall = calculateAttendance(player, 'all', allMarkedDates);

    return {
      ...player,
      weekly,
      monthly,
      overall
    };
  });

  // Get top 3 weekly and monthly rankers
  const weeklyRankers = [...allPlayers]
    .sort((a, b) => b.weekly.percentage - a.weekly.percentage)
    .slice(0, 3);

  const monthlyRankers = [...allPlayers]
    .sort((a, b) => b.monthly.percentage - a.monthly.percentage)
    .slice(0, 3);

  // Get remaining players (excluding top rankers)
  const remainingPlayers = allPlayers
    .filter(player =>
      !weeklyRankers.includes(player) &&
      !monthlyRankers.includes(player)
    )
    .sort((a, b) => b.overall.percentage - a.overall.percentage);

  // Get color based on percentage
  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 70) return '#FBC02D'; // Yellow
    if (percentage >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Render item for each player
  const renderPlayerItem = ({ item, section, index }) => {
    const isRanker = section.title.includes('Rankers');
    const data = isRanker ?
      (section.title.includes('Weekly') ? item.weekly : item.monthly) :
      item.overall;

    return (
      <View style={[
        styles.playerItem,
        {
          backgroundColor: getPercentageColor(data.percentage),
          opacity: isRanker ? 1 : 0.8
        }
      ]}>
        {isRanker && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
        )}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.attendanceText}>
            {data.presentCount}/{data.totalDays} ({data.percentage.toFixed(1)}%)
          </Text>
        </View>
        {isRanker && (
          <MaterialIcons
            name={section.title.includes('Weekly') ? 'date-range' : 'calendar-today'}
            size={24}
            color="white"
          />
        )}
      </View>
    );
  };

  // Section data for SectionList
  const sections = [
    {
      title: 'Monthly Rankers',
      data: monthlyRankers,
    },
    {
      title: 'All Players',
      data: remainingPlayers,
    }
  ];

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
          <Text style={styles.headerText}>ATTENDANCE LEADERS</Text>
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlayerItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    elevation: 50
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
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 30,
  },
  sectionHeader: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#3949ab',

  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    marginTop: 10,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(73, 45, 45, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  attendanceText: {
    fontSize: 17,
    color: 'white',
  },
  listContainer: {
    marginTop: 10,
    paddingBottom: 22,
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
});

export default AttendanceRankers;
