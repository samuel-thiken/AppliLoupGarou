import { GameProvider } from "../context/GameContext";
import Jeux from "./Jeux";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "../App";
import { VoteProvider } from "../context/VoteContext";
import { PowerProvider } from "../context/PowerContext";

export default function GameScreen({ route, navigation }: StackScreenProps<StackParamList, "Game">): React.ReactElement {
    return (
        <GameProvider gameId={route.params.gameId}>
            <VoteProvider>
                <PowerProvider>
                    <Jeux />
                </PowerProvider>
            </VoteProvider>
        </GameProvider>
    );
}
