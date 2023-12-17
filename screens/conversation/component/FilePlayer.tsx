import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";

const FileDownloadButton = ({ fileUrl }) => {
  const handleDownload = async () => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);

      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        console.error("Don't know how to open URI: " + fileUrl);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleDownload}>
        <Text>Download File</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FileDownloadButton;
