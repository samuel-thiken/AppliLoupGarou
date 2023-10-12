import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import React, { useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { GameContext, GamePhase, Role } from "../context/GameContext";
import ChatComponent from "../components/game/Chat";
import { Box, Text, View } from "native-base";
import PlayersList from "../components/game/PlayersList";
import { PowerContext } from "../context/PowerContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";

export default function Jeux(): React.ReactElement {
    const gameContext = useContext(GameContext);
    const powerContext = useContext(PowerContext);
    const navigation = useNavigation<StackNavigation>();

    const { token } = useContext(UserContext);

    const getAllInfos = (): void => {
        gameContext.sendJsonMessage("GET_ALL_INFO", {});
    };

    const onGameEnded = (data: { winningRole: Role }): void => {
        gameContext.closeConnection();
        navigation.navigate("Home");
    };

    const onBack = (): void => {
        gameContext.closeConnection();
    };

    useEffect(() => {
        gameContext.registerEventHandler("AUTHENTICATION", getAllInfos);
        gameContext.sendJsonMessage("AUTHENTICATION", { token: token });

        gameContext.registerEventHandler("END_GAME", onGameEnded);
    }, []);

    const Overlay = powerContext.getOverlay();

    return (
        <Background page="Game">
            <NavigationUI allowBack onBack={onBack} />
            <Overlay />

            <PlayersList />

            <Box bg="light.100" minWidth={200} position={"absolute"} maxWidth={"100%"} right={0} bottom={0}>
                <ChatComponent />
            </Box>
        </Background>
    );
}
