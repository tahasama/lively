import { useEffect } from "react";
import { AuthProvider } from "./AuthProvider/AuthProvider";
import { ImageProvider } from "./AuthProvider/ImageProvider";
import Index from "./Index";
import * as Updates from "expo-updates";

export default function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      console.log(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  return (
    <AuthProvider>
      <ImageProvider>
        <Index />
      </ImageProvider>
    </AuthProvider>
  );
}
