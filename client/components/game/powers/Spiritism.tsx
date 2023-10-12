import { Actionsheet } from "native-base";
import { Power } from "../../../context/GameContext";
import { PlayerActionsProps } from "../../../context/PowerContext";
import PowerOverlay from "./PowerOverlay";

export function Overlay(): React.ReactElement {
    console.log("spiritism");
    return <PowerOverlay power={Power.SPIRITISM}></PowerOverlay>;
}

export function PlayerActions(props: PlayerActionsProps): React.ReactElement {
    const gameContext = props.gameContext;
    const userContext = props.userContext;
    const powerContext = props.powerContext;

    const onUse = (): void => {
        gameContext.sendJsonMessage("USE_POWER_SPIRITISM", {
            target: props.player
        });
    };

    if (!powerContext.active) return <></>;

    if (userContext.username === props.player) return <></>;

    const playerInfos = gameContext.players.find((p) => p.username === props.player);

    if (!playerInfos || playerInfos.alive) return <></>;

    return <Actionsheet.Item onPress={onUse}>[Spiritisme] Discuter avec le mort</Actionsheet.Item>;
}
