import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DailyMetrics = ({ route }) => {
    const { metrics } = route.params;

    const parseDate = (dateString) => {
        // Try parsing as ISO format first
        let date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;

        // Try parsing as DD-MM-YYYY format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(date.getTime())) return date;
        }

        // Fallback to current date if parsing fails
        return new Date();
    };

    // Format date to show only time
    const formatTime = (dateString) => {
        const date = parseDate(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Group metrics by date
    const groupByDate = (metrics) => {
        return metrics.reduce((groups, metric) => {
            const date = parseDate(metric.date);
            const dateKey = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push({
                ...metric,
                time: formatTime(metric.date)
            });

            return groups;
        }, {});
    };

    // Convert grouped metrics to array for FlatList
    const groupedMetrics = Object.entries(groupByDate(metrics)).map(([date, metrics]) => ({
        date,
        metrics
    }));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Daily Metrics Records</Text>
            </View>

            {groupedMetrics.length > 0 ? (
            <FlatList
                data={groupedMetrics}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => (
                    <View style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>{item.date}</Text>
                        {item.metrics.map((metric) => (
                            <View key={metric.id} style={styles.metricCard}>
                                <Text style={styles.metricTime}>{metric.time}</Text>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricName}>{metric.name}:</Text>
                                    <Text style={styles.metricValue}>{metric.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />) : (
                            <View style={{
                                flex: 1,
                                backgroundColor: '#e3f2fd',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    color: '#666',
                                    textAlign: 'center',
                                }}>No records available</Text>
                            </View>
                        )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 20,
        backgroundColor: '#1a237e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#0d47a1',
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        color: 'white',
        textAlign: 'center',
    },
    listContent: {
        flexGrow: 1,
        backgroundColor: '#e3f2fd',
        padding: 18,
        paddingBottom: 30,
    },
    dateGroup: {
        marginBottom: 20,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a237e',
        marginBottom: 10,
        paddingLeft: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#1a237e',
        paddingBottom: 5,
    },
    metricCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    metricTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    metricName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    metricValue: {
        fontSize: 16,
        color: '#333',
    },
});

export default DailyMetrics;