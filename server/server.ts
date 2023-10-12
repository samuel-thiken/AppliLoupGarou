import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import { createSchema } from "./util/database";
import gameRouter from "./routers/game";
import { Game } from "./models/gameModel";
import cors from "cors";
import * as WebSocket from "ws";

import { WebsocketConnection } from "./controllers/websocketController";
import userRouter from "./routers/user";

import requireDirectory from "require-dir";
requireDirectory("./controllers/event");

const app: Application = express();

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ noServer: true });

const { PORT, HOST } = process.env;

createSchema();
console.log("database created");
Game.loadAllGame();

app.use(
    cors({
        origin: true
    })
);
app.use(express.json());
app.use("/game", gameRouter);
app.use("/user", userRouter);

wss.on("connection", (ws: WebSocket) => {
    WebsocketConnection.onConnect(ws);
});

const server = app.listen(parseInt(PORT), HOST, () => {
    console.log(`The application is listening on port http://${HOST}:${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (s) => {
        wss.emit("connection", s, request);
    });
});
