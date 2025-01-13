import React, {useContext} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {AgentContext} from '../AgentControls/AgentContext'; // Ensure the path matches your project structure

// ChatItem Component
const ChatItem = ({item}) => {
  const isSelf = item.isSelf;

  return (
    <View
      style={[
        styles.chatBubble,
        isSelf ? styles.selfBubble : styles.otherBubble,
      ]}>
      <Text style={styles.chatText}>{item.text}</Text>
    </View>
  );
};

// Main Chat Component
const ChatScreen = () => {
  const {chatItems} = useContext(AgentContext); // Access chatItems from AgentContext

  return (
    <View style={styles.container}>
      <FlatList
        data={chatItems}
        keyExtractor={item => `${item.uid}`}
        renderItem={({item}) => <ChatItem item={item} />}
        contentContainerStyle={styles.chatList}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatList: {},
  chatBubble: {
    maxWidth: '70%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  selfBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    border: '1px solid blue',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    border: '1px solid green',
  },
  chatText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default ChatScreen;
