import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import SearchUser from "../../home/components/SearchUser";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { EvilIcons, AntDesign } from "@expo/vector-icons";

const AddUsers = ({ route, navigation }) => {
  const { conversationId } = route.params;

  // const navigation = useNavigation<any>();
  const handleHeaderButtonPress = () => {
    // Do something when the header button is pressed
    console.log("Header button pressed");
  };

  const logOut = () => {
    signOut(auth).then(() => navigation.navigate("Login"));
  };

  return (
    <View
      style={{
        flexDirection: "row",
        height: "100%",
        width: "25%",
        alignItems: "center",
        justifyContent: "space-around",
        marginHorizontal: 5,
      }}
    >
      <TouchableOpacity onPress={handleHeaderButtonPress}>
        <SearchUser
          navigation={navigation}
          icon={"adduser"}
          conversationId={conversationId}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={logOut}>
        <AntDesign name="logout" size={21} color={"blue"} />
      </TouchableOpacity>
    </View>
  );
};

export default AddUsers;
