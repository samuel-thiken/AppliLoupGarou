import React, { useContext, useEffect, useState } from "react";
import { GameContext, GameContextType, Power } from "./GameContext";
import { Overlay as ClairvoyanceOverlay, PlayerActions as ClairvoyancePlayerActions } from "../components/game/powers/Clairvoyance";
import { Overlay as SpiritismOverlay, PlayerActions as SpiritismPlayerActions } from "../components/game/powers/Spiritism";
import { Overlay as ContaminationOverlay, PlayerActions as ContaminationPlayerActions } from "../components/game/powers/Contamination";
import { Overlay as InsomniaOverlay, PlayerActions as InsomniaPlayerActions } from "../components/game/powers/Insomnia";
import { UserContextType } from "./UserContext";

export type PlayerActionsProps = {
    player: string;
    userContext: UserContextType;
    gameContext: GameContextType;
    powerContext: { active: boolean },
    close: () => void
};

export type PowerContextType = {
    active: boolean;
    getOverlay: () => () => React.ReactElement;
    getPlayerActions: () => (props: PlayerActionsProps) => React.ReactElement;
};

export const PowerContext = React.createContext<PowerContextType>({
    active: false,
    getOverlay: () => (): React.ReactElement => <></>,
    getPlayerActions: () => (): React.ReactElement => <></>
});

export function PowerProvider(props: { children: React.ReactNode }): React.ReactElement {
    const [active, setActive] = useState(false);

    const gameContext = useContext(GameContext);

    const getOverlay = (): (() => React.ReactElement) => {
        switch (gameContext.me.power) {
        case Power.CLAIRVOYANCE:
            return ClairvoyanceOverlay;
        case Power.SPIRITISM:
            return SpiritismOverlay;
        case Power.INSOMNIA:
            return InsomniaOverlay;
        case Power.CONTAMINATION:
            return ContaminationOverlay;
        default:
            return () => <></>;
        }
    };

    const getPlayerActions = (): ((props: PlayerActionsProps) => React.ReactElement) => {
        switch (gameContext.me.power) {
        case Power.CLAIRVOYANCE:
            return ClairvoyancePlayerActions;
        case Power.SPIRITISM:
            return SpiritismPlayerActions;
        case Power.INSOMNIA:
            return InsomniaPlayerActions;
        case Power.CONTAMINATION:
            return ContaminationPlayerActions;
        default:
            return () => <></>;
        }
    };

    const onPowerStart = (): void => {
        setActive(true);
    };
    const onPowerEnd = (): void => {
        setActive(false);
    };

    useEffect(() => {
        gameContext.registerEventHandler("POWER_START", onPowerStart);
        gameContext.registerEventHandler("POWER_END", onPowerEnd);
    }, []);

    return <PowerContext.Provider value={{ active, getOverlay, getPlayerActions }}>{props.children}</PowerContext.Provider>;
}
