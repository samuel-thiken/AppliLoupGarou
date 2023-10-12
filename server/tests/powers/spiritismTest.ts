import { Client } from "../main.test";
import { test } from "../test-api/testAPI";

export const testSpiritism = async (spiritism: Client, players: Array<Client>): Promise<void> => {
    if (!spiritism) return;

    await test("Test spiritism", async (t) => {
        const player: Client = players[Math.floor(Math.random() * players.length)];
        spiritism.sendMessage(
            JSON.stringify({
                event: "USE_POWER_SPIRITISM",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        await t.testOrTimeout(
            spiritism.verifyEvent({
                event: "POWER_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Dead player is not dead"
                }
            })
        );
    });
};
