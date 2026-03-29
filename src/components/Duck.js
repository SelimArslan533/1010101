import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DUCK_TYPES } from '../constants';

export default function Duck({ duck, onHit, onEscaped }) {
  const duckType = DUCK_TYPES[duck.type] || DUCK_TYPES.normal;
  const size = duckType.size;

  const posX = useRef(new Animated.Value(duck.startX)).current;
  const posY = useRef(new Animated.Value(duck.startY)).current;
  const wingFlap = useRef(new Animated.Value(0)).current;
  const escaped = useRef(false);
  const [hitsLeft, setHitsLeft] = useState(duckType.hitsRequired);
  const hitFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wing flapping - faster for fast ducks
    const flapSpeed = duck.type === 'fast' || duck.type === 'golden' ? 120 : 200;
    Animated.loop(
      Animated.sequence([
        Animated.timing(wingFlap, {
          toValue: 1,
          duration: flapSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(wingFlap, {
          toValue: 0,
          duration: flapSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flight duration based on speed
    const speed = duck.speed * duckType.speedMultiplier;
    const duration = Math.max(3000, 8000 - speed * 600);
    const targetY = -size - 50;

    // Zigzag complexity based on duck type
    const zigzagPoints = [];
    const steps = duck.type === 'boss' ? 6 : duck.type === 'golden' ? 5 : 4;
    for (let i = 0; i < steps; i++) {
      const targetX = duck.type === 'golden'
        ? Math.random() * (SCREEN_WIDTH - size) // golden flies wildly
        : duck.startX + (Math.random() - 0.5) * SCREEN_WIDTH * 0.7;
      zigzagPoints.push(
        Animated.timing(posX, {
          toValue: Math.max(0, Math.min(targetX, SCREEN_WIDTH - size)),
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

    if (duckType.hitsRequired > 1 && hitsLeft > 1) {
      // Boss duck - needs multiple hits
      setHitsLeft((prev) => prev - 1);
      // Flash red on hit
      Animated.sequence([
        Animated.timing(hitFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(hitFlash, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    } else {
      // Duck is killed
      escaped.current = true;
      onHit(duck.id, pageX, pageY, duck.type);
    }
  };

  const flapRotation = wingFlap.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', duck.type === 'fast' ? '20deg' : '12deg'],
  });

  const flapScale = wingFlap.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  const flashOpacity = hitFlash.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.duck,
          {
            width: size,
            height: size,
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
        <Text style={[styles.duckEmoji, { fontSize: size - 10 }]}>
          {duckType.emoji}
        </Text>

        {/* Boss health indicator */}
        {duck.type === 'boss' && (
          <View style={styles.healthBar}>
            <View
              style={[
                styles.healthFill,
                {
                  width: `${(hitsLeft / duckType.hitsRequired) * 100}%`,
                  backgroundColor: hitsLeft > 1 ? '#00FF00' : '#FF0000',
                },
              ]}
            />
          </View>
        )}

        {/* Hit flash overlay for boss */}
        <Animated.View
          style={[
            styles.hitFlash,
            {
              opacity: flashOpacity,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />

        {/* Point value label */}
        <View style={[styles.pointLabel, { backgroundColor: duckType.color }]}>
          <Text style={styles.pointText}>{duckType.points}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  duck: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duckEmoji: {
    textAlign: 'center',
  },
  healthBar: {
    width: 50,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    marginTop: -5,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },
  hitFlash: {
    position: 'absolute',
    backgroundColor: 'red',
  },
  pointLabel: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  pointText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },
});
