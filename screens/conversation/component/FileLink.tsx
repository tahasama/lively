import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DocumentPicker from "react-native-document-picker";

const FileLink = ({ onFilePick }) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Pass the picked file to the parent component
      onFilePick(result);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User canceled the picker
      } else {
        console.error("Error picking document", err);
      }
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={pickDocument}>
        <Text>Pick a Document</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FileLink;
