import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, GAME_CONFIG, DUCK_SIZE } from '../constants';
import Duck from '../components/Duck';
import Dog from '../components/Dog';
import ScoreBoard from '../components/ScoreBoard';

const GAME_AREA_TOP = 80;
const GRASS_HEIGHT = 150;

export default function GameScreen({ navigation }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [ducksShot, setDucksShot] = useState(0);
  const [ducksFlown, setDucksFlown] = useState(0);
  const [totalDucksInRound, setTotalDucksInRound] = useState(0);
  const [ducks, setDucks] = useState([]);
  const [gameState, setGameState] = useState('dog_intro'); // dog_intro, playing, round_end, game_over
  const [ammo, setAmmo] = useState(3);
  const [showDogLaugh, setShowDogLaugh] = useState(false);
  const [showDogCatch, setShowDogCatch] = useState(false);
  const [hitEffects, setHitEffects] = useState([]);

  const duckIdRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const nextDuckId = () => ++duckIdRef.current;

  // Start dog intro animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState('playing');
      startRound(1);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const startRound = useCallback((roundNum) => {
    setDucks([]);
    setDucksShot(0);
    setDucksFlown(0);
    setTotalDucksInRound(0);
    setAmmo(3);
    setShowDogLaugh(false);
    setShowDogCatch(false);

    const speed = GAME_CONFIG.baseSpeed + (roundNum - 1) * GAME_CONFIG.speedIncrement;
    const ducksToSpawn = GAME_CONFIG.ducksPerRound;
    let spawned = 0;

    // Spawn ducks with interval
    spawnTimerRef.current = setInterval(() => {
      if (spawned >= ducksToSpawn) {
        clearInterval(spawnTimerRef.current);
        return;
      }
      spawned++;
      setTotalDucksInRound(spawned);

      const id = nextDuckId();
      const startX = Math.random() * (SCREEN_WIDTH - DUCK_SIZE);
      const duck = {
        id,
        startX,
        startY: SCREEN_HEIGHT - GRASS_HEIGHT - DUCK_SIZE,
        speed: speed + Math.random() * 2,
        direction: Math.random() > 0.5 ? 1 : -1,
        alive: true,
      };

      setDucks((prev) => [...prev, duck]);
    }, 1800);

    // Round timer - end round after all ducks have had time to fly
    roundTimerRef.current = setTimeout(() => {
      endRound(roundNum);
    }, GAME_CONFIG.roundDuration + 2000);
  }, []);

  const endRound = useCallback((roundNum) => {
    clearInterval(spawnTimerRef.current);
    setDucks([]);
    setGameState('round_end');

    setTimeout(() => {
      if (roundNum >= GAME_CONFIG.maxRounds) {
        setGameState('game_over');
      } else {
        const nextRound = roundNum + 1;
        setRound(nextRound);
        setGameState('playing');
        startRound(nextRound);
      }
    }, 2500);
  }, [startRound]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(spawnTimerRef.current);
      clearTimeout(roundTimerRef.current);
    };
  }, []);

  const handleDuckHit = useCallback((duckId, x, y) => {
    setDucks((prev) =>
      prev.map((d) => (d.id === duckId ? { ...d, alive: false } : d))
    );
    setScore((prev) => prev + GAME_CONFIG.pointsPerDuck * round);
    setDucksShot((prev) => prev + 1);
    setShowDogCatch(true);
    setTimeout(() => setShowDogCatch(false), 1500);

    // Add hit effect
    const effectId = Date.now();
    setHitEffects((prev) => [...prev, { id: effectId, x, y }]);
    setTimeout(() => {
      setHitEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 600);
  }, [round]);

  const handleDuckEscaped = useCallback((duckId) => {
    setDucks((prev) => prev.filter((d) => d.id !== duckId));
    setDucksFlown((prev) => prev + 1);
    setShowDogLaugh(true);
    setTimeout(() => setShowDogLaugh(false), 1500);
  }, []);

  const handleMiss = useCallback(() => {
    // Show miss effect at a random spot (visual feedback)
  }, []);

  const handleGameOver = () => {
    Alert.alert(
      'Oyun Bitti!',
      `Toplam Puan: ${score}\nVurulan Ördek: ${ducksShot}`,
      [
        { text: 'Ana Menü', onPress: () => navigation.navigate('Home') },
        {
          text: 'Tekrar Oyna',
          onPress: () => {
            setScore(0);
            setRound(1);
            setDucksShot(0);
            setGameState('playing');
            startRound(1);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Sky background */}
      <TouchableWithoutFeedback onPress={handleMiss}>
        <View style={styles.sky}>
          {/* Clouds */}
          <View style={[styles.cloud, { top: 30, left: 20 }]} />
          <View style={[styles.cloud, { top: 70, right: 50 }]} />
          <View style={[styles.cloud, { top: 15, left: SCREEN_WIDTH * 0.5 }]} />

          {/* Sun */}
          <View style={styles.sun}>
            <Text style={styles.sunEmoji}>☀️</Text>
          </View>

          {/* Ducks */}
          {ducks.map((duck) =>
            duck.alive ? (
              <Duck
                key={duck.id}
                duck={duck}
                onHit={handleDuckHit}
                onEscaped={handleDuckEscaped}
              />
            ) : null
          )}

          {/* Hit effects */}
          {hitEffects.map((effect) => (
            <HitEffect key={effect.id} x={effect.x} y={effect.y} />
          ))}

          {/* Dog intro */}
          {gameState === 'dog_intro' && (
            <View style={styles.dogIntro}>
              <Dog type="sniff" />
              <Text style={styles.dogText}>🐕 Hav hav! Ördek avına hazır ol!</Text>
            </View>
          )}

          {/* Round end */}
          {gameState === 'round_end' && (
            <View style={styles.roundEndOverlay}>
              <Text style={styles.roundEndText}>
                Raund {round} Bitti!
              </Text>
              <Text style={styles.roundEndScore}>
                Vurulan: {ducksShot} / {GAME_CONFIG.ducksPerRound}
              </Text>
            </View>
          )}

          {/* Game over */}
          {gameState === 'game_over' && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>OYUN BİTTİ!</Text>
              <Text style={styles.gameOverScore}>Puan: {score}</Text>
              <TouchableWithoutFeedback onPress={handleGameOver}>
                <View style={styles.restartButton}>
                  <Text style={styles.restartText}>DEVAM ET</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Grass / Ground */}
      <View style={styles.grass}>
        {/* Dog reactions */}
        {showDogCatch && (
          <View style={styles.dogReaction}>
            <Dog type="catch" />
          </View>
        )}
        {showDogLaugh && (
          <View style={styles.dogReaction}>
            <Dog type="laugh" />
          </View>
        )}

        {/* Trees */}
        <Text style={[styles.tree, { left: 10 }]}>🌲</Text>
        <Text style={[styles.tree, { right: 10 }]}>🌲</Text>
        <Text style={[styles.tree, { left: SCREEN_WIDTH * 0.4 }]}>🌳</Text>
      </View>

      {/* Score Board - Top HUD */}
      <ScoreBoard
        score={score}
        round={round}
        ducksShot={ducksShot}
        totalDucks={GAME_CONFIG.ducksPerRound}
      />

      {/* Back button */}
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Home')}>
        <View style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

function HitEffect({ x, y }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.hitEffect,
        {
          left: x - 20,
          top: y - 20,
          opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.8, 0],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 2],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.hitText}>💥</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sky: {
    flex: 1,
    backgroundColor: COLORS.sky,
  },
  cloud: {
    position: 'absolute',
    width: 70,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
  },
  sun: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sunEmoji: {
    fontSize: 40,
  },
  grass: {
    height: GRASS_HEIGHT,
    backgroundColor: COLORS.grass,
    borderTopWidth: 3,
    borderTopColor: COLORS.grassDark,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tree: {
    position: 'absolute',
    bottom: 20,
    fontSize: 50,
  },
  dogIntro: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dogText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  dogReaction: {
    position: 'absolute',
    bottom: 30,
    left: SCREEN_WIDTH / 2 - 40,
  },
  roundEndOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundEndText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.yellow,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  roundEndScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 10,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.red,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  gameOverScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.yellow,
    marginTop: 15,
  },
  restartButton: {
    marginTop: 30,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  restartText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  hitEffect: {
    position: 'absolute',
    zIndex: 100,
  },
  hitText: {
    fontSize: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
