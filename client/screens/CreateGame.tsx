import { API_BASE_URL } from "@env";
import { useContext, useState } from "react";
import Background from "../components/Background";
import InputDate from "../components/inputs/InputDate";
import InputNumber from "../components/inputs/InputNumber";
import NavigationUI from "../components/NavigationUI";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import { Box, Divider, FormControl, Button, ScrollView, Heading, useToast } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { GameContext } from "../context/GameContext";

type FormFieldsValue = {
    nbPlayerMin: number;
    nbPlayerMax: number;
    dayLength: number;
    nightLength: number;
    startDate: Date;
    percentageWerewolf: number;
    probaContamination: number;
    probaInsomnie: number;
    probaVoyance: number;
    probaSpiritisme: number;
};

export default function CreateGame(): React.ReactElement {
    const { token } = useContext(UserContext);
    const gameContext = useContext(GameContext);
    const navigation = useNavigation<StackNavigation>();

    const toast = useToast();

    const [fieldsValue, setFieldsValue] = useState<FormFieldsValue>({
        nbPlayerMin: 5,
        nbPlayerMax: 20,
        dayLength: 60,
        nightLength: 60,
        startDate: new Date(Date.now() + 1000 * 60 * 60),
        percentageWerewolf: 50,
        probaContamination: 33,
        probaInsomnie: 33,
        probaVoyance: 33,
        probaSpiritisme: 33
    });

    const submitCreateGame = (): void => {
        request(`${API_BASE_URL}/game/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({
                nbPlayerMin: fieldsValue.nbPlayerMin,
                nbPlayerMax: fieldsValue.nbPlayerMax,
                dayLength: fieldsValue.dayLength * 1000 * 60,
                nightLength: fieldsValue.nightLength * 1000 * 60,
                startDate: fieldsValue.startDate.getTime(),
                percentageWerewolf: fieldsValue.percentageWerewolf / 100,
                probaContamination: fieldsValue.probaContamination / 100,
                probaInsomnie: fieldsValue.probaInsomnie / 100,
                probaVoyance: fieldsValue.probaVoyance / 100,
                probaSpiritisme: fieldsValue.probaSpiritisme / 100
            })
        })
            .then((res) => res.json())
            .then(() => {
                navigation.navigate("Home");
            })
            .catch((e) => {
                toast.show({
                    title: "Erreur",
                    description: e.message,
                    variant: "subtle",
                    borderColor: "red.700",
                    borderLeftWidth: 3
                });
            });
    };

    return (
        <Background>
            <NavigationUI allowBack={true} />
            <ScrollView>
                <Box p={10} m={10} bgColor={"light.100"}>
                    <Heading>Création de partie</Heading>
                    <Divider my={5} />
                    <FormControl>
                        <FormControl.Label>Nombre de joueurs minimum</FormControl.Label>
                        <InputNumber value={fieldsValue.nbPlayerMin} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, nbPlayerMin: value }))} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Nombre de joueurs maximum</FormControl.Label>
                        <InputNumber value={fieldsValue.nbPlayerMax} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, nbPlayerMax: value }))} />
                    </FormControl>
                    <Divider my={5} />
                    <FormControl>
                        <FormControl.Label>Durée du jour (minutes)</FormControl.Label>
                        <InputNumber
                            value={fieldsValue.dayLength}
                            onChange={(value): void => {
                                setFieldsValue((oldValue) => ({ ...oldValue, dayLength: value }));
                            }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Durée de la nuit (minutes)</FormControl.Label>
                        <InputNumber
                            value={fieldsValue.nightLength}
                            onChange={(value): void => {
                                setFieldsValue((oldValue) => ({ ...oldValue, nightLength: value }));
                            }}
                        />
                    </FormControl>
                    <Divider my={5} />
                    <FormControl>
                        <FormControl.Label>Date de début</FormControl.Label>
                        <InputDate data-cy="DateDebut" value={fieldsValue.startDate} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, startDate: value }))} />
                    </FormControl>
                    <Divider my={5} />
                    <FormControl>
                        <FormControl.Label>Pourcentage de loup-garous</FormControl.Label>
                        <InputNumber value={fieldsValue.percentageWerewolf} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, percentageWerewolf: value }))} />
                    </FormControl>
                    <Divider my={5} />
                    <FormControl>
                        <FormControl.Label>Probabilité d'apparition du pouvoir "Contamination"</FormControl.Label>
                        <InputNumber value={fieldsValue.probaContamination} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, probaContamination: value }))} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Probabilité d'apparition du pouvoir "Insomnie"</FormControl.Label>
                        <InputNumber value={fieldsValue.probaInsomnie} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, probaInsomnie: value }))} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Probabilité d'apparition du pouvoir "Spiritisme"</FormControl.Label>
                        <InputNumber value={fieldsValue.probaSpiritisme} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, probaSpiritisme: value }))} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Probabilité d'apparition du pouvoir "Voyance"</FormControl.Label>
                        <InputNumber value={fieldsValue.probaVoyance} onChange={(value): void => setFieldsValue((oldValue) => ({ ...oldValue, probaVoyance: value }))} />
                    </FormControl>
                    <Button mt={10} onPress={submitCreateGame}>
                        Créer
                    </Button>
                </Box>
            </ScrollView>
        </Background>
    );
}
