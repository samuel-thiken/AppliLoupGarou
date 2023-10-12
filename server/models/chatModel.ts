import { sql } from "kysely";
import database from "../util/database";
import { Player } from "./playerModel";

export enum ChatType {
    CHAT_VILLAGE = "CHAT_VILLAGE",
    CHAT_WEREWOLF = "CHAT_WEREWOLF",
    CHAT_SPIRITISM = "CHAT_SPIRITISM",
}

export type Message = { game: number; type: ChatType; user: string; content: string; date: number };

export class Chat {

    private type: ChatType;
    private messages: Array<Message>;
    private members: Array<Player>;

    constructor(type: ChatType, members: Array<Player>) {
        this.type = type;
        this.members = members;
        this.messages = [];
    }

    public getType(): ChatType {
        return this.type;
    }

    public getMembers(): Array<Player> {
        return this.members;
    }

    public hasMember(player: Player): boolean {
        return !!this.getMembers().find((p) => p.getName() === player.getName());
    }

    public getMessages(): Array<Message> {
        return this.messages;
    }

    public close(): void {
        this.members.forEach((member) => {
            this.sendQuitChat(member);
        });
        this.messages.length = 0;
        this.members.length = 0;
    }

    public resetChatMembers(newMembers: Array<Player>): void {
        this.members = newMembers;
        this.members.forEach((p) => this.sendJoinChat(p));
    }

    public sendJoinChat(player: Player): void {
        player.sendMessage("JOIN_CHAT", { chat_type: this.type });
    }

    public sendQuitChat(player: Player): void {
        player.sendMessage("QUIT_CHAT", { chat_type: this.type });
    }

    /**
     * Ajoute un message dans le chat et l'envoie à tous les membres du chat
     * @param {string} message Message envoyé
     */
    public addMessage(message: Message): void {
        this.messages.push(message);

        this.members.forEach((player) =>
            player.sendMessage("CHAT_RECEIVED", {
                author: message.user,
                date: message.date,
                chat_type: message.type,
                content: message.content
            })
        );
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("messages")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("game", "integer", (col) => col.notNull())
            .addColumn("type", "text", (col) => col.notNull())
            .addColumn("user", "text", (col) => col.notNull())
            .addColumn("content", "text", (col) => col.notNull())
            .addColumn("date", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .execute();
    };

}
