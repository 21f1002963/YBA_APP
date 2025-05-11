// utils/playerStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const savePlayerImage = async (playerId, imageUri) => {
  try {
    const playerData = await AsyncStorage.getItem(`player_${playerId}`);
    const data = playerData ? JSON.parse(playerData) : {};
    await AsyncStorage.setItem(
      `player_${playerId}`,
      JSON.stringify({ ...data, image: imageUri })
    );
    return true;
  } catch (error) {
    console.error('Error saving player image:', error);
    return false;
  }
};

export const getPlayerImage = async (playerId) => {
  try {
    const playerData = await AsyncStorage.getItem(`player_${playerId}`);
    if (playerData) {
      const data = JSON.parse(playerData);
      return data.image || null;
    }
    return null;
  } catch (error) {
    console.error('Error loading player image:', error);
    return null;
  }
};