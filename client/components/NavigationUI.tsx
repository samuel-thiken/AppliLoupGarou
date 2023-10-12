import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { StackNavigation } from "../App";
import ImageButton from "./ImageButton";

const iconPadding = 30;

export default function NavigationUI(props: { allowBack?: boolean, onBack?: () => void }): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();

    return (
        <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            {props.allowBack && (
                <ImageButton
                    tintColor={"white"}
                    onPress={navigation.goBack}
                    source={require("../assets/arrow.png")}
                    style={{ position: "absolute", top: iconPadding, left: iconPadding, width: 30, height: 30 }}
                />
            )}
            <ImageButton
                tintColor={"white"}
                onPress={(): void => navigation.navigate("Settings")}
                source={require("../assets/gear.png")}
                style={{ position: "absolute", top: iconPadding, right: iconPadding, width: 30, height: 30 }}
            />
        </View>
    );
}
