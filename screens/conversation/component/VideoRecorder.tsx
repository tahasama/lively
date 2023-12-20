import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { FontAwesome5 } from "@expo/vector-icons";
import { useImage } from "../../../AuthProvider/ImageProvider";

const VideoRecorder = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isRecording, setRecording] = useState(false);

  const { recordedVideo, setRecordedVideo } = useImage();
  console.log("00000000000000000000000 recordedVideo:", recordedVideo);
  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const { width } = Dimensions.get("window");
  const height = Math.round((width * 16) / 9);

  const startRecording = async () => {
    setRecording(true);
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.recordAsync();
        console.log("111111111111111111111111 startRecording ~ uri:", uri);
        setRecordedVideo(uri);
      } catch (error) {
        console.error("Error starting video recording:", error);
      }
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const openVideoRecorderModal = () => {
    setModalVisible(true);
  };

  const closeVideoRecorderModal = () => {
    setModalVisible(false);
    // Reset recorded video URI when closing the modal
    // setRecordedVideo(null);
  };

  if (!permission || !permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View>
        <Text>We need your permission to access the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <Camera
            style={{
              height: height,
              width: "100%",
            }}
            type={CameraType.back}
            ref={cameraRef}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              padding: 20,
              position: "absolute",
              bottom: 0,
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleRecording}
            >
              <FontAwesome5
                name={isRecording ? "stop" : "video"}
                size={24}
                color={isRecording ? "red" : "white"}
              />
            </TouchableOpacity>
            {recordedVideo && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={closeVideoRecorderModal}
              >
                <FontAwesome5 name="check" size={24} color="white" />
              </TouchableOpacity>
            )}
            {!isRecording && !recordedVideo && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={closeVideoRecorderModal}
              >
                <FontAwesome5 name="times" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={openVideoRecorderModal}>
        <FontAwesome5 name="video" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default VideoRecorder;

const styles = StyleSheet.create({
  iconButton: {
    padding: 15,
    backgroundColor: "lightblue",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
});
