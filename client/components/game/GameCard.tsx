import { Icon, View, Text, Box, HStack } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import moment from "moment";
import { Role } from "../../context/GameContext";
moment.locale("fr");

export type Partie = {
    currentNumberOfPlayer: number;
    host: string;
    id: number;
    nbPlayerMax: number;
    startDate: number;
    date: Date;
    ended: boolean;
    winningRole: Role | null;
};

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.toLocaleLowerCase().substring(1);
}

export default function GameCard(props: { game: Partie; buttons?: React.ReactNode }): React.ReactElement {
    const game = props.game;
    return (
        <Box my={2} padding={2} bgColor={"light.100"} borderRadius={5}>
            <HStack justifyContent={"space-between"}>
                <Text fontSize={"lg"} fontWeight={"bold"} color={"black"}>
                    # {game.id}
                </Text>
                <HStack alignItems={"center"} p={1} bg={"primary.100"} borderRadius={5}>
                    <Icon mr={2} name="people" as={<Ionicons />} fontSize={"lg"} fontWeight={"bold"} color={"black"} />
                    <Text fontSize={"lg"} fontWeight={"bold"} color={"black"}>
                        {game.currentNumberOfPlayer} / {game.nbPlayerMax}
                    </Text>
                </HStack>
            </HStack>
            <Text fontSize={"16"}>
                Créateur : <Text fontWeight={"500"}>{game.host}</Text>
            </Text>
            <HStack justifyContent={"space-between"} alignItems={"flex-end"}>
                {props.game.ended ? (
                    <Text fontSize={"16"}>Gagnants: {props.game.winningRole}</Text>
                ) : (
                    <Text fontSize={"16"}>{capitalize(game.date < new Date() ? moment(game.date).from(moment()) : moment().to(moment(game.date)))}</Text>
                )}
                <View display={"flex"} alignItems={"flex-end"}>
                    {props.buttons}
                </View>
            </HStack>
        </Box>
    );
}
