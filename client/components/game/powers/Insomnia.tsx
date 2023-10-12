import { Power } from "../../../context/GameContext";
import PowerOverlay from "./PowerOverlay";

export function Overlay(): React.ReactElement {
    return <PowerOverlay power={Power.INSOMNIA}></PowerOverlay>;
}

export function PlayerActions(): React.ReactElement {
    return <></>;
}
