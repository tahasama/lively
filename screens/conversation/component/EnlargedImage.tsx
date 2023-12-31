import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";

const EnlargedImage = ({ imageUri, onClose }) => {
  const { height, width } = Dimensions.get("window");
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true} // Modal is always visible when displaying the enlarged image
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

        <View style={styles.modalContainer}>
          <Image
            style={{
              width: width - 16, // Adjusted for padding
              height: height || width, // Adjusted for padding and to maintain aspect ratio
              // Add other styles as needed
              resizeMode: "contain",
            }}
            source={{ uri: imageUri }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the opacity as needed
  },
  modalContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
});

export default EnlargedImage;
