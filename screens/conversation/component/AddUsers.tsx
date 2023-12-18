import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import SearchUser from "../../home/components/SearchUser";
import { useNavigation } from "@react-navigation/native";

const AddUsers = ({ route }) => {
  const { conversationId } = route.params;

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
      />
    </TouchableOpacity>
  );
};

export default AddUsers;
