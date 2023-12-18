import React from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const FileDownloadButton = ({ fileUrl }) => {
  const fileType = fileUrl
    .split("?")[0]
    .split("/")
    [fileUrl.split("?")[0].split("/").length - 1].split(".")[1];

  const iconMapping = {
    pdf: "file-pdf",
    docx: "file-word-o",
    xlsx: "file-excel-o",
    // Add more file types as needed
  };

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
      <TouchableOpacity
        onPress={handleDownload}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ marginBottom: 20 }}>Download File</Text>
        {fileType && iconMapping[fileType] && (
          <FontAwesome name={iconMapping[fileType]} size={30} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FileDownloadButton;
