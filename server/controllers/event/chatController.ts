import { Chat, ChatType, Message } from "../../models/chatModel";
import { Game, GameStatus } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import database from "../../util/database";
import { Event } from "../eventController";
import Logger from "../../util/Logger";
import InsomniaPower from "../../models/powers/InsomniaPower";

const LOGGER = new Logger("CHAT");

/**
 * Enregistre un nouveau message dans la base de données et envoie le message sur le chat
 * @param {Game} game Partie dans laquelle le message est envoyée
 * @param {Player} player Auteur du message
 * @param  {Record<string, any>} data Données relatives au message
 * @returns {Promise<void>}
 */
const newMessage = async (game: Game, player: Player, data: { date: number; chat_type: ChatType; content: string }): Promise<void> => {
    const message: Message = {
        game: game.getGameId(),
        type: data.chat_type,
        user: player.getName(),
        content: data.content,
        date: data.date
    };

    LOGGER.log(`New message`);
    // On récupère le chat concerné
    const chat: Chat = game.getChat(data.chat_type);

    if (data.date < game.getGameParam().startDate) {
        player.sendError("CHAT_ERROR", 403, "Game has not started");
        return;
    }
    if (data.chat_type === ChatType.CHAT_VILLAGE && game.getStatus() !== GameStatus.DAY) {
        player.sendError("CHAT_ERROR", 403, "Chat Village unavailable during the night");
        return;
    }
    if (data.chat_type === ChatType.CHAT_WEREWOLF && game.getStatus() !== GameStatus.NIGHT) {
        player.sendError("CHAT_ERROR", 403, "Chat Werewolf unavailable during the day");
        return;
    }
    if (data.chat_type === ChatType.CHAT_SPIRITISM && game.getStatus() !== GameStatus.NIGHT) {
        player.sendError("CHAT_ERROR", 403, "Chat Spiritism unavailable during the day");
        return;
    }
    if (data.content.replace(" ", "").length === 0) return;
    if (data.chat_type !== ChatType.CHAT_SPIRITISM) {
        if (player.isDead()) {
            player.sendError("CHAT_ERROR", 403, "Dead player cannot send message in the chat");
            return;
        }
    }

    if (player.getPower()) {
        if (data.chat_type === ChatType.CHAT_WEREWOLF && player.getPower().getName() === InsomniaPower.POWERNAME) {
            player.sendError("CHAT_ERROR", 403, "Insomnia cannot send message into werewolves chat");
            return;
        }
    }

    // On envoie le message sur ce chat
    if (chat) {
        if (chat.getMembers().length === 0) {
            player.sendError("CHAT_ERROR", 403, "There is no member in the chat");
            return;
        }
        if (!chat.getMembers().includes(player)) {
            player.sendError("CHAT_ERROR", 403, "This player is not a member of this chat");
            return;
        }
        await database.insertInto("messages").values(message).execute();
        LOGGER.log(`New message from ${player.getName()}`);
        chat.addMessage(message);
    } else {
        player.sendError("CHAT_ERROR", 500, "Chat null");
        return;
    }
};

const getAllChats = async (game: Game, player: Player): Promise<void> => {
    const res: { [key in ChatType]?: Array<{ author: string; date: number; chat_type: ChatType; content: string }> } = {};
    LOGGER.log(`CHAT ALL CHAT START`);
    const chatTypes = Object.keys(ChatType) as unknown as ChatType[];
    for (const chatType of chatTypes) {
        const chat = game.getChat(chatType);
        if (!chat || !chat.hasMember(player)) continue;
        if (player.isDead()) {
            res[chatType] = (await database.selectFrom("messages").select(["user", "date", "type", "content"]).where("type", "=", chat.getType()).execute()).map((msg) => ({
                author: msg.user,
                date: msg.date,
                chat_type: chatType,
                content: msg.content
            }));
        } else {
            res[chatType] = chat.getMessages().map((message) => ({
                author: message.user,
                date: message.date,
                chat_type: chatType,
                content: message.content
            }));
        }
    }
    LOGGER.log(`CHAT ALL CHAT END`);

    player.sendMessage("GET_ALL_INFO_CHAT", res);
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
Event.registerHandlers("GET_ALL_INFO", getAllChats);
