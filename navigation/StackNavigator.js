import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Popup from '../screens/Popup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import FeesScreen from '../screens/FeesScreen';
import PlayerDetail from '../screens/PlayerDetail';
import Players from '../screens/Players';
import Tournaments from '../screens/Tournaments';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    function BottomTabs() {
        return (
            <Tab.Navigator
                screenOptions={() => ({
                    tabBarStyle: {
                        height: 60,
                        backgroundColor: '#1a237e',
                        paddingHorizontal: 5,
                        paddingTop: 10,
                    },
                    tabBarItemStyle: {
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    tabBarShowLabel: false,
                })}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStack}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                name="home-outline"
                                size={30}
                                color={focused ? "white" : "#989898"}
                            />
                        )
                    }}
                />
                <Tab.Screen
                    name="Attendance"
                    component={AttendanceScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                name="people"
                                size={32}
                                color={focused ? "white" : "#989898"}
                            />
                        )
                    }}
                />
                <Tab.Screen
                    name="Fees"
                    component={FeesScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <MaterialCommunityIcons
                                name="cash"
                                size={35}
                                color={focused ? "white" : "#989898"}
                            />
                        )
                    }}
                />
            </Tab.Navigator>
        );
    }

    const PopupScreen = () => {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Popup" component={Popup} />
            </Stack.Navigator>
        );
    }

    function HomeStack() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="HomeScreen" component={HomeScreen}
                    options={{
                        headerShown: false
                    }} />
                <Stack.Screen name="Tournaments" component={Tournaments}
                    options={{
                        headerShown: false
                    }} />
                <Stack.Screen name="Players" component={Players}
                    options={{
                        headerShown: false
                    }} />
                <Stack.Screen name="PlayerDetail" component={PlayerDetail}
                    options={{
                        headerShown: false
                    }} />
            </Stack.Navigator>
        );
    }

    return (
        <NavigationContainer>
            {isLoading ? (
                <PopupScreen />
            ) : (
                <BottomTabs />
            )}
        </NavigationContainer>
    );
}

export default StackNavigator;