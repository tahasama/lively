// LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthProvider/AuthProvider";
import { auth } from "../firebase";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, darkMode } = useAuth();

  const handleLogin = async () => {
    try {
      const xx = await signInWithEmailAndPassword(auth, email, password);
      // setUser(xx);
      // AsyncStorage.setItem("userData", JSON.stringify(xx));
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      // Handle login error
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        setError("Email is required to reset the password");
        return;
      }

      // Send a password reset email
      await sendPasswordResetEmail(auth, email);

      // Inform the user that a password reset email has been sent
      setError("Password reset email has been sent. Please check your inbox.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode ? "#1E1E1E" : "#F9F9F9",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 24,
          fontWeight: "bold",
          color: darkMode ? "#FFFFFF" : "#333333",
        }}
      >
        Lively Chat ...
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: darkMode ? "#AAAAAA" : "#999999",
        }}
      >
        By continuing, you agree on, and acknowledge that you've read Lively's{" "}
      </Text>
      <Text
        style={{
          color: darkMode ? "#4285F4" : "#0A8CC2",
          textDecorationLine: "underline",
          marginBottom: 20,
          fontSize: 16,
        }}
        onPress={() =>
          Linking.openURL(
            "https://www.privacypolicies.com/live/ca35efc1-6094-4aca-b26d-54ba9a6c0035"
          )
        }
      >
        Privacy policy
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? "#666666" : "#f6f6f6",
            color: darkMode ? "#efefef" : "#333",
            borderColor: darkMode ? "#333333" : "#ccc",
          },
        ]}
        placeholder="Email"
        placeholderTextColor={darkMode ? "#efefef" : "#333"}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <TextInput
          style={[
            styles.passwordInput,
            {
              backgroundColor: darkMode ? "#666666" : "#f6f6f6",
              color: darkMode ? "#efefef" : "#333",
              borderColor: darkMode ? "#333333" : "#ccc",
            },
          ]}
          placeholder="Password"
          placeholderTextColor={darkMode ? "#efefef" : "#333"}
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{
            height: 48,
            borderColor: darkMode ? "#555555" : "#dddddd",
            marginBottom: 14,
            paddingLeft: 12,
            borderRadius: 8,
            justifyContent: "center",
          }}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={darkMode ? "#999999" : "#4285F4"}
          />
        </TouchableOpacity>
      </View>
      <Text
        style={{
          color: darkMode ? "#AAAAAA" : "#708090",
          marginBottom: 20,
        }}
      >
        <AntDesign
          name="questioncircleo"
          size={13}
          color={darkMode ? "#999999" : "#708090"}
        />{" "}
        Be careful with Uppercase and Lowercase letters!
      </Text>
      {error && (
        <Text
          style={{
            color: darkMode ? "#b20000" : "red",
            marginBottom: 16,
            fontSize: 16,
          }}
        >
          {error}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.loginButton,
          {
            backgroundColor: darkMode ? "#274f92" : "#4285F4",
          },
        ]}
        onPress={handleLogin}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Login
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: darkMode ? "#AAAAAA" : "#555555",
          }}
        >
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text
            style={{
              fontSize: 16,
              color: darkMode ? "#346ac3" : "#4285F4",
              fontWeight: "bold",
            }}
          >
            Register here
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text
          style={{
            marginTop: 20,
            color: darkMode ? "#346ac3" : "#4285F4",
            fontSize: 16,
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  input: {
    height: 48,
    width: "100%",
    borderColor: "#dddddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#333333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderColor: "#dddddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#333333",
  },
  passwordAdvise: {
    color: "#708090",
    marginBottom: 20,
  },
  show: {
    height: 48,
    borderColor: "#dddddd",
    marginBottom: 14,
    paddingLeft: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  showPasswordText: {
    color: "#4285F4",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    marginTop: 20,
    color: "#4285F4",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 16,
    color: "#555555",
  },
  registerLink: {
    fontSize: 16,
    color: "#4285F4",
    fontWeight: "bold",
  },
});

export default LoginScreen;
