import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { Button } from "react-native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import { UserContext } from "../context/UserContext";
import { Box, Divider, Heading } from "native-base";

export default function Settings(): React.ReactElement {
    const userContext = useContext(UserContext);
    const navigation = useNavigation<StackNavigation>();

    const logOut = (): void => {
        userContext.setToken("");
        userContext.setUsername("");
        navigation.navigate("Connection");
    };

    return (
        <Background>
            <NavigationUI allowBack />
            <Box padding={10} bgColor={"light.100"} borderRadius={5}>
                <>
                    <Heading>Déconnexion</Heading>
                    <Divider my={5} />
                    <Button onPress={logOut} title={"Log out"} />
                </>
            </Box>
        </Background>
    );
}
