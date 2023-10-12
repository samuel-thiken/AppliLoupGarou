import * as WebSocket from "ws";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import { Game } from "../models/gameModel";
import { Event } from "./eventController";
import Logger from "../util/Logger";
import { Player } from "../models/playerModel";

const { JWT_SECRET } = process.env;
const LOGGER = new Logger("WEBSOCKET");

export class WebsocketConnection {

    private static connections: Array<WebsocketConnection> = [];

    private ws: WebSocket;
    private user: User;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.user = null;
        ws.on("message", (message: string) => this.readMessage(message));
    }

    isAuthenticated(): boolean {
        return this.user != null;
    }

    public static onConnect = (ws: WebSocket): void => {
        // créer un connexion et le mettre dans une liste contenant toutes les connexions
        const connect: WebsocketConnection = new WebsocketConnection(ws);
        WebsocketConnection.connections.push(connect);

        LOGGER.log(`New connection`);
    };

    async readMessage(message: string): Promise<void> {
        try {
            const data: { game_id?: number; event: string; data: Record<string, any> } = JSON.parse(message);

            if (!data || typeof data !== "object" || !data.event || !data.data || typeof data.data !== "object") {
                this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 400, message: "Bad Request" }));
                return;
            }
            if (data.event === "AUTHENTICATION") {
                const token: string = data.data.token;
                try {
                    if (!jwt.verify(token, JWT_SECRET)) {
                        this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 403, message: "Bad Authentication" }));
                        LOGGER.log(`Authentication failed`);
                        return;
                    }
                } catch (e) {
                    this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 403, message: "Bad Authentication" }));
                    LOGGER.log(`Authentication failed`);
                    return;
                }
                const username: string = (jwt.decode(token) as { username: string }).username;

                if (this.isAuthenticated()) {
                    if (this.user.getUsername() !== username) {
                        this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 403, message: "Bad Authentication" }));
                        LOGGER.log(`Authentication failed`);
                        return;
                    }
                    this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 200, message: "Already Authentified" }));
                    return;
                }

                // Set user
                this.user = User.getUser(username);
                this.user.setWebsocket(this.ws);

                this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" }));
                LOGGER.log(`Authentication succeeded : user ${this.user.getUsername()} logged in`);

                // Envoie des sockettes en attentes
                this.user.sendWaitingMessages();

                return;
            }
            if (!this.isAuthenticated()) {
                this.ws.send(JSON.stringify({ event: "AUTHENTICATION", status: 403, message: "Not Authenticated" }));
                return;
            }

            const game: Game = Game.getGame(data.game_id);
            if (!game) {
                this.ws.send(JSON.stringify({ event: "GAME_VERIFICATION", status: 409, message: "Game doesn't exist" }));
                return;
            }
            if (!game.getPlayer(this.user.getUsername())) {
                this.ws.send(JSON.stringify({ event: "PLAYER_VERIFICATION", status: 409, message: "User doesn't exist in this game" }));
                return;
            }
            const player: Player = game.getPlayer(this.user.getUsername());

            if (!Event.getEventActions(data.event)) {
                this.ws.send(JSON.stringify({ event: "EVENT_VERIFICATION", status: 500, message: "Event doesn't exist" }));
                return;
            }

            LOGGER.log(`Received event ${data.event} for game ${game.getGameId()} from user ${this.user.getUsername()}`);
            // Exécute les méthodes relatives à un événement
            for (const func of Event.getEventActions(data.event)) func(game, player, data.data);
        } catch (e) {
            console.log(e);
            this.ws.send(JSON.stringify({ status: 500, message: "Server Internal Error" }));
        }
    }

}
