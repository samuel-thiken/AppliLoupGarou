import { Actionsheet } from "native-base";
import { Power, Role } from "../../../context/GameContext";
import { PlayerActionsProps } from "../../../context/PowerContext";
import PowerOverlay from "./PowerOverlay";

export function Overlay(): React.ReactElement {
    return <PowerOverlay power={Power.CONTAMINATION}></PowerOverlay>;
}

export function PlayerActions(props: PlayerActionsProps): React.ReactElement {
    const gameContext = props.gameContext;
    const userContext = props.userContext;
    const powerContext = props.powerContext;

    const onUse = (): void => {
        gameContext.sendJsonMessage("USE_POWER_CLAIRVOYANCE", {
            target: props.player
        });
    };

    if (!powerContext.active) return <></>;

    if (userContext.username === props.player) return <></>;

    const playerInfos = gameContext.players.find((p) => p.username === props.player);

    if (!playerInfos || playerInfos.roles.includes(Role.WEREWOLF)) return <></>;

    return <Actionsheet.Item onPress={onUse}>[Contamination] Transformer le villageois en loup garou</Actionsheet.Item>;
}
