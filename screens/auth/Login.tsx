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
import { auth } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuth();

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
      setError("Password reset email has been sent. Check your inbox.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lively Chat ...</Text>
      <Text style={{ textAlign: "center", color: "#999999" }}>
        By continuing, you agree on, and aknowledge that you've read Lively's{" "}
      </Text>
      <Text
        style={{
          color: "#0aaccc",
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
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.show}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#4285F4"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.passwordAdvise}>
        <AntDesign name="questioncircleo" size={13} color="#708090" /> Be
        careful with Uppercase and Lowercase letters!
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Register here</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
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
