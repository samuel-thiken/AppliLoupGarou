import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./screens/Home";
import Connection from "./screens/Connection";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";
import { useFonts } from "expo-font";
import Settings from "./screens/Settings";
import { Text } from "react-native";
import CreateGame from "./screens/CreateGame";
import Game from "./screens/Game";
import { NativeBaseProvider } from "native-base";
import Background from "./components/Background";
import { GameProvider } from "./context/GameContext";

export type StackParamList = {
    Home: undefined;
    Connection: undefined;
    Settings: undefined;
    CreateGame: undefined;
    Game: { gameId: number };
};
export type StackNavigation = NavigationProp<StackParamList>;

const Stack = createStackNavigator<StackParamList>();
function MyStack(): React.ReactElement {
    return (
        <Stack.Navigator initialRouteName="Connection">
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Connection" component={Connection} options={{ headerShown: false, title: "Connection" }} />
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <Stack.Screen name="Game" component={Game} options={{ headerShown: false }} initialParams={{ gameId: 0 }} />
            <Stack.Screen name="CreateGame" component={CreateGame} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default function App(): React.ReactElement {
    const [isLoaded] = useFonts({
        pixel: require("./assets/fonts/depixel.ttf")
    });

    if (isLoaded) {
        return (
            <NativeBaseProvider>
                <SettingsProvider>
                    <UserProvider>
                        <GameProvider gameId={0}>
                            <NavigationContainer>
                                <MyStack />
                            </NavigationContainer>
                        </GameProvider>
                    </UserProvider>
                </SettingsProvider>
            </NativeBaseProvider>
        );
    } else {
        return (
            <NativeBaseProvider>
                <Background>
                    <Text>Loading font...</Text>
                </Background>
            </NativeBaseProvider>
        );
    }
}
