import { View, Text } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";

export default function Bandeau(props: { text: string, textColor: ColorType }): React.ReactElement {
    return (
        <View backgroundColor={"rgba(56, 56, 56, 0.8)"} position={"absolute"} width={"100%"} height={"100%"} top={"0"} left={"0"}>
            <View width={"100%"} position={"absolute"} backgroundColor={"white"} style={{ transform: [{ rotate: "-25deg" }, { translateX: -12 }, { translateY: -8 }] }}>
                <Text paddingLeft={4} fontFamily={"pixel"} color={props.textColor} fontWeight={"900"} fontSize={"150%"}>
                    {props.text}
                </Text>
            </View>
        </View>
    );
}
