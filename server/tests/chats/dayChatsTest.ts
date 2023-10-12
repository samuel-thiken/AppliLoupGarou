import { ChatType } from "../../models/chatModel";
import { Client } from "../main.test";
import { test } from "../test-api/testAPI";

export const testChatDay = async (players: Array<Client>): Promise<void> => {
    const alivePlayers: Array<Client> = players.filter((p) => p.isAlive());
    const now: number = Date.now();
    const deadPlayer: Client = players.find((p) => !p.isAlive());

    await test("Wrong chat type (werewolf)", async (t) => {
        alivePlayers[0].sendMessage(
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
            alivePlayers[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Chat Werewolf unavailable during the day"
                }
            })
        );
    });

    await test("Wrong chat type (spiritism)", async (t) => {
        alivePlayers[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_SPIRITISM,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            alivePlayers[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Chat Spiritism unavailable during the day"
                }
            })
        );
    });

    await test("Dead player send message", async (t) => {
        deadPlayer.sendMessage(
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
            deadPlayer.verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Dead player cannot send message in the chat"
                }
            })
        );
    });
};
