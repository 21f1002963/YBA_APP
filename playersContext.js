import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playersData, initializePlayerData } from './utils/playersData';

export const PlayersContext = createContext();

export const PlayersProvider = ({ children }) => {
  const [players, setPlayers] = useState(initializePlayerData(playersData));
  const [playerPhotos, setPlayerPhotos] = useState({});

  // Load players from storage on initial render
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const storedPlayers = await AsyncStorage.getItem('players');
        if (storedPlayers) {
          setPlayers(JSON.parse(storedPlayers));
        }
      } catch (error) {
        console.error('Error loading players:', error);
      }
    };
    loadPlayers();
  }, []);

  // Save players to storage whenever they change
  useEffect(() => {
    const savePlayers = async () => {
      try {
        await AsyncStorage.setItem('players', JSON.stringify(players));
      } catch (error) {
        console.error('Error saving players:', error);
      }
    };
    savePlayers();
  }, [players]);

  // Load player photos
  useEffect(() => {
    const loadPlayerPhotos = async () => {
      const photos = {};
      await Promise.all(
        players.map(async (player) => {
          const imageUri = await getPlayerImage(player.id);
          if (imageUri) {
            photos[player.id] = imageUri;
          }
        })
      );
      setPlayerPhotos(photos);
    };
    loadPlayerPhotos();
  }, [players]);

  const addPlayer = (newPlayer) => {
    const newPlayerWithId = {
      ...newPlayer,
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setPlayers([...players, newPlayerWithId]);
  };

  const deletePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId));
  };

  const updatePlayerPhoto = (playerId, imageUri) => {
    setPlayerPhotos(prev => ({
      ...prev,
      [playerId]: imageUri
    }));
  };

  const updatePlayers = (updatedPlayers) => {
    setPlayers(updatedPlayers);
  };

  return (
    <PlayersContext.Provider
      value={{
        players,
        playerPhotos,
        addPlayer,
        deletePlayer,
        updatePlayerPhoto,
        updatePlayers // Add this new function
      }}
    >
      {children}
    </PlayersContext.Provider>
  );
};