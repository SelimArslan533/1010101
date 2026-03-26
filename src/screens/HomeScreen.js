import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../constants';

export default function HomeScreen({ navigation }) {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const duckAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(duckAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Floating duck animation
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      {/* Sky */}
      <View style={styles.sky}>
        {/* Clouds */}
        <View style={[styles.cloud, { top: 60, left: 30 }]} />
        <View style={[styles.cloud, { top: 100, right: 40 }]} />
        <View style={[styles.cloud, { top: 40, right: 120 }]} />

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  scale: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>DUCK</Text>
          <Text style={styles.titleHunt}>HUNT</Text>
          <Text style={styles.subtitle}>🎯 Klasik Ördek Avı 🎯</Text>
        </Animated.View>

        {/* Duck emoji */}
        <Animated.View
          style={[
            styles.duckContainer,
            {
              opacity: duckAnim,
              transform: [
                { translateY: floatY },
                {
                  scale: duckAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.duckEmoji}>🦆</Text>
        </Animated.View>
      </View>

      {/* Grass */}
      <View style={styles.grass}>
        {/* Dog */}
        <Animated.View
          style={[
            styles.dogContainer,
            {
              opacity: duckAnim,
              transform: [
                {
                  translateY: duckAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.dogEmoji}>🐕</Text>
        </Animated.View>

        {/* Start Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  scale: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Game')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>🔫 OYUNA BAŞLA</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Instructions */}
        <Animated.View style={{ opacity: buttonAnim }}>
          <Text style={styles.instructions}>
            Ördeklere dokunarak vur!{'\n'}
            Her ördek 100 puan!
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sky: {
    flex: 3,
    backgroundColor: COLORS.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grass: {
    flex: 2,
    backgroundColor: COLORS.grass,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 4,
    borderTopColor: COLORS.grassDark,
  },
  cloud: {
    position: 'absolute',
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.orange,
    textShadowColor: COLORS.brown,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 8,
  },
  titleHunt: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.red,
    textShadowColor: COLORS.darkBrown,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 8,
    marginTop: -15,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.white,
    marginTop: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  duckContainer: {
    marginTop: 20,
  },
  duckEmoji: {
    fontSize: 80,
  },
  dogContainer: {
    position: 'absolute',
    top: -40,
    right: 30,
  },
  dogEmoji: {
    fontSize: 60,
  },
  buttonContainer: {
    marginTop: 10,
  },
  startButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  instructions: {
    marginTop: 20,
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
});
