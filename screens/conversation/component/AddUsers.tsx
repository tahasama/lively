import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import SearchUser from "../../home/components/SearchUser";
import { useNavigation } from "@react-navigation/native";

const AddUsers = ({ route }) => {
  const { conversationId, title } = route.params;
  console.log(
    "🚀 ~ file: AddUsers.tsx:9 ~ AddUsers ~ route.params:",
    route.params
  );

  const navigation = useNavigation();
  const handleHeaderButtonPress = () => {
    // Do something when the header button is pressed
    console.log("Header button pressed");
  };
  return (
    <TouchableOpacity onPress={handleHeaderButtonPress}>
      <SearchUser
        navigation={navigation}
        icon={"adduser"}
        conversationId={conversationId}
        title={title}
      />
    </TouchableOpacity>
  );
};

export default AddUsers;
