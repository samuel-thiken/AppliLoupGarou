import { Client, Power, Role } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";
import { testVoteNight, verifyNightVoteResult } from "./votes/nightVotesTest";
import { testPowersDay, testPowersNight } from "./powers/powerTest";
import { test } from "./test-api/testAPI";
import { verifyContamination } from "./powers/contaminationTest";
import { testVoteDay, verifyDayVoteResult } from "./votes/dayVotesTest";
import { testChatDay } from "./chats/dayChatsTest";

export const testRunGame = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    // Première nuit
    await testChatNight(players);
    await testPowersNight(players, clientNotInGame);
    await testVoteNight(players, clientNotInGame);

    // Premier jour
    await test("Wait day", async (t) => {
        for (const player of players) await t.timeout(player.startPeriod("DAY_START", 1, t), 11000);
    });

    // Vérification des résultats de ce qui s'est passé la nuit
    await verifyContamination(players);
    await verifyNightVoteResult();

    // Chats, votes et pouvoirs
    await testVoteDay(players);
    await testChatDay(players);
    await testPowersDay(players);

    // Deuxième nuit
    await test("Wait night", async (t) => {
        for (const player of players) await t.timeout(player.startPeriod("NIGHT_START", 1, t), 11000);
    });

    // Vérification des résultats de ce qui s'est passé le jour
    await verifyDayVoteResult();

    // Fin de partie
    await test("End game", async (t) => {
        const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
        const winningRole: Role = contamination ? Role.WEREWOLF : Role.HUMAN;
        for (const player of players) {
            await t.testOrTimeout(
                player.verifyEvent({
                    event: "END_GAME",
                    game_id: 1,
                    data: {
                        winningRole: winningRole
                    }
                }),
                5000,
                "End game"
            );
        }
    });
};
