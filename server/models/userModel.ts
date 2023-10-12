import * as WebSocket from "ws";
import database from "../util/database";

export class User {

    private static usersSet: { [key: string]: User } = {};

    private username: string;
    private ws: WebSocket;
    private waitingMessages: Array<string>;

    constructor(username: string) {
        this.username = username;
        this.ws = null;
        this.waitingMessages = [];
    }

    /**
     * Get user data
     * @param {string} username name of the user
     * @returns {User}
     */
    static async load(username: string): Promise<User> {
        if (User.usersSet[username]) return User.usersSet[username];

        const dUser: { username: string } = await database.selectFrom("users").select(["username"]).where("username", "=", username).executeTakeFirstOrThrow();
        const user: User = new User(dUser.username);
        
        User.usersSet[user.getUsername()] = user;
        return user;
    }

    public getUsername(): string {
        return this.username;
    }

    public static getUser(username: string): User {
        if (User.usersSet[username] === undefined) return null;
        return User.usersSet[username];
    }

    public getWebsocket(): WebSocket {
        return this.ws;
    }

    public isConnected(): boolean {
        return this.ws != null;
    }

    /**
     * Send waiting message to a user because of deconnexion
     */
    public sendWaitingMessages(): void {
        for (const message of this.waitingMessages) this.ws.send(message);
        this.waitingMessages.length = 0;
    }

    public sendMessage(jsonMessage: Record<string, any>): void {
        if (this.isConnected()) this.ws.send(JSON.stringify(jsonMessage));
        else this.waitingMessages.push(JSON.stringify(jsonMessage));
    }

    public setWebsocket(ws: WebSocket): void {
        this.ws = ws;
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("users")
            .ifNotExists()
            .addColumn("username", "text", (col) => col.primaryKey().notNull())
            .addColumn("password", "text", (col) => col.notNull())
            .execute();

        const users: Array<{ username: string }> = await database.selectFrom("users").select("username").execute();
        for (const elem of users) await User.load(elem.username);
    };

}
