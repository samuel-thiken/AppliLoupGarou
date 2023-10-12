import { View, Image, Text, Tooltip } from "native-base";
import { Power } from "../../../context/GameContext";
import { getImageSource } from "../image";

export default function PowerOverlay(props: { power: Power; children?: React.ReactNode }): React.ReactElement {
    return (
        <View position={"absolute"} width={"100%"} height={"100%"} top={0} bottom={0} pointerEvents="none" display={"flex"} flexDirection={"column"} justifyContent={"start"} alignItems={"center"}>
            <View position={"absolute"} top={100} left={30} display={"flex"} flexDirection={"row"}>
                <Tooltip label={props.power} placement="bottom">
                    <Image alt={`${props.power} role image`} source={getImageSource(props.power).uri} size={"sm"} />
                </Tooltip>
            </View>
            {props.children}
        </View>
    );
}
