import { ChatType } from "../../models/chatModel";
import { Client, Power, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const testChatNight = async (players: Array<Client>): Promise<void> => {
    const werewolves: Array<Client> = players.filter((p) => p.getRole() === Role.WEREWOLF);
    if (werewolves.length === 0) return;
    const insomnia: Client | undefined = players.find((p) => p.getPower() === Power.INSOMNIA);

    await test("Werewolves chat", async (t) => {
        const now: number = Date.now();

        werewolves[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        for (const werewolf of werewolves) {
            await t.testOrTimeout(
                werewolf.verifyEvent({
                    event: "CHAT_RECEIVED",
                    game_id: 1,
                    data: { author: werewolves[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
                })
            );
        }

        if (insomnia) {
            await t.testOrTimeout(
                insomnia.verifyEvent({
                    event: "CHAT_RECEIVED",
                    game_id: 1,
                    data: { author: werewolves[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
                })
            );
        }
    });

    await test("Wrong date on a message", async (t) => {
        const date: Date = new Date();
        date.setHours(date.getHours() - 1);

        werewolves[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: date.getTime(),
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            werewolves[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Game has not started"
                }
            })
        );
    });

    await test("Wrong chat", async (t) => {
        const now: number = Date.now();
        werewolves[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_VILLAGE,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            werewolves[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Chat Village unavailable during the night"
                }
            })
        );
    });

    await test("Insomnia send message", async (t) => {
        if (!insomnia) return;

        const now: number = Date.now();
        insomnia.sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            insomnia.verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Insomnia cannot send message into werewolves chat"
                }
            })
        );
    });
};
