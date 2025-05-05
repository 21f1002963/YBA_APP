import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const BasketballAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/basketball.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FFE0B2',
    // borderRadius: 150,
    overflow: 'hidden',
    marginTop: 60,
},
animation: {
    width: 240,
    height: 240,
  },
});

export default BasketballAnimation;
