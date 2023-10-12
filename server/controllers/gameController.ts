import { Request, Response } from "express";
import { Game, GameParam, GameStatus } from "../models/gameModel";
import { Event } from "../controllers/eventController";
import database from "../util/database";

import { User } from "../models/userModel";
import { Player } from "../models/playerModel";
import { SQLBoolean } from "../util/sql/schema";
import { AuthenticatedRequest } from "./authenticationController";
import Logger from "../util/Logger";

const LOGGER = new Logger("MANAGE_GAME");

export async function searchGame(req: Request, res: Response): Promise<void> {
    //game list from SQLdatabase;
    try {
        res.status(200).json({
            games: Game.getAllGames()
                .filter((g) => {
                    if (g.isStarted() && g.getWinningRole()) return false;
                    if (g.isStarted() && g.getGameParam().nbPlayerMin > g.getAllPlayers().length) return false;
                    return true;
                })
                .map((g) => ({
                    id: g.getGameId(),
                    startDate: g.getGameParam().startDate,
                    host: g.getHost().getUsername(),
                    nbPlayerMax: g.getGameParam().nbPlayerMax,
                    currentNumberOfPlayer: g.getAllPlayers().length
                }))
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function searchGameById(req: Request, res: Response): Promise<void> {
    try {
        const gameId: number = parseInt(req.params.id);
        if (!gameId) throw new Error("Invalid game ID provided");

        // Récupérer le jeu depuis la base de données SQL avec l'ID
        const game: {
            id: number;
            nbPlayerMax: number;
            dayLength: number;
            nightLength: number;
            startDate: number;
            percentageWerewolf: number;
            probaContamination: number;
            probaInsomnie: number;
            probaVoyance: number;
            probaSpiritisme: number;
            host: string;
        } = await database
            .selectFrom("games")
            .select(["id", "nbPlayerMax", "dayLength", "nightLength", "startDate", "percentageWerewolf", "probaContamination", "probaInsomnie", "probaVoyance", "probaSpiritisme", "host"])
            .where("id", "=", gameId)
            .executeTakeFirstOrThrow();

        res.status(200).json({
            ...game,
            wereWolfCount: Math.ceil(game.nbPlayerMax * game.percentageWerewolf)
        });
    } catch (err) {
        LOGGER.log(err.message);
        res.status(500).json({ message: err.message });
    }
}

export function searchGameByUsername(req: AuthenticatedRequest, res: Response): void {
    try {
        const user = req.user;
        res.status(200).json({
            games: Game.getAllGames()
                .filter((g) => g.isUserPlaying(user))
                .map((g) => ({
                    id: g.getGameId(),
                    startDate: g.getGameParam().startDate,
                    host: g.getHost().getUsername(),
                    nbPlayerMax: g.getGameParam().nbPlayerMax,
                    currentNumberOfPlayer: g.getAllPlayers().length,
                    ended: g.getWinningRole() != null,
                    winningRole: g.getWinningRole()
                }))
        });
    } catch (err) {
        LOGGER.log(err.message);
        res.status(500).json({ message: err.message });
    }
}

export const newGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user: User = req.user;
    // Valeur par défaut de la date
    let date: number;
    if (req.body.startDate) date = parseInt(req.body.startDate);
    else date = Date.now() + 1000 * 60 * 60 * 8;

    const game = {
        host: user.getUsername(),
        nbPlayerMin: req.body.nbPlayerMin || 5,
        nbPlayerMax: req.body.nbPlayerMax || 20,
        dayLength: req.body.dayLength || 14 * 60 * 60 * 1000,
        nightLength: req.body.nightLength || 10 * 60 * 60 * 1000,
        startDate: date,

        percentageWerewolf: req.body.percentageWerewolf || 0.33,
        probaContamination: req.body.probaContamination || 0,
        probaInsomnie: req.body.probaInsomnie || 0,
        probaVoyance: req.body.probaVoyance || 0,
        probaSpiritisme: req.body.probaSpiritisme || 0
    };
    const conditions = [
        { minRange: 0, value: game.probaContamination, maxRange: 1, errorMessage: "Unvalid contamination probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaInsomnie, maxRange: 1, errorMessage: "Unvalid Insomnie probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaVoyance, maxRange: 1, errorMessage: "Unvalid Voyance probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaSpiritisme, maxRange: 1, errorMessage: "Unvalid Spiritisme probability Should be in [0,1]" },
        { minRange: 0, value: game.percentageWerewolf, maxRange: 1, errorMessage: "Unvalid wereWolf quantity : Should be in [0,1]" },
        { minRange: 0, value: game.dayLength, maxRange: 24 * 60 * 60 * 1000, errorMessage: "Day length in seconde too long " },
        { minRange: 0, value: game.nightLength, maxRange: 24 * 60 * 60 * 1000, errorMessage: "Night length in seconde too long" },
        { minRange: 2, value: game.nbPlayerMin, maxRange: 498, errorMessage: "There must be at least two players" },
        { minRange: game.nbPlayerMin, value: game.nbPlayerMax, maxRange: 500, errorMessage: "Too many players (MAX 500)" },
        { minRange: Date.now(), value: game.startDate, maxRange: Infinity, errorMessage: "Start date passed" }
    ];

    for (const cond of conditions) {
        if (cond.value < cond.minRange || cond.value > cond.maxRange) {
            res.status(406).json({ message: cond.errorMessage });
            LOGGER.log(`Failed to create new game: setting ${cond.value} not between ${cond.minRange} and ${cond.maxRange}`);
            return;
        }
    }

    const gameParam: GameParam = {
        nbPlayerMin: game.nbPlayerMin,
        nbPlayerMax: game.nbPlayerMax,
        dayLength: game.dayLength,
        nightLength: game.nightLength,
        startDate: date,
        percentageWerewolf: game.percentageWerewolf,
        probaContamination: game.probaContamination,
        probaInsomnie: game.probaInsomnie,
        probaVoyance: game.probaVoyance,
        probaSpiritisme: game.probaSpiritisme
    };

    try {
        const gameId: { id: number } = await database.insertInto("games").values(game).returning("id").executeTakeFirstOrThrow();
        const newHostGame: Game = new Game(gameId.id, user, gameParam);

        await database
            .insertInto("players")
            .values({
                user: user.getUsername(),
                alive: SQLBoolean.true,
                werewolf: SQLBoolean.false,
                power: null,
                game: gameId.id
            })
            .execute();

        // On ajoute l'utilisateur aux joueurs de la partie
        const player: Player = new Player(user, newHostGame);
        newHostGame.addPlayer(player);

        // On ajoute un evenement
        LOGGER.log(`New game created and start in ${(game.startDate - Date.now()) / 60000} min`);
        res.status(200).json({ message: `New game created and start in ${(game.startDate - Date.now()) / 60000} min` });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

export const joinGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user: User = req.user;
        if (!user) throw new Error("No user provided");
        const gameId: number = parseInt(req.params.id);
        if (!gameId) throw new Error("No game ID provided");

        const game: Game = Game.getGame(gameId);
        if (!game) throw new Error("Game doesn't exist or has been deleted by the host");
        if (game.getStatus() !== GameStatus.NOT_STARTED) throw new Error("Game already started");

        // Check if player already in game
        if (game.getPlayer(user.getUsername())) throw new Error("User is already in the game");

        // Check if the game is full or not
        if (game.getAllPlayers().length >= game.getGameParam().nbPlayerMax) throw new Error("Game full");

        // Ajout du joueur dans la liste des joueurs de la partie
        const player: Player = new Player(user, game);
        game.addPlayer(player);

        // Insert a new record in the user_games table
        await database
            .insertInto("players")
            .values({
                user: user.getUsername(),
                alive: SQLBoolean.true,
                werewolf: SQLBoolean.false,
                power: null,
                game: gameId
            })
            .execute();

        res.status(200).json({ message: "Game successfully join" });
    } catch (err) {
        LOGGER.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

export const leaveGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user: User = req.user;
        const gameId: number = parseInt(req.params.id);
        if (!gameId) throw new Error("No game ID provided");

        const game: Game = Game.getGame(gameId);
        if (!game) throw new Error("Game doesn't exist or has been deleted by the host");
        if (game.getStatus() !== GameStatus.NOT_STARTED) throw new Error("Game already started");

        // Check if player already in game
        if (!game.getPlayer(user.getUsername())) throw new Error("User haven't join this game");

        // Si le joueur est l'hôte de la partie, on supprime la partie
        if (game.getHost() === user) {
            await database.deleteFrom("games").where("games.id", "=", gameId).execute();
            game.delete();
            res.status(200).json({ message: `Game ${gameId} deleted because the host leaves the game` });
            LOGGER.log(`Game ${gameId} deleted because the host leaves the game`);
            return;
        }

        // Supression du joueur dans la liste des joueurs de la partie
        const player: Player = game.getPlayer(user.getUsername());
        game.removePlayer(player.getName());

        // Insert a new record in the user_games table
        await database.deleteFrom("players").where("players.game", "=", gameId).where("players.user", "=", user.getUsername()).executeTakeFirst();

        res.status(200).json({ message: `Player sucessfully remove from the game ${gameId}` });
    } catch (err) {
        LOGGER.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

function getInfoPlayersList(game: Game, player: Player): void {
    player.sendInfoAllPlayers();
}

function endGame(game: Game, player: Player): void {
    game.eventEndGame(player);
}

function gameStatus(game: Game, player: Player): void {
    if (game.getStatus() === GameStatus.DAY) game.eventDayStart(player);
    else if (game.getStatus() === GameStatus.NIGHT) game.eventNightStart(player);
}

// Event.registerHandlers("GET_ALL_INFO", getInfoGame);
Event.registerHandlers("GET_ALL_INFO", getInfoPlayersList);
Event.registerHandlers("GET_ALL_INFO", endGame);
Event.registerHandlers("GET_ALL_INFO", gameStatus);
