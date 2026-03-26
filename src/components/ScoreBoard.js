import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export default function ScoreBoard({ score, round, ducksShot, totalDucks }) {
  // Render duck indicators (shot = red, remaining = white)
  const renderDuckIndicators = () => {
    const indicators = [];
    for (let i = 0; i < totalDucks; i++) {
      indicators.push(
        <Text
          key={i}
          style={[
            styles.duckIndicator,
            i < ducksShot && styles.duckIndicatorHit,
          ]}
        >
          {i < ducksShot ? '✓' : '○'}
        </Text>
      );
    }
    return indicators;
  };

  return (
    <View style={styles.container}>
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.label}>PUAN</Text>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
      </View>

      {/* Round */}
      <View style={styles.roundContainer}>
        <Text style={styles.label}>RAUND</Text>
        <Text style={styles.roundText}>{round}/10</Text>
      </View>

      {/* Duck indicators */}
      <View style={styles.indicatorContainer}>
        <Text style={styles.label}>ÖRDEK</Text>
        <View style={styles.indicators}>{renderDuckIndicators()}</View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  roundContainer: {
    alignItems: 'center',
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.scoreText,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roundText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  indicators: {
    flexDirection: 'row',
    gap: 4,
  },
  duckIndicator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
  duckIndicatorHit: {
    color: COLORS.red,
  },
});
