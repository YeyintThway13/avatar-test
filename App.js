import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import axios from 'axios';
import { Audio } from 'expo-av';

const GOOGLE_TTS_API_KEY = 'AIzaSyDQ9XG2K-7GTnYhREG3HdyxDh3lqlNo9e4';

export default function App() {
  const [text, setText] = useState('Hello from Google Cloud Text to Speech!');
  const [sound, setSound] = useState(null);

  const speak = async () => {
    if (!text.trim()) return;

    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          input: { text: text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Wavenet-C', // Neural voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 1.0,
          },
        }
      );

      const base64Audio = response.data.audioContent;
      const uri = `data:audio/mp3;base64,${base64Audio}`;

      // Load and play audio
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();

    } catch (error) {
      console.error('TTS Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to generate speech.');
    }
  };

  // Cleanup sound
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Text to speak:</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type something to speak"
      />
      <Button title="Speak with Google Cloud TTS" onPress={speak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
});
