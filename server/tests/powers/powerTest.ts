import { Client, Power } from "../main.test";
import { test } from "../test-api/testAPI";
import { testClairvoyance } from "./clairvoyanceTest";
import { testContamination } from "./contaminationTest";
import { testInsomnia } from "./insomniaTest";
import { testSpiritism } from "./spiritismTest";

export const testPowersNight = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    const insomnia: Client | undefined = players.find((p) => p.getPower() === Power.INSOMNIA);
    const spiritism: Client | undefined = players.find((p) => p.getPower() === Power.SPIRITISM);
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
    const clairvoyance: Client | undefined = players.find((p) => p.getPower() === Power.CLAIRVOYANCE);

    await test("Player don't have any power", async (t) => {
        const player: Client = players.filter((p) => p.getPower() === Power.NO_POWER)[0];
        player.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CONTAMINATION",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        await t.testOrTimeout(
            player.verifyEvent({
                event: "POWER_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Player don't have any power"
                }
            })
        );
    });

    await test("Target not in the game", async (t) => {
        const playerWithPower: Client = players.find((p) => p.getPower() !== Power.NO_POWER && p.getPower() !== Power.INSOMNIA);
        if (playerWithPower) {
            let event: string;
            if (playerWithPower.getPower() === Power.CONTAMINATION) event = "USE_POWER_CONTAMINATION";
            else if (playerWithPower.getPower() === Power.CLAIRVOYANCE) event = "USE_POWER_CLAIRVOYANCE";
            else if (playerWithPower.getPower() === Power.SPIRITISM) event = "USE_POWER_SPIRITISM";
            playerWithPower.sendMessage(
                JSON.stringify({
                    event: event,
                    game_id: 1,
                    data: {
                        target: clientNotInGame.getName()
                    }
                })
            );

            await t.testOrTimeout(
                playerWithPower.verifyEvent({
                    event: "POWER_ERROR",
                    game_id: 1,
                    data: {
                        status: 403,
                        message: "Target player is not in the game"
                    }
                })
            );
        }
    });

    await testClairvoyance(clairvoyance, players[Math.floor(Math.random() * players.length)]);
    await testSpiritism(spiritism, players);
    await testInsomnia(insomnia, players);
    await testContamination(contamination, players);

    await test("Player has already used his power", async (t) => {
        const playerWithPower: Client = players.find((p) => p.getPower() !== Power.NO_POWER && p.getPower() !== Power.INSOMNIA);
        if (!playerWithPower) return;

        const player: Client = players[Math.floor(Math.random() * players.length)];
        let event: string;
        if (playerWithPower.getPower() === Power.CLAIRVOYANCE) event = "USE_POWER_CLAIRVOYANCE";
        else if (playerWithPower.getPower() === Power.CONTAMINATION) event = "USE_POWER_CONTAMINATION";
        else if (playerWithPower.getPower() === Power.SPIRITISM) event = "USE_POWER_SPIRITISM";

        playerWithPower.sendMessage(
            JSON.stringify({
                event: event,
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        await t.testOrTimeout(
            playerWithPower.verifyEvent({
                event: "POWER_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Player has already used his power"
                }
            })
        );
    });
};

export const testPowersDay = async (players: Array<Client>): Promise<void> => {
    const playerWithPower: Client = players.find((p) => p.getPower() !== Power.NO_POWER && p.getPower() !== Power.INSOMNIA);
    if (!playerWithPower) return;

    const target: Client = players[0];
    let event: string;
    if (playerWithPower.getPower() === Power.CLAIRVOYANCE) event = "USE_POWER_CLAIRVOYANCE";
    else if (playerWithPower.getPower() === Power.CONTAMINATION) event = "USE_POWER_CONTAMINATION";
    else if (playerWithPower.getPower() === Power.SPIRITISM) event = "USE_POWER_SPIRITISM";

    await test("Use power during the day", async (t) => {
        playerWithPower.sendMessage(
            JSON.stringify({
                event: event,
                game_id: 1,
                data: {
                    target: target
                }
            })
        );

        await t.testOrTimeout(
            playerWithPower.verifyEvent({
                event: "POWER_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Power can be used only during the night"
                }
            })
        );
    });
};
