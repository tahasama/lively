import { signOut } from "firebase/auth";
import { TouchableOpacity, Text } from "react-native";
import React from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthProvider/AuthProvider";
import { auth } from "../firebase";

// interface LogoutScreenProps {
//   navigation: any;
// }

const LogOut: React.FC = () => {
  const { setUser } = useAuth();
  const navigation = useNavigation<any>();
  const logOut = async () => {
    signOut(auth);
    setUser(null);
    await AsyncStorage.removeItem("userData");
    setTimeout(() => {
      navigation.navigate("Login");
    }, 750);
  };
  return (
    <TouchableOpacity onPress={logOut} style={{ marginRight: 18 }}>
      <AntDesign name="logout" size={24} color={"blue"} />
    </TouchableOpacity>
  );
};

export default LogOut;
