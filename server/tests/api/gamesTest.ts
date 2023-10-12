import request from "supertest";
import { Client, url } from "../main.test";
import { test } from "../test-api/testAPI";

const testTiming = 5;
const date: Date = new Date();
date.setSeconds(date.getSeconds() + testTiming);

export const testGames = async (
    client0: Client,
    client1: Client,
    client2: Client,
    client3: Client,
    client4: Client,
    client5: Client,
    client6: Client,
    client7: Client,
    client8: Client,
    client9: Client
): Promise<void> => {
    await test("Create game", async (t) => {
        // On attend testTiming secondes pour que la partie créée commence
        let res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client0.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 4,
                    nbPlayerMax: 39,
                    dayLength: 10 * 1000,
                    nightLength: 10 * 1000,
                    startDate: date.getTime(),
                    percentageWerewolf: 0.33,
                    probaContamination: 0.5,
                    probaInsomnie: 0.5,
                    probaVoyance: 0.5,
                    probaSpiritisme: 0.5
                })
            );
        t.equal(res.status, 200);

        res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client4.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 2,
                    nbPlayerMax: 5,
                    dayLength: 10 * 1000,
                    nightLength: 10 * 1000,
                    startDate: date.getTime(),
                    percentageWerewolf: 0.33,
                    probaContamination: 0.1,
                    probaInsomnie: 0.1,
                    probaVoyance: 0.1,
                    probaSpiritisme: 0.1
                })
            );
        t.equal(res.status, 200);
    });

    await test("Creation of a game with error", async (t) => {
        const res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client0.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 4,
                    nbPlayerMax: 39,
                    dayLength: 10 * 1000,
                    nightLength: 10 * 1000,
                    startDate: date.getTime(),
                    percentageWerewolf: 0.33,
                    probaContamination: -1,
                    probaInsomnie: 0.1,
                    probaVoyance: 0.1,
                    probaSpiritisme: 0.1
                })
            );
        t.equal(res.status, 406);
        t.equal(res.body, { message: "Unvalid contamination probabilityShould be in [0,1]" });
    });

    await test("Join game", async (t) => {
        // Ajout des joueurs dans la partie 1
        let res = await request(url).post("/game/1/join").set("x-access-token", client1.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { message: "Game successfully join" });

        res = await request(url).post("/game/1/join").set("x-access-token", client2.getToken());
        t.equal(res.status, 200);

        res = await request(url).post("/game/1/join").set("x-access-token", client3.getToken());
        t.equal(res.status, 200);

        res = await request(url).post("/game/1/join").set("x-access-token", client4.getToken());
        t.equal(res.status, 200);

        // Ajout des joueurs dans la partie 2
        res = await request(url).post("/game/2/join").set("x-access-token", client5.getToken());
        t.equal(res.status, 200);

        res = await request(url).post("/game/2/join").set("x-access-token", client6.getToken());
        t.equal(res.status, 200);

        res = await request(url).post("/game/2/join").set("x-access-token", client7.getToken());
        t.equal(res.status, 200);

        res = await request(url).post("/game/2/join").set("x-access-token", client8.getToken());
        t.equal(res.status, 200);
    });

    await test("Error when joining the game", async (t) => {
        let res = await request(url).post("/game/toto/join").set("x-access-token", client9.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "No game ID provided" });

        res = await request(url).post("/game/3/join").set("x-access-token", client9.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "Game doesn't exist or has been deleted by the host" });

        res = await request(url).post("/game/1/join").set("x-access-token", client0.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "User is already in the game" });

        res = await request(url).post("/game/2/join").set("x-access-token", client9.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "Game full" });
    });

    await test("Search game", async (t) => {
        const res = await request(url).get("/game/search").set("x-access-token", client2.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, {
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 5
                },
                {
                    id: 2,
                    startDate: date.getTime(),
                    host: client4.getName(),
                    nbPlayerMax: 5,
                    currentNumberOfPlayer: 5
                }
            ]
        });
    });

    await test("Search game by id", async (t) => {
        const res = await request(url).get("/game/1/details").set("x-access-token", client8.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, {
            id: 1,
            nbPlayerMax: 39,
            dayLength: 10 * 1000,
            nightLength: 10 * 1000,
            startDate: date.getTime(),
            percentageWerewolf: 0.33,
            probaContamination: 0.5,
            probaInsomnie: 0.5,
            probaVoyance: 0.5,
            probaSpiritisme: 0.5,
            host: client0.getName(),
            wereWolfCount: Math.ceil(39 * 0.33)
        });
    });

    await test("Search game that doesn't exist", async (t) => {
        const res = await request(url).get("/game/toto/details").set("x-access-token", client7.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "Invalid game ID provided" });
    });

    await test("Display user's games", async (t) => {
        const res = await request(url).get("/game/me").set("x-access-token", client4.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, {
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 5,
                    ended: false,
                    winningRole: null
                },
                {
                    id: 2,
                    startDate: date.getTime(),
                    host: client4.getName(),
                    nbPlayerMax: 5,
                    currentNumberOfPlayer: 5,
                    ended: false,
                    winningRole: null
                }
            ]
        });
    });

    await test("Player with no game", async (t) => {
        const res = await request(url).get("/game/me").set("x-access-token", client9.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { games: [] });
    });

    await test("Leave game", async (t) => {
        const res = await request(url).post("/game/2/leave").set("x-access-token", client8.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { message: "Player sucessfully remove from the game 2" });
    });

    await test("Error leaving a game", async (t) => {
        let res = await request(url).post("/game/2/leave").set("x-access-token", client8.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "User haven't join this game" });

        res = await request(url).post("/game/toto/leave").set("x-access-token", client7.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "No game ID provided" });

        res = await request(url).post("/game/3/leave").set("x-access-token", client7.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "Game doesn't exist or has been deleted by the host" });
    });

    await test("Other players leaving a game", async (t) => {
        let res = await request(url).post("/game/2/leave").set("x-access-token", client7.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { message: "Player sucessfully remove from the game 2" });

        res = await request(url).post("/game/2/leave").set("x-access-token", client6.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { message: "Player sucessfully remove from the game 2" });

        res = await request(url).post("/game/2/leave").set("x-access-token", client4.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, { message: "Game 2 deleted because the host leaves the game" });
    });

    await test("Search game after deletion", async (t) => {
        const res = await request(url).get("/game/search").set("x-access-token", client2.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, {
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 5
                }
            ]
        });
    });

    await test("Display user's games after deletion", async (t) => {
        const res = await request(url).get("/game/me").set("x-access-token", client4.getToken());
        t.equal(res.status, 200);
        t.equal(res.body, {
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 5,
                    ended: false,
                    winningRole: null
                }
            ]
        });
    });

    await test("Join game that doesn't exist", async (t) => {
        const res = await request(url).post("/game/2/join").set("x-access-token", client9.getToken());
        t.equal(res.status, 500);
        t.equal(res.body, { message: "Game doesn't exist or has been deleted by the host" });
    });
};
