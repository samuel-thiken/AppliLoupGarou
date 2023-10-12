import { Client, Power, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export let playerContaminated: Client;

export const testContamination = async (contamination: Client, players: Array<Client>): Promise<void> => {
    if (!contamination) return;
    playerContaminated = players.filter((p) => p.getRole() === Role.HUMAN)[0];

    await test("Test contamination", async (t) => {
        t.equal(contamination.getRole(), Role.WEREWOLF);

        contamination.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CONTAMINATION",
                game_id: 1,
                data: {
                    target: playerContaminated.getName()
                }
            })
        );
    });
};

export const verifyContamination = async (players: Array<Client>): Promise<void> => {
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
    if (!contamination) return;

    await test("Verify contamination applied", async (t) => {
        t.equal(playerContaminated.getRole(), Role.WEREWOLF);
    });
};
