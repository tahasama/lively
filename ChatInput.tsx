// ChatInput.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={message}
        onChangeText={(text) => setMessage(text)}
      />
      <TouchableOpacity onPress={handleSend}>
        <Ionicons name="send" size={24} color="#4285F4" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
  },
});

export default ChatInput;
