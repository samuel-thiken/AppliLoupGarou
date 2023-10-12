import { useState } from "react";
import { Pressable, View, Text, Icon, Divider } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

export default function Collapsible(props: { name: string; isDefaultOpen?: boolean; children: React.ReactNode }): React.ReactElement {
    const [isOpen, setIsOpen] = useState(props.isDefaultOpen);

    return (
        <View>
            <Pressable px={5} py={2} onPress={(): void => setIsOpen((open) => !open)}>
                <View display={"flex"} justifyContent={"space-between"} flexDirection={"row"} alignItems={"center"}>
                    <Text>{props.name}</Text>
                    <Icon as={MaterialIcons} name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} />
                </View>
            </Pressable>
            <Divider />
            {isOpen ? <View p={2}>{props.children}</View> : <View display={"none"}>{props.children}</View>}
        </View>
    );
}
