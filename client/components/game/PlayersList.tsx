import { useContext } from "react";
import { GameContext } from "../../context/GameContext";
import PlayerCard from "./PlayerCard";
import { Container } from "native-base";

export default function PlayersList(): React.ReactElement {
    const gameContext = useContext(GameContext);

    return (
        <Container display={"flex"} flexDirection={"row"} flexWrap={"wrap"} style={{ gap: 10 }} width={"100%"} justifyContent={"space-around"} maxWidth={530}>
            {gameContext.players.map((player) => (
                <PlayerCard key={player.username} player={player} />
            ))}
        </Container>
    );
}
