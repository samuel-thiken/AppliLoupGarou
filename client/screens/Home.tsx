import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import { Fab, Icon, ScrollView, View, Text, Heading, Button, Box } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import { API_BASE_URL } from "@env";
import GameCard, { Partie } from "../components/game/GameCard";

export default function Home(): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();
    const isFocused = useIsFocused();

    const createGame = (): void => {
        navigation.navigate("CreateGame");
    };
    const goToGame = (gameId: number): void => {
        navigation.navigate("Game", { gameId: gameId });
    };
    const context = useContext(UserContext);
    const [listeParties, setListeParties] = useState<Array<Partie>>([]);
    const [listePartiesUser, setListePartiesUser] = useState<Array<Partie>>([]);

    const requestListeDesParties = (): void => {
        request(`${API_BASE_URL}/game/search`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => res.json())
            .then((res) => {
                res.games.map((info: Partie) => {
                    info.date = new Date(info.startDate);
                });
                setListeParties(res.games);
            })
            .catch((e) => console.log(e));
    };

    const requestListeDesPartiesUser = (): void => {
        request(`${API_BASE_URL}/game/me`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => res.json())
            .then((res) => {
                res.games.map((info: Partie) => {
                    info.date = new Date(info.startDate);
                });
                setListePartiesUser(res.games);
            })
            .catch((e) => console.log(e));
    };

    const joinGame = (gameId: number): void => {
        request(`${API_BASE_URL}/game/${gameId}/join`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then(() => {
                requestListeDesParties();
                requestListeDesPartiesUser();
            })
            .catch(console.error);
    };

    const leaveGame = (gameId: number): void => {
        request(`${API_BASE_URL}/game/${gameId}/leave`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then(() => {
                requestListeDesParties();
                requestListeDesPartiesUser();
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (isFocused) {
            requestListeDesParties();
            requestListeDesPartiesUser();
        }
    }, [isFocused]);

    useEffect(() => {
        const interval = setInterval(() => {
            requestListeDesParties();
            requestListeDesPartiesUser();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const listePartiesNonUser = listeParties.filter((partie) => !listePartiesUser.find((p) => p.id === partie.id));

    return (
        <Background>
            <NavigationUI allowBack={false} />

            <ScrollView>
                <View>
                    <Heading color={"light.100"} m={4}>
                        Liste des parties existantes:
                    </Heading>
                    {listePartiesNonUser.map((informationPartie) => (
                        <GameCard
                            key={informationPartie.id}
                            game={informationPartie}
                            buttons={
                                informationPartie.ended ? (
                                    <Text fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                        La partie est terminée
                                    </Text>
                                ) : informationPartie.date > new Date() ? (
                                    <Button key={1} size="md" fontSize="lg" width={"130"} onPress={(): void => joinGame(informationPartie.id)}>
                                        Rejoindre la partie
                                    </Button>
                                ) : (
                                    <Text fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                        La partie a déjà commencée
                                    </Text>
                                )
                            }
                        />
                    ))}
                    {listePartiesNonUser.length === 0 && (
                        <Box padding={2} bgColor={"light.100"} borderRadius={5}>
                            <Text textAlign={"center"}>Aucune partie</Text>
                        </Box>
                    )}
                </View>

                <View>
                    <Heading color={"light.100"} m={4}>
                        Liste de vos parties:
                    </Heading>
                    {listePartiesUser.map((informationPartie) => (
                        <GameCard
                            key={informationPartie.id}
                            game={informationPartie}
                            buttons={
                                informationPartie.ended ? (
                                    <Text fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                        La partie est terminée
                                    </Text>
                                ) : informationPartie.date < new Date() ? (
                                    <Button key={1} size="md" fontSize="lg" width={"20"} onPress={(): void => goToGame(informationPartie.id)}>
                                        Go to game
                                    </Button>
                                ) : (
                                    <>
                                        <Text key={1} fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                            La partie n'a pas encore commencée
                                        </Text>
                                        <Button key={2} size="md" fontSize="lg" width={"20"} colorScheme={"red"} onPress={(): void => leaveGame(informationPartie.id)}>
                                            Quitter
                                        </Button>
                                    </>
                                )
                            }
                        />
                    ))}
                    {listePartiesUser.length === 0 && (
                        <Box padding={2} bgColor={"light.100"} borderRadius={5}>
                            <Text textAlign={"center"}>Aucune partie</Text>
                        </Box>
                    )}
                </View>
            </ScrollView>
            <Fab onPress={createGame} renderInPortal={false} shadow={2} size="sm" icon={<Icon color="white" as={AntDesign} name="plus" size="sm" />} />
        </Background>
    );
}
