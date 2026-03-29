import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import {
  SCREEN_WIDTH, SCREEN_HEIGHT, COLORS,
  GAME_CONFIG, DUCK_TYPES, ROUND_CONFIG,
} from '../constants';
import Duck from '../components/Duck';
import Dog from '../components/Dog';
import ScoreBoard from '../components/ScoreBoard';

const GRASS_HEIGHT = 150;

export default function GameScreen({ navigation }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [ducksShot, setDucksShot] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [ducks, setDucks] = useState([]);
  const [gameState, setGameState] = useState('dog_intro');
  const [lives, setLives] = useState(GAME_CONFIG.maxLives);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [comboText, setComboText] = useState('');
  const [showDogLaugh, setShowDogLaugh] = useState(false);
  const [showDogCatch, setShowDogCatch] = useState(false);
  const [hitEffects, setHitEffects] = useState([]);
  const [roundMessage, setRoundMessage] = useState('');

  const duckIdRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const lastHitTimeRef = useRef(0);
  const comboRef = useRef(0);
  const nextDuckId = () => ++duckIdRef.current;

  // Combo animation
  const comboAnim = useRef(new Animated.Value(0)).current;

  // Start dog intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState('playing');
      startRound(1);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getRoundConfig = (roundNum) => {
    return ROUND_CONFIG[roundNum] || ROUND_CONFIG[10];
  };

  const pickDuckType = (roundNum) => {
    const config = getRoundConfig(roundNum);
    const types = config.duckTypes;
    // Boss appears only once per round
    const randomIdx = Math.floor(Math.random() * types.length);
    return types[randomIdx];
  };

  const startRound = useCallback((roundNum) => {
    setDucks([]);
    setDucksShot(0);
    setMissCount(0);
    setCombo(0);
    comboRef.current = 0;
    setShowDogLaugh(false);
    setShowDogCatch(false);

    const config = getRoundConfig(roundNum);

    // Show round message
    setRoundMessage(`RAUND ${roundNum}`);
    setTimeout(() => setRoundMessage(''), 1500);

    let spawned = 0;
    let bossSpawned = false;

    spawnTimerRef.current = setInterval(() => {
      if (spawned >= config.ducksPerRound) {
        clearInterval(spawnTimerRef.current);
        return;
      }
      spawned++;

      let type = pickDuckType(roundNum);
      // Only one boss per round
      if (type === 'boss') {
        if (bossSpawned) {
          type = 'fast';
        } else {
          bossSpawned = true;
        }
      }

      const duckType = DUCK_TYPES[type];
      const id = nextDuckId();
      const startX = Math.random() * (SCREEN_WIDTH - duckType.size);
      const duck = {
        id,
        type,
        startX,
        startY: SCREEN_HEIGHT - GRASS_HEIGHT - duckType.size,
        speed: config.baseSpeed + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        alive: true,
      };

      setDucks((prev) => [...prev, duck]);
    }, config.spawnInterval);

    // Round end timer
    const totalTime = config.spawnInterval * config.ducksPerRound + 4000;
    roundTimerRef.current = setTimeout(() => {
      endRound(roundNum);
    }, totalTime);
  }, []);

  const endRound = useCallback((roundNum) => {
    clearInterval(spawnTimerRef.current);
    setDucks([]);
    setGameState('round_end');

    setTimeout(() => {
      if (lives <= 0) {
        setGameState('game_over');
        return;
      }
      if (roundNum >= GAME_CONFIG.maxRounds) {
        setGameState('game_over');
      } else {
        const nextRound = roundNum + 1;
        setRound(nextRound);
        setGameState('playing');
        startRound(nextRound);
      }
    }, 2500);
  }, [startRound, lives]);

  useEffect(() => {
    return () => {
      clearInterval(spawnTimerRef.current);
      clearTimeout(roundTimerRef.current);
    };
  }, []);

  // Check if lives ran out
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      clearInterval(spawnTimerRef.current);
      clearTimeout(roundTimerRef.current);
      setDucks([]);
      setTimeout(() => setGameState('game_over'), 1000);
    }
  }, [lives, gameState]);

  const handleDuckHit = useCallback((duckId, x, y, duckType) => {
    setDucks((prev) =>
      prev.map((d) => (d.id === duckId ? { ...d, alive: false } : d))
    );

    // Combo logic
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTimeRef.current;
    lastHitTimeRef.current = now;

    let newCombo;
    if (timeSinceLastHit < GAME_CONFIG.comboTimeWindow) {
      newCombo = comboRef.current + 1;
    } else {
      newCombo = 0;
    }
    comboRef.current = newCombo;
    setCombo(newCombo);

    // Calculate points with combo multiplier
    const comboIdx = Math.min(newCombo, GAME_CONFIG.comboMultipliers.length - 1);
    const multiplier = GAME_CONFIG.comboMultipliers[comboIdx];
    const typeConfig = DUCK_TYPES[duckType] || DUCK_TYPES.normal;
    const points = Math.round(typeConfig.points * multiplier * round);

    setScore((prev) => prev + points);
    setDucksShot((prev) => prev + 1);

    // Show combo text
    if (newCombo >= 1) {
      setComboText(`COMBO x${multiplier}!`);
      setShowCombo(true);
      Animated.sequence([
        Animated.spring(comboAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        Animated.timing(comboAnim, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
      ]).start(() => setShowCombo(false));
    }

    // Dog catch reaction
    setShowDogCatch(true);
    setTimeout(() => setShowDogCatch(false), 1200);

    // Hit effect
    const effectId = Date.now();
    setHitEffects((prev) => [...prev, { id: effectId, x, y, points, duckType }]);
    setTimeout(() => {
      setHitEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 800);

    // Remove dead duck after delay
    setTimeout(() => {
      setDucks((prev) => prev.filter((d) => d.id !== duckId));
    }, 100);
  }, [round, comboAnim]);

  const handleDuckEscaped = useCallback((duckId) => {
    setDucks((prev) => prev.filter((d) => d.id !== duckId));
    setMissCount((prev) => {
      const newMiss = prev + 1;
      if (newMiss % GAME_CONFIG.missesPerLifeLost === 0) {
        setLives((l) => l - 1);
      }
      return newMiss;
    });
    // Reset combo on miss
    comboRef.current = 0;
    setCombo(0);

    setShowDogLaugh(true);
    setTimeout(() => setShowDogLaugh(false), 1200);
  }, []);

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setDucksShot(0);
    setMissCount(0);
    setLives(GAME_CONFIG.maxLives);
    setCombo(0);
    comboRef.current = 0;
    setGameState('playing');
    startRound(1);
  };

  return (
    <View style={styles.container}>
      {/* Sky */}
      <TouchableWithoutFeedback>
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

          {/* Hit effects with points */}
          {hitEffects.map((effect) => (
            <HitEffect
              key={effect.id}
              x={effect.x}
              y={effect.y}
              points={effect.points}
              duckType={effect.duckType}
            />
          ))}

          {/* Combo display */}
          {showCombo && (
            <Animated.View
              style={[
                styles.comboContainer,
                {
                  opacity: comboAnim,
                  transform: [
                    {
                      scale: comboAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.comboText}>{comboText}</Text>
            </Animated.View>
          )}

          {/* Round message */}
          {roundMessage !== '' && (
            <View style={styles.roundMessageOverlay}>
              <Text style={styles.roundMessageText}>{roundMessage}</Text>
            </View>
          )}

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
              <Text style={styles.roundEndText}>Raund {round} Bitti!</Text>
              <Text style={styles.roundEndScore}>
                Vurulan: {ducksShot} ördek
              </Text>
              <Text style={styles.roundEndLives}>
                {'❤️'.repeat(lives)}{'🖤'.repeat(GAME_CONFIG.maxLives - lives)}
              </Text>
            </View>
          )}

          {/* Game over */}
          {gameState === 'game_over' && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverEmoji}>
                {lives <= 0 ? '💀' : '🏆'}
              </Text>
              <Text style={styles.gameOverText}>
                {lives <= 0 ? 'OYUN BİTTİ!' : 'TEBRİKLER!'}
              </Text>
              <Text style={styles.gameOverScore}>Puan: {score.toLocaleString()}</Text>
              <Text style={styles.gameOverRound}>Raund: {round}/10</Text>

              <TouchableWithoutFeedback onPress={resetGame}>
                <View style={styles.restartButton}>
                  <Text style={styles.restartText}>🔄 TEKRAR OYNA</Text>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => navigation.navigate('Home')}>
                <View style={[styles.restartButton, styles.homeButton]}>
                  <Text style={styles.restartText}>🏠 ANA MENÜ</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Grass */}
      <View style={styles.grass}>
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
        <Text style={[styles.tree, { left: 10 }]}>🌲</Text>
        <Text style={[styles.tree, { right: 10 }]}>🌲</Text>
        <Text style={[styles.tree, { left: SCREEN_WIDTH * 0.4 }]}>🌳</Text>
      </View>

      {/* HUD */}
      <ScoreBoard
        score={score}
        round={round}
        ducksShot={ducksShot}
        lives={lives}
        combo={combo}
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

function HitEffect({ x, y, points, duckType }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const typeConfig = DUCK_TYPES[duckType] || DUCK_TYPES.normal;

  return (
    <Animated.View
      style={[
        styles.hitEffect,
        {
          left: x - 30,
          top: y - 30,
          opacity: anim.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [1, 1, 0],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -60],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0.5, 1.3, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.hitEmoji}>💥</Text>
      <Text style={[styles.hitPoints, { color: typeConfig.color }]}>
        +{points}
      </Text>
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
  roundMessageOverlay: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  roundMessageText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    letterSpacing: 4,
  },
  comboContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  comboText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.comboText,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
  roundEndLives: {
    fontSize: 30,
    marginTop: 10,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverEmoji: {
    fontSize: 80,
  },
  gameOverText: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.red,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    marginTop: 10,
  },
  gameOverScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.yellow,
    marginTop: 15,
  },
  gameOverRound: {
    fontSize: 20,
    color: COLORS.white,
    marginTop: 5,
  },
  restartButton: {
    marginTop: 20,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.white,
    minWidth: 220,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: COLORS.skyDark,
  },
  restartText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  hitEffect: {
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
  },
  hitEmoji: {
    fontSize: 35,
  },
  hitPoints: {
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
