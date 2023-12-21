import * as React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Audio } from "expo-av";
import AudioPlayer from "./AudioPlayer";
import { useState } from "react";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import { useImage } from "../../../AuthProvider/ImageProvider";
import { storage } from "../../../firebase";

const RecordingSounds = () => {
  const [recording, setRecording] = useState<any>();
  const { user } = useAuth();
  const { audioRecord, setAudioRecord, setLoadingImage } = useImage();

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    const storageRef = ref(storage, user.id + ".m4a");
    const response = await fetch(uri);

    const blob = await response.blob();

    uploadBytesResumable(storageRef, blob)
      .then(async () => {
        const res = await getDownloadURL(storageRef);
        setTimeout(() => {
          // dispatch(updateUserImage({ userImage: res, userId: user.id }));
          setAudioRecord(res);
        }, 2000),
          setLoadingImage(false);
      })

      .catch((error) => {
        setLoadingImage(false);
      });

    setLoadingImage(false);
  }

  return (
    <View
    // style={styles.container}
    >
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
        <MaterialCommunityIcons
          name={`microphone${!recording ? "" : "-off"}`}
          size={27}
          color="black"
        />
      </TouchableOpacity>
      {/* <AudioPlayer audioUri={audioUri} /> */}
    </View>
  );
};

export default RecordingSounds;
