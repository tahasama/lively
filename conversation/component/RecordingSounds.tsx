import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase storage functions
import { useAuth } from "../../AuthProvider/AuthProvider";
import { useImage } from "../../AuthProvider/ImageProvider";
import { storage } from "../../firebase";

const RecordingSounds = () => {
  const { user } = useAuth();
  const { setUploadProgress, setAudioRecord, setLoadingImage } = useImage();

  const [recording, setRecording] = useState<any>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const pingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animatePing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pingAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          Animated.timing(pingAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animatePing(); // Start the ping animation when the component mounts

    return () => {
      // Clean up animation on component unmount
      pingAnim.stopAnimation();
    };
  }, [pingAnim]);

  const pingStyle = {
    transform: [
      {
        scale: pingAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  const startRecording = async () => {
    setStatus(true);
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    setStatus(false);
    setTimeout(() => {
      toggleModal();
    }, 750);
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();

      const storageRef = ref(
        storage,
        `${user.id}_${Date.now().toString()}.m4a`
      );
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Set up an event listener to track the upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          // You can update the UI to show the progress to the user
        },
        (error) => {
          console.error("Error during upload:", error);
          // Handle errors
        },
        async () => {
          const res = await getDownloadURL(storageRef);

          setTimeout(() => {
            setAudioRecord(res);
            setLoadingImage(false);
          }, 2000);
        }
      );
    } catch (error) {
      console.error("Error during recording", error);
      setLoadingImage(false);
    }
  };

  return (
    <View>
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

        <TouchableOpacity style={styles.modalBackground} onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={startRecording}>
              <Animated.View
                style={[styles.pingContainer, status && pingStyle]}
              >
                <MaterialCommunityIcons
                  name="microphone"
                  size={30}
                  color="white"
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={stopRecording}>
              <MaterialCommunityIcons
                name="stop-circle"
                size={56}
                color="blue"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleModal}>
              <MaterialCommunityIcons
                name="close-circle"
                size={54}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons
          name={`microphone${!recording ? "" : "-off"}`}
          size={27}
          color="black"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  closeButton: {
    color: "blue",
    fontSize: 18,
    marginBottom: 0,
  },
  pingContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    borderRadius: 50,
    padding: 10,
  },
});

export default RecordingSounds;
