import InputText from "../inputs/InputText";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, IconButton, Select } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "../Collapsible";

type LocalMessage = {
    type: ChatType;
    date: Date;
    author: string;
    content: string;
};

type ServerMessage = {
    author: string;
    date: number;
    chat_type: ChatType;
    content: string;
};

enum ChatType {
    CHAT_VILLAGE = "CHAT_VILLAGE",
    CHAT_WEREWOLF = "CHAT_WEREWOLF",
    CHAT_SPIRITISM = "CHAT_SPIRITISM",
}
const ChatName: { [key in ChatType]: string } = {
    CHAT_VILLAGE: "Village",
    CHAT_WEREWOLF: "Loups",
    CHAT_SPIRITISM: "Spiritisme"
};

export default function ChatComponent(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<LocalMessage>>([]);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState<Array<ChatType>>([]);
    const [selectedChat, setSelectedChat] = useState<ChatType>(ChatType.CHAT_VILLAGE);

    const sendMessage = (): void => {
        console.log(gameContext.phase);
        gameContext.sendJsonMessage("CHAT_SENT", { date: new Date().getTime(), content: message, chat_type: selectedChat });
        setMessage("");
    };

    const infoChat = (data: { [key in ChatType]: Array<ServerMessage> }): void => {
        // Il s'agit du récap des chats : l'info qu'on avait avant devient invalide
        const msgs: Array<LocalMessage> = [];
        const newChats = Object.keys(data) as unknown as ChatType[];
        for (const key of newChats) {
            msgs.push(
                ...data[key].map((msg) => ({
                    date: new Date(msg.date),
                    author: msg.author,
                    content: msg.content,
                    type: key
                }))
            );
        }
        setChats(newChats);
        setSelectedChat(newChats[0]);
        setMessages(msgs);
    };

    const onMessage = useCallback((data: ServerMessage): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                type: data.chat_type,
                date: new Date(data.date),
                author: data.author,
                content: data.content
            }
        ]);
    }, []);

    const onChatJoin = (data: { chat_type: ChatType }): void => {
        setChats([...chats, data.chat_type]);
    };
    const onChatQuit = (data: { chat_type: ChatType }): void => {
        setChats([...chats.filter((c) => c !== data.chat_type)]);
        setMessages([...messages.filter((msg) => msg.type !== data.chat_type)]);
    };

    useEffect(() => {
        gameContext.registerEventHandler("CHAT_RECEIVED", onMessage);
        gameContext.registerEventHandler("GET_ALL_INFO_CHAT", infoChat);
        gameContext.registerEventHandler("QUIT_CHAT", onChatQuit);
        gameContext.registerEventHandler("JOIN_CHAT", onChatJoin);
    }, []);

    return (
        <Collapsible name="Chat" isDefaultOpen={false}>
            <Select selectedValue={selectedChat} onValueChange={(value): void => setSelectedChat(value as unknown as ChatType)}>
                {chats.map((chat, i) => (
                    <Select.Item key={i} label={ChatName[chat]} value={chat} />
                ))}
            </Select>
            <View>
                <ScrollView bg={"light.300"} p={2}>
                    {messages.filter((msg) => msg.type === selectedChat).length > 0 ? (
                        messages
                            .filter((msg) => msg.type === selectedChat)
                            .map((msg, i) => (
                                <View key={i}>
                                    <Text>
                                        {msg.author} : {msg.content}
                                    </Text>
                                </View>
                            ))
                    ) : (
                        <Text>Aucun message</Text>
                    )}
                </ScrollView>
                <InputText value={message} onChange={setMessage} InputRightElement={<IconButton icon={<Ionicons name="send" />} onPress={sendMessage} color={"primary.600"} />} />
            </View>
        </Collapsible>
    );
}
