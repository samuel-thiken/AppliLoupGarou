import { View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    topLeft: {}
});

export default function Aligner(props: { children: React.ReactNode }): React.ReactElement {
    return <View>{props.children}</View>;
}
