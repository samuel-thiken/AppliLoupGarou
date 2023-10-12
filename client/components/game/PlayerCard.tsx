import { Actionsheet, Box, Button, Center, Container, Heading, Image, Pressable, Text, Tooltip, View, useDisclose, useToast } from "native-base";
import { getImageSource, images } from "./image";
import { GameContext, Player } from "../../context/GameContext";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { VoteContext } from "../../context/VoteContext";
import Bandeau from "./Bandeau";
import { PowerContext } from "../../context/PowerContext";

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);
    const voteContext = useContext(VoteContext);
    const powerContext = useContext(PowerContext);

    const { isOpen, onOpen, onClose } = useDisclose();

    const toast = useToast();

    const setMessageToast = (message: string): void => {
        toast.show({
            title: "Info",
            description: message,
            variant: "subtle",
            borderColor: "green.700",
            borderLeftWidth: 3
        });
    };

    const suggestVote = (): void => {
        voteContext.vote(props.player.username, true);
        onClose();
    };
    const ratify = (shouldKill: boolean): void => {
        voteContext.vote(props.player.username, shouldKill);
        onClose();
    };

    const playerRatification = voteContext.ratifications.find((r) => r.target === props.player.username);

    const getVoteElement = (): React.ReactNode => {
        if (playerRatification) {
            return (
                <Actionsheet.Item>
                    <View width={"100%"} display={"flex"} flexDirection={"row"}>
                        <Button colorScheme={"green"} onPress={(): void => ratify(false)} flexGrow={1}>
                            Voter pour la vie
                        </Button>
                        <Button colorScheme={"red"} onPress={(): void => ratify(true)} flexGrow={1}>
                            Voter pour la mort
                        </Button>
                    </View>
                </Actionsheet.Item>
            );
        } else {
            return <Actionsheet.Item onPress={suggestVote}>[Vote] Proposer comme cible</Actionsheet.Item>;
        }
    };

    const PlayerActions = powerContext.getPlayerActions();

    return (
        <Pressable
            onPress={(): void => {
                if (!gameContext.me.alive) {
                    setMessageToast("Vous ne pouvez pas interagir lorsque vous êtes mort");
                    return;
                }
                onOpen();
            }}
        >
            <Box bg={props.player.username === userContext.username ? "amber.200" : "light.100"} borderRadius={5} p={2} overflow={"hidden"}>
                <Center display={"flex"} flexDirection={"row"}>
                    <Image alt="Player image" source={require("../../assets/images/player.png")} width={70} height={70} resizeMode="cover" />
                    <Container>
                        <View display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} mb={2} style={{ gap: 3 }}>
                            {props.player.roles.map((role, i) => (
                                <Tooltip key={i} label={role.toString()} placement="top">
                                    <Image alt={`${role.toString()} role image`} source={getImageSource(role).uri} size={"xs"} resizeMode="cover" />
                                </Tooltip>
                            ))}
                            {props.player.powers.map((power, i) => (
                                <Tooltip key={i} label={power.toString()} placement="top">
                                    <Image alt={`${power.toString()} role image`} source={getImageSource(power).uri} size={"xs"} resizeMode="cover" />
                                </Tooltip>
                            ))}
                        </View>
                        <Text>{props.player.username}</Text>
                    </Container>

                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content>
                            <Heading w="100%" textAlign={"center"}>
                                {props.player.username}
                            </Heading>
                            {voteContext.active && !voteContext.result && getVoteElement()}
                            <PlayerActions close={onClose} player={props.player.username} userContext={userContext} gameContext={gameContext} powerContext={powerContext} />
                        </Actionsheet.Content>
                    </Actionsheet>
                </Center>
                {!props.player.alive && <Bandeau text="MORT" textColor={"red.700"} />}
                {voteContext.active && voteContext.result === props.player.username && <Bandeau text="VOTÉ" textColor={"emerald.500"} />}
                {voteContext.active && playerRatification && (
                    <View position={"absolute"} width={"100%"} height={2} display={"flex"} justifyContent={"space-between"} left={0} bottom={0} flexDirection={"row"}>
                        <View bg={"red.400"} width={`${(playerRatification.countForKilling / (voteContext.participants)) * 100}%`} height={"100%"} />
                        <View bg={"green.400"} width={`${(playerRatification.countForLiving / (voteContext.participants)) * 100}%`} height={"100%"} />
                    </View>
                )}
            </Box>
        </Pressable>
    );
}
