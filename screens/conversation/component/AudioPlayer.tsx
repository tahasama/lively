import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";

const AudioPlayer = ({ audioUri }) => {
  const [sound, setSound] = useState<any>();
  const [isPlaying, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function loadAudio() {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );
      setSound(sound);

      const status: any = await sound.getStatusAsync();
      setDuration(status.durationMillis);

      // Add a listener to update the position state during playback
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isPlaying) {
          setPosition(status.positionMillis);
        }
      });
    }

    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (value) => {
    if (sound) {
      sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="black" />
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        value={position}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={handleSliderChange}
        disabled={!sound}
        thumbTintColor="gray"
        maximumTrackTintColor="white"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 10,
    flexDirection: "row",
    // backgroundColor: "red",
    marginTop: 10,
  },
  slider: {
    width: "70%",
    marginTop: 0,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  timeText: {
    color: "black",
  },
});

export default AudioPlayer;
