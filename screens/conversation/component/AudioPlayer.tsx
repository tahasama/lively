import React, { useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Sound from "react-native-sound";

const AudioPlayer = ({ source }) => {
  const sound = new Sound(source, "", (error) => {
    if (error) {
      console.error("Error loading audio file:", error);
    } else {
      console.log("Audio file loaded successfully");
    }
  });

  const playAudio = () => {
    sound.play((success) => {
      if (success) {
        console.log("Audio playback successful");
      } else {
        console.error("Audio playback failed");
      }
    });
  };

  useEffect(() => {
    return () => {
      // Stop and release the audio when the component is unmounted
      sound.stop(() => sound.release());
    };
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={playAudio}>
        <Text>Play Audio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
