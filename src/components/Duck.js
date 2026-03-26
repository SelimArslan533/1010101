import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DUCK_SIZE } from '../constants';

export default function Duck({ duck, onHit, onEscaped }) {
  const posX = useRef(new Animated.Value(duck.startX)).current;
  const posY = useRef(new Animated.Value(duck.startY)).current;
  const wingFlap = useRef(new Animated.Value(0)).current;
  const escaped = useRef(false);

  useEffect(() => {
    // Wing flapping animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(wingFlap, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(wingFlap, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Movement - duck flies upward in a zigzag pattern
    const duration = (8000 - duck.speed * 500);
    const targetY = -DUCK_SIZE - 50;

    // Random zigzag X movement
    const zigzagPoints = [];
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      zigzagPoints.push(
        Animated.timing(posX, {
          toValue: Math.random() * (SCREEN_WIDTH - DUCK_SIZE),
          duration: duration / steps,
          useNativeDriver: true,
        })
      );
    }

    // Fly upward
    Animated.timing(posY, {
      toValue: targetY,
      duration: duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !escaped.current) {
        escaped.current = true;
        onEscaped(duck.id);
      }
    });

    // Zigzag horizontal
    Animated.sequence(zigzagPoints).start();
  }, []);

  const handlePress = (evt) => {
    const { pageX, pageY } = evt.nativeEvent;
    onHit(duck.id, pageX, pageY);
  };

  const flapRotation = wingFlap.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const flapScale = wingFlap.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.duck,
          {
            transform: [
              { translateX: posX },
              { translateY: posY },
              { rotate: flapRotation },
              { scaleX: duck.direction },
              { scale: flapScale },
            ],
          },
        ]}
      >
        <Text style={styles.duckEmoji}>🦆</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  duck: {
    position: 'absolute',
    width: DUCK_SIZE,
    height: DUCK_SIZE,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duckEmoji: {
    fontSize: DUCK_SIZE - 10,
  },
});
