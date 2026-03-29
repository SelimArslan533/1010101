import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, GAME_CONFIG } from '../constants';

export default function ScoreBoard({ score, round, ducksShot, lives, combo }) {
  return (
    <View style={styles.container}>
      {/* Score */}
      <View style={styles.section}>
        <Text style={styles.label}>PUAN</Text>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
      </View>

      {/* Round */}
      <View style={styles.section}>
        <Text style={styles.label}>RAUND</Text>
        <Text style={styles.roundText}>{round}/10</Text>
      </View>

      {/* Lives */}
      <View style={styles.section}>
        <Text style={styles.label}>CAN</Text>
        <Text style={styles.livesText}>
          {'❤️'.repeat(Math.max(0, lives))}
          {'🖤'.repeat(Math.max(0, GAME_CONFIG.maxLives - lives))}
        </Text>
      </View>

      {/* Ducks shot */}
      <View style={styles.section}>
        <Text style={styles.label}>VURUŞ</Text>
        <Text style={styles.shotText}>{ducksShot}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 35,
    left: 50,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
  },
  section: {
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.scoreText,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roundText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  livesText: {
    fontSize: 14,
  },
  shotText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
});
