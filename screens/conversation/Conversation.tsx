import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import {
  Composer,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { ref, onValue, set, off, get } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { dbr } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import renderAvatar from "./component/renderAvatar";
import { Entypo } from "@expo/vector-icons";
import ImagePickerC from "./component/ImagePickerC";
import { useImage } from "../../AuthProvider/ImageProvider";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface IMessage {
  _id: string;
  text: string;
  createdAt: any;
  user: any;
  image: string;
}

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
}

interface ConversationScreenProps {
  route: { params: { conversationId: string; title: string } };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversationId, title } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { image, setImage, setLoadingImage, loadingImage } = useImage();
  const [showImagePicker, setShowImagePicker] = useState(false); // State to control visibility

  const navigation = useNavigation();
  const chatRef = useRef<FlatList<IMessage> | null>(null);

  chatRef.current?.scrollToEnd();

  useEffect(() => {
    const conversationRef = ref(dbr, `groups/${conversationId}`);
    navigation.setOptions({ title: title });

    const handleData = (snapshot) => {
      const conversationData = snapshot.val();

      if (conversationData) {
        setMessages(
          conversationData.messages
            ? Object.values(conversationData.messages).map((msg: any) => ({
                _id: msg._id,
                text: msg.text,
                createdAt: new Date(msg.createdAt),
                user: msg.user,
                image: msg.image,
              }))
            : []
        );
      }

      setLoading(false);
    };

    // Subscribe to real-time updates
    onValue(conversationRef, handleData);

    return () => {
      // Unsubscribe when component unmounts
      // Cleanup subscriptions to avoid memory leaks
      off(conversationRef, "value", handleData);
    };
  }, [conversationId, navigation]);

  const handleSendMessage = async (newMessages: IMessage[]) => {
    try {
      const conversationRef = ref(dbr, `groups/${conversationId}`);

      const snapshot = await get(conversationRef);
      const currentMessages = snapshot.val()?.messages || [];

      const currentMessagesArray = Array.isArray(currentMessages)
        ? currentMessages
        : Object.values(currentMessages);

      const updatedMessages = [
        ...currentMessagesArray,
        ...newMessages.map((msg) => ({
          _id: msg._id,
          text: msg.text || "",
          createdAt: msg.createdAt.toISOString(),
          user: msg.user,
          image: image !== "" ? image : "",
        })),
      ];

      await set(conversationRef, {
        messages: updatedMessages,
      });
      setImage("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error updating Realtime Database:", error.message);
    }
  };

  const renderSend = ({ onSend, text, sendButtonProps, ...props }: any) => (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 10,
        right: 0,
      }}
      onPress={() => customOnPress(text, onSend)}
      disabled={loadingImage}
    >
      <Ionicons name="send" size={24} color="black" />
    </TouchableOpacity>
  );

  const customOnPress = (text: string, onSend: (messages: any) => void) => {
    // Customize the logic for sending messages here
    const isTextEmpty = !text || text.trim() === "";
    const isImageEmpty = !image || image.trim() === "";

    if (!isTextEmpty || !isImageEmpty) {
      const newMessages =
        isTextEmpty && isImageEmpty
          ? []
          : [{ text, image, _id: Math.random().toString() }];
      onSend(newMessages);
    }
  };

  const handleImagePickerToggle = () => {
    setShowImagePicker(!showImagePicker);
  };

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages: any) => handleSendMessage(newMessages)}
      user={{
        _id: user.id,
        name: user.username,
      }}
      renderSend={renderSend}
      renderAvatar={(props) => renderAvatar(props)}
      showAvatarForEveryMessage={true}
      inverted={false}
      alwaysShowSend
      renderUsernameOnMessage
      messageContainerRef={chatRef}
      infiniteScroll
      loadEarlier
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={{
            flexDirection: "row-reverse",
            justifyContent: "space-around",
            alignItems: "center",
            // margin: 5,
            gap: 20,
          }}
          renderComposer={(composerProps) => (
            <Composer
              {...composerProps}
              textInputStyle={{
                color: "#333",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#ccc",
                paddingHorizontal: 10,
                marginTop: 3,
                marginLeft: -20,
                flex: 6,
                opacity: showImagePicker ? 0 : 1,
                zIndex: showImagePicker ? 0 : 50,
                maxWidth: "86%",
              }}
            />
          )}
          renderAccessory={() => (
            <View
              style={{
                // flexDirection: "row",
                // alignItems: "center",
                // justifyContent: "center",
                // height: "100%",
                // marginLeft: 1,
                position: "absolute",
                bottom: 4,
                left: -10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  // width: !showImagePicker ? 25 : 100,
                }}
              >
                <TouchableOpacity onPress={handleImagePickerToggle}>
                  <Ionicons name="add" size={32} color="black" />
                </TouchableOpacity>
                {showImagePicker && <ImagePickerC />}
              </View>
            </View>
          )}
        />
      )}
    />
  );
};

export default ConversationScreen;
