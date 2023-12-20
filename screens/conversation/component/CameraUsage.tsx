import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useImage } from "../../../AuthProvider/ImageProvider";

function CameraUsage() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const { setImageRecord } = useImage();

  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const { width } = Dimensions.get("window");
  const height = Math.round((width * 16) / 9);

  const handleCameraReady = () => {
    // Adjust aspect ratio based on device orientation
    const isLandscape = width > height;

    let aspectRatio;
    if (isLandscape) {
      aspectRatio = height / width;
    } else {
      aspectRatio = width / height;
    }

    // Update camera aspect ratio
    if (cameraRef.current) {
      cameraRef.current
        .getSupportedRatiosAsync()
        .then((ratios) => {
          if (ratios.includes(String(aspectRatio))) {
            cameraRef.current.setRatio(aspectRatio);
          }
        })
        .catch((error) => {
          console.error("Error setting camera aspect ratio:", error);
        });
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageRecord(photo);
      setModalVisible(false); // Close the modal after taking a picture
    }
  };

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const openCameraModal = () => {
    console.log("clicked");
    setModalVisible(true);
    console.log("clicked2");
  };

  const closeCameraModal = () => {
    setModalVisible(false);
  };

  if (!permission || !permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to access the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Camera
            ratio="16:9"
            // style={styles.camera}
            style={{
              height: height,
              width: "100%",
            }}
            type={type}
            ref={cameraRef}
            onCameraReady={handleCameraReady}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraType}
            >
              <FontAwesome5 name="sync" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={takePicture}>
              <FontAwesome5 name="camera" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={closeCameraModal}
            >
              <FontAwesome5 name="times" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={openCameraModal}>
        <MaterialCommunityIcons name="camera" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalContainer: {
    flex: 1,
    // position: "relative",
    // height: "100%",
    backgroundColor: "black",
    // bottom: 0,
    // justifyContent: "flex-end", // Align content at the bottom
  },
  camera: {
    flex: 1,
    // width: "100%",
    // aspectRatio: 0.5,
    // position: "absolute",
    // height: "100%",
    // bottom: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  iconButton: {
    padding: 15,
    backgroundColor: "lightblue",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
});

export default CameraUsage;
