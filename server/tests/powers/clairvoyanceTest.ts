import { Client } from "../main.test";
import { test } from "../test-api/testAPI";

export const testClairvoyance = async (clairvoyance: Client, target: Client): Promise<void> => {
    if (!clairvoyance) return;

    await test("Test clairvoyance", async (t) => {
        clairvoyance.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CLAIRVOYANCE",
                game_id: 1,
                data: {
                    target: target.getName()
                }
            })
        );
        await t.testOrTimeout(
            clairvoyance.verifyEvent({
                event: "CLAIRVOYANCE_RESPONSE",
                game_id: 1,
                data: {
                    role: target.getRole(),
                    power: target.getPower()
                }
            })
        );
    });
};
