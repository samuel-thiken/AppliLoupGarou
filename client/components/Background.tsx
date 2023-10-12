/* eslint-disable max-len */
import { Container, Image } from "native-base";
import { GameContext, GamePhase } from "../context/GameContext";
import React, { useEffect, useContext, useState } from "react";
import { backgroundFrames } from "./game/image";

const FRAME_COUNT = 175;
const frames = backgroundFrames;
enum PHASE_ANCHOR {
    DAY_START = 50,
    NIGHT_START = 128,
}

export default function Background(props: { children: React.ReactNode; page?: string }): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [last2Frame, setLast2Frame] = useState(PHASE_ANCHOR.NIGHT_START - 2);
    const [last1Frame, setLast1Frame] = useState(PHASE_ANCHOR.NIGHT_START - 1);
    const [currentFrame, setCurrentFrame] = useState(PHASE_ANCHOR.NIGHT_START);

    const updateFrame = (): void => {
        const diffSeconds = (new Date().getTime() - gameContext.phaseAnchorDate.getTime()) / 1000;
        const progression = (gameContext.phaseProgression + diffSeconds) / gameContext.phaseDuration;
        let frameStart = 0;
        let frameEnd = 0;
        if (gameContext.phase === GamePhase.NIGHT) {
            frameStart = -(FRAME_COUNT - PHASE_ANCHOR.NIGHT_START);
            frameEnd = PHASE_ANCHOR.DAY_START;
        } else {
            frameStart = PHASE_ANCHOR.DAY_START;
            frameEnd = PHASE_ANCHOR.NIGHT_START;
        }
        let frame = Math.floor(frameStart + progression * (frameEnd - frameStart));
        if (frame < 0) frame = FRAME_COUNT + frame;
        if (frame !== currentFrame) {
            setCurrentFrame((cf) => {
                setLast1Frame((l1f) => {
                    setLast2Frame(l1f);
                    return cf;
                });
                return frame;
            });
        }
    };

    useEffect(() => {
        updateFrame();
        const interval = setInterval(updateFrame, 1000);
        return () => clearInterval(interval);
    });

    return (
        <Container minHeight={"100%"} minWidth={"100%"} position={"relative"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} overflow={"hidden"}>
            {last2Frame !== last1Frame && <Image key={last2Frame} source={frames[last2Frame]} alt="Background image" position={"absolute"} width={"100%"} height={"100%"} resizeMode="cover" />}
            {last1Frame !== currentFrame && <Image key={last1Frame} source={frames[last1Frame]} alt="Background image" position={"absolute"} width={"100%"} height={"100%"} resizeMode="cover" />}
            <Image key={currentFrame} source={frames[currentFrame]} alt="Background image" position={"absolute"} width={"100%"} height={"100%"} resizeMode="cover" />

            <Container pt={50} />
            {props.children}
        </Container>
    );
}
