import { Actionsheet, View, Text, Image } from "native-base";
import { GameContext, Power, Role } from "../../../context/GameContext";
import { PlayerActionsProps } from "../../../context/PowerContext";
import PowerOverlay from "./PowerOverlay";
import { useContext, useEffect, useState } from "react";
import { getImageSource } from "../image";

export function Overlay(): React.ReactElement {
    const [lastDiscovered, setLastDiscovered] = useState<null | Array<Power | Role>>(null);

    const gameContext = useContext(GameContext);

    const onUsed = (data: { role: Role; power: Power }): void => {
        setLastDiscovered([data.role, data.power]);
        setTimeout(() => {
            setLastDiscovered(null);
        }, 30 * 1000);
    };

    useEffect(() => {
        gameContext.registerEventHandler("CLAIRVOYANCE_RESPONSE", onUsed);
    }, []);

    return (
        <PowerOverlay power={Power.CLAIRVOYANCE}>
            {lastDiscovered && (
                <View marginTop={"10%"} padding={2} borderRadius={5} bg={"light.100:alpha.50"}>
                    <Text textAlign={"center"}>Rôle et pouvoir découvert</Text>
                    <View display={"flex"} flexDirection={"row"} justifyContent={"center"}>
                        {lastDiscovered.map((roleOrPower) => (
                            <Image source={getImageSource(roleOrPower).uri} alt={`${roleOrPower} image`} size={"sm"} margin={3} />
                        ))}
                    </View>
                </View>
            )}
        </PowerOverlay>
    );
}

export function PlayerActions(props: PlayerActionsProps): React.ReactElement {
    const gameContext = props.gameContext;
    const userContext = props.userContext;
    const powerContext = props.powerContext;

    const onUse = (): void => {
        console.log("here");
        gameContext.sendJsonMessage("USE_POWER_CLAIRVOYANCE", {
            target: props.player
        });
        props.close();
    };

    if (!powerContext.active) return <></>;

    if (userContext.username === props.player) return <></>;

    return <Actionsheet.Item onPress={onUse}>[Voyance] Voir le rôle</Actionsheet.Item>;
}
