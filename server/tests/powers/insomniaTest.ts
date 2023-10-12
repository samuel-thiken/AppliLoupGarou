import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const testInsomnia = async (insomnia: Client, players: Array<Client>): Promise<void> => {
    if (!insomnia) return;

    await test("Test insomnia", async (t) => {
        t.equal(insomnia.getRole(), Role.HUMAN);
    });
};
