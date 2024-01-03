import { ref, update } from "firebase/database";
import React from "react";
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { dbr } from "../../../firebase";
import { useImage } from "../../../AuthProvider/ImageProvider";
import { useAuth } from "../../../AuthProvider/AuthProvider";

const Reactions = ({ message, conversationId }) => {
  const { reaction, setReaction } = useImage();
  const { user } = useAuth();

  const reactions = [
    { id: 1, emoji: "❤️" },
    { id: 2, emoji: "😊" },
    { id: 3, emoji: "😆" },
    { id: 4, emoji: "😲" },
    { id: 5, emoji: "😫" },
    { id: 6, emoji: "👍" },
    { id: 7, emoji: "👎" },
  ];

  const handleReactionSelection = async (item) => {
    const rtdb = `groups/${conversationId}/messages/${message._id}`;
    const conversationRef = ref(dbr, rtdb);

    const existingReactions = message?.reactions ? message.reactions : [];

    const toggleUserReaction = (reactions, userId, reaction) => {
      const existingUserReactionIndex = reactions.findIndex(
        (userReaction) =>
          userReaction.userId === userId &&
          userReaction.reaction.id === reaction.id
      );

      if (existingUserReactionIndex !== -1) {
        // If the user's reaction with the same ID already exists, remove it
        reactions.splice(existingUserReactionIndex, 1);
      } else {
        // If the user's reaction with the same ID doesn't exist, add it
        reactions.push({ userId, reaction });
      }

      return reactions;
    };

    if (item) {
      const updatedReactions = toggleUserReaction(
        existingReactions,
        user.id,
        item
      );

      // Step 3: Update the database with the modified array
      await update(conversationRef, { reactions: updatedReactions });
      setReaction(false);
    }
  };

  const removeMessage = async () => {
    const rtdb = `groups/${conversationId}/messages/${message._id}`;
    const conversationRef = ref(dbr, rtdb);

    await update(conversationRef, { alert: "This message was removed" });
    setReaction(false);
  };

  return (
    <View>
      {/* Common JSX for both sender and receiver */}
      {/* <Text>Common Content</Text> */}

      {message.user.id === user.id ? (
        // JSX for sender
        <TouchableOpacity onPress={removeMessage}>
          <Text>Remove</Text>
        </TouchableOpacity>
      ) : (
        // JSX for receiver
        <FlatList
          data={reactions}
          keyExtractor={(item) => item.id.toString()}
          style={{ flexDirection: "row", gap: 5, zIndex: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleReactionSelection(item)}>
              <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Reactions;
