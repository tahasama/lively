import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useImage } from "../../AuthProvider/ImageProvider";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import { Audio } from "expo-av";

const VideoRecorder = ({ color }: any) => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [permissionResponse, requestPermissionAudio] = Audio.usePermissions();

  const [isRecording, setRecording] = useState(false);
  const { user } = useAuth();
  const { setUploadProgress } = useImage();
  const [type, setType] = useState(CameraType.back);

  const { recordedVideo, setRecordedVideo } = useImage();

  const [isModalVisible, setModalVisible] = useState(false);

  const cameraRef = useRef(null);
  const { width, height } = Dimensions.get("window");
  // const height = Math.round((width * 16) / 9);

  // Import necessary components and libraries

  const startRecording = async () => {
    setRecording(true);
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.recordAsync();
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(
          storage,
          `${user.id}_${Date.now().toString()}.mp4`
        );

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
          () => {
            // Upload completed successfully
            getDownloadURL(storageRef)
              .then((res) => {
                setRecordedVideo(res);
              })
              .catch((error) => {
                console.error("Error getting download URL:", error);
              });
          }
        );
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
    setModalVisible(false);
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

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (
    !permissionResponse ||
    !permission ||
    !permission.granted ||
    !permissionResponse.granted
  ) {
    // Camera permissions are not granted yet
    return (
      <>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          // style={styles.container}
        >
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" />

          <View
            style={[
              styles.modalContainer,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 18,
                marginHorizontal: 5,
              }}
            >
              We need your permission to access the camera
            </Text>
            <View
              style={{
                maxWidth: "50%",
                // alignItems: "center",
                justifyContent: "center",
                gap: 30,
                marginTop: 40,
                // borderRadius: 50,
              }}
            >
              <Button
                onPress={() => {
                  requestPermission();
                  requestPermissionAudio();
                }}
                title="Grant Permission"
              />
              <Button
                onPress={closeVideoRecorderModal}
                title="Close"
                color={"purple"}
              />
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={openVideoRecorderModal}>
          <FontAwesome5 name="video" size={24} color="black" />
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <Camera
            style={{
              height: height - 100,
              width: width,
            }}
            type={type}
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
              backgroundColor: "rgba(255, 255, 255, 0)", // Lighter background color
            }}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraType}
            >
              <FontAwesome5 name="sync" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleRecording}
            >
              <FontAwesome5
                name={isRecording ? "stop" : "video"}
                size={24}
                color={isRecording ? "red" : "#f8f4ff"} // Assuming your original color was white
              />
            </TouchableOpacity>
            {recordedVideo ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={closeVideoRecorderModal}
              >
                <FontAwesome5 name="check" size={24} color="black" />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton}>
                <TouchableOpacity onPress={closeVideoRecorderModal}>
                  <FontAwesome5 name="times" size={24} color="#f8f4ff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={openVideoRecorderModal}>
        <FontAwesome5 name="video" size={24} color={color} />
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
  modalContainer: {
    flex: 1,
    // position: "relative",
    // height: "100%",
    backgroundColor: "rgba(0, 0, 0, 1)",

    // bottom: 0,
    // justifyContent: "flex-end", // Align content at the bottom
  },
});
