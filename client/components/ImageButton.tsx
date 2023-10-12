import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ColorValue } from "react-native/Libraries/StyleSheet/StyleSheet";

export default function ImageButton(props: { source: ImageSourcePropType; style: StyleProp<ViewStyle>; onPress: () => void; tintColor?: ColorValue }): React.ReactElement {
    return (
        <Pressable style={props.style} onPress={props.onPress}>
            <Image source={props.source} style={{ height: "100%", width: "100%", tintColor: props.tintColor }} />
        </Pressable>
    );
}
