import { Client } from "./main.test";
import { test } from "./test-api/testAPI";

export const testWebsockets = async (client0: Client, client1: Client, client2: Client, client3: Client, client4: Client, client5: Client, client8: Client): Promise<void> => {
    await test("Setup roles and powers", async (t) => {
        for (const client of [client0, client1, client2, client3, client4]) {
            await client.startPeriod("NIGHT_START", 1, t);
            t.assert(client.getRole());
            t.assert(client.getPower());
        }
    });

    await test("Mauvais format des données envoyées", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA"
            })
        );

        await t.testOrTimeout(client1.verifyEvent({ event: "AUTHENTICATION", status: 400, message: "Bad Request" }));
    });

    await test("Utilisateur déjà authentifié", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client1.getToken() }
            })
        );

        await t.testOrTimeout(client1.verifyEvent({ event: "AUTHENTICATION", status: 200, message: "Already Authentified" }));
    });

    await test("Event where the game doesn't exist", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 3,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        await t.testOrTimeout(client1.verifyEvent({ event: "GAME_VERIFICATION", status: 409, message: "Game doesn't exist" }));
    });

    await test("Event from wrong player", async (t) => {
        client8.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        await t.testOrTimeout(client8.verifyEvent({ event: "PLAYER_VERIFICATION", status: 409, message: "User doesn't exist in this game" }));
    });

    await test("Wrong event", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "UNEXISTING_EVENT",
                data: { message: "Simulation de données" }
            })
        );

        await t.testOrTimeout(client1.verifyEvent({ event: "EVENT_VERIFICATION", status: 500, message: "Event doesn't exist" }));
    });
};
