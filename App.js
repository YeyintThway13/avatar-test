import React, { useState, useRef } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const GOOGLE_API_KEY = 'AIzaSyDQ9XG2K-7GTnYhREG3HdyxDh3lqlNo9e4';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.ogg',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_OGG,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_OPUS,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
    extension: '.caf',
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  }
      });

      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const info = await FileSystem.getInfoAsync(uri);
      console.log("File info:", info);
      console.log("URI: " + uri);
      setRecording(null);
      convertToText(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const convertToText = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
      },
      audio: {
          content: base64,
        },
      }
    );
    console.log("Base64 length: ", base64.length);
    console.log("Data: " + response.data.JSON);
    console.log("Full response:", JSON.stringify(response.data, null, 2));

    const result =
      response.data.results
        ?.map(r => {
          console.log("Transcript: " + r.alternatives[0].transcript);
          return r.alternatives[0].transcript;
        })
        .join('\n') || 'No text found.';

    setTranscript(result);
  } catch (err) {
    console.error(err.response?.data || err.message);
    setTranscript('Transcription failed.');
  }
};

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <Text style={styles.transcript}>{transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  transcript: { marginTop: 20, fontSize: 16 },
});
