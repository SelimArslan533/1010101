import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Dog({ type }) {
  const getContent = () => {
    switch (type) {
      case 'sniff':
        return (
          <View style={styles.container}>
            <Text style={styles.dogEmoji}>🐕</Text>
            <Text style={styles.speechBubble}>Hav hav! 🐾</Text>
          </View>
        );
      case 'catch':
        return (
          <View style={styles.container}>
            <Text style={styles.dogEmoji}>🐕</Text>
            <Text style={styles.speechBubble}>Aferin! 🦆</Text>
          </View>
        );
      case 'laugh':
        return (
          <View style={styles.container}>
            <Text style={styles.dogEmoji}>🐕</Text>
            <Text style={styles.speechBubble}>Ha ha ha! 😂</Text>
          </View>
        );
      default:
        return <Text style={styles.dogEmoji}>🐕</Text>;
    }
  };

  return getContent();
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dogEmoji: {
    fontSize: 60,
  },
  speechBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
