import { sql } from "kysely";
import database from "../util/database";
import { Player } from "./playerModel";
import { Chat, ChatType } from "./chatModel";
import { Vote, VoteType } from "./voteModel";
import Logger from "../util/Logger";
import InsomniaPower from "./powers/InsomniaPower";
import { toBoolean } from "../util/sql/schema";
import { User } from "./userModel";
import { unique } from "../util/Utils";
import Power from "./powerModel";

const LOGGER = new Logger("GAME");

export enum GameStatus {
    NOT_STARTED = "NOT_STARTED",
    NIGHT = "NIGHT",
    DAY = "DAY",
}

export enum Role {
    HUMAN = "HUMAN",
    WEREWOLF = "WEREWOLF",
}

export type GameParam = {
    nbPlayerMin: number;
    nbPlayerMax: number;
    dayLength: number;
    nightLength: number;
    startDate: number;
    percentageWerewolf: number;
    probaContamination: number;
    probaInsomnie: number;
    probaVoyance: number;
    probaSpiritisme: number;
    [key: string]: number | string;
};

export class Game {

    private static games: Map<number, Game> = new Map();

    private gameId: number;
    private host: User;
    private gameParam: GameParam;
    private players: Map<string, Player> = new Map();
    private chats: Array<Chat>;
    private currentVote: Vote;

    constructor(gameId: number, host: User, gameParam: GameParam) {
        this.gameId = gameId;
        this.host = host;
        this.gameParam = gameParam;
        this.chats = [new Chat(ChatType.CHAT_VILLAGE, []), new Chat(ChatType.CHAT_WEREWOLF, []), new Chat(ChatType.CHAT_SPIRITISM, [])];
        this.currentVote = null;

        Game.addGameInList(this);

        // Si game pas commencé, on ajoute un evenement, Sinon on reprend la partie ou on en était.
        if (this.getStatus() === GameStatus.NOT_STARTED) setTimeout(this.initGame.bind(this), this.gameParam.startDate - Date.now());
        else this.initGame();
    }

    /* ------------------ fonction logique de la partie ------------------ */

    /**
     * Mise à jour du chat du chaman
     * @param {Player} chaman Joueur ayant le pouvoir de spiritisme
     * @param {Player} deadPlayer Joueur mort qui échange avec lui la nuit
     * @returns {void}
     */
    public setChatSpiritism(chaman: Player, deadPlayer: Player): void {
        this.getChat(ChatType.CHAT_SPIRITISM).resetChatMembers([chaman, deadPlayer]);
    }

    public addPlayer(player: Player): void {
        this.players.set(player.getName(), player);
    }

    public removePlayer(username: string): void {
        this.players.delete(username);
    }

    public isUserPlaying(user: User): boolean {
        return this.players.has(user.getUsername());
    }

    public delete(): void {
        Game.games.delete(this.gameId);
    }

    public isStarted(): boolean {
        return this.getGameParam().startDate < Date.now();
    }

    public eventDayStart(player: Player): void {
        const elapsedTime: number = ((Date.now() - this.getGameParam().startDate) % (this.getGameParam().dayLength + this.getGameParam().nightLength)) - this.getGameParam().nightLength;
        player.sendMessage("DAY_START", { phaseLength: this.getGameParam().dayLength, elapsedTime: elapsedTime });
    }

    public eventNightStart(player: Player): void {
        const elapsedTime: number = (Date.now() - this.getGameParam().startDate) % (this.getGameParam().dayLength + this.getGameParam().nightLength);
        player.sendMessage("NIGHT_START", { phaseLength: this.getGameParam().nightLength, elapsedTime: elapsedTime });
    }

    public eventEndGame(player: Player): void {
        const winningRole: Role = this.getWinningRole();
        if (winningRole) player.sendMessage("END_GAME", { winningRole: winningRole });
    }

    private setupRoles(): void {
        const nbWerewolves: number = Math.max(1, Math.ceil(this.gameParam.percentageWerewolf * this.getAllPlayers().length));
        const players: Array<Player> = this.getAllPlayers();
        const werewolves: Array<Player> = [];
        while (players.length > 0 && werewolves.length < nbWerewolves) {
            const werewolf: Player = players[Math.floor(Math.random() * players.length)];
            werewolf.setWerewolf(true);
            werewolves.push(werewolf);
            players.splice(players.indexOf(werewolf), 1);
        }
        LOGGER.log(`${nbWerewolves} werewolf(s) in this game`);
        werewolves.forEach((player) => LOGGER.log(`${player.getName()} is a werewolf in this game`));
    }

    private setupPower(): void {
        const powers = Power.getPowers();
        let players = this.getAllPlayers();
        for (const power of powers) {
            const powerInstance = new power();
            const assignedPlayer = powerInstance.tryAssign(this, players);
            if (assignedPlayer) 
                players = players.filter((player) => player !== assignedPlayer);
        }
    }

    private verifyEndGame(): boolean {
        const winningRole: Role = this.getWinningRole();
        if (winningRole) {
            this.getAllPlayers().forEach((player) => this.eventEndGame(player));
            LOGGER.log("End game");
            return true;
        }
        LOGGER.log("Game not still ended");
        return false;
    }

    public applyPowers(): void {
        this.getAllPlayers()
            .filter((player) => player.getPower() && player.getPower().getApplyDay() && player.getPower().getAlreadyUsed())
            .map((player) => player.getPower().applyPower(this, player));
    }

    public executionResultVote(): void {
        const resultVote: Player = this.currentVote.getResult();
        if (resultVote) {
            resultVote.kill();
            LOGGER.log(`Player ${resultVote.getName()} is dead`);
        }
    }

    private resetPowers(): void {
        this.getAllPlayers()
            .filter((player) => player.getPower())
            .forEach((player) => {
                player.getPower().setAlreadyUsed(false);
                player.sendPowerState();
            });
    }

    startDay(): void {
        LOGGER.log(`game ${this.getGameId()} changed to day`);

        // Application des pouvoirs
        this.applyPowers();

        // Mort du résultat des votes
        this.executionResultVote();

        LOGGER.log(`Alive humans number: ${this.getAllPlayers().filter((p) => !p.isWerewolf() && !p.isDead()).length}`);
        LOGGER.log(`Alive werewolves number: ${this.getWerewolves().filter((p) => !p.isDead()).length}`);

        // Envoie à chaque joueur le début du jour et un recap de la nuit
        this.getAllPlayers().forEach((player) => {
            this.eventDayStart(player);
            player.sendInfoAllPlayers();
        });

        // Vérification si fin de partie
        const isEndGame: boolean = this.verifyEndGame();

        if (!isEndGame) {
            // Fermeture des chats de la nuit et réinitilisation des chats du jour
            this.getChat(ChatType.CHAT_WEREWOLF).close();
            this.getChat(ChatType.CHAT_SPIRITISM).close();
            this.getChat(ChatType.CHAT_VILLAGE).resetChatMembers(this.getAllPlayers());

            // Fermeture du vote précédent et initialisation du vote
            this.currentVote.close();
            this.setVote(new Vote(VoteType.VOTE_VILLAGE, Player.alivePlayers(this.getAllPlayers())));
            this.currentVote.open();

            setTimeout(this.startNight.bind(this), this.gameParam.dayLength);
        }
    }

    startNight(): void {
        LOGGER.log(`game ${this.getGameId()} changed to night`);

        // Mort du résultat des votes
        if (this.currentVote) this.executionResultVote();

        LOGGER.log(`Alive humans number: ${this.getAllPlayers().filter((p) => !p.isWerewolf() && !p.isDead()).length}`);
        LOGGER.log(`Alive werewolves number: ${this.getWerewolves().filter((p) => !p.isDead()).length}`);

        // Envoie à chaque joueur le début de la nuit et un recap du jour
        this.getAllPlayers().forEach((player) => {
            this.eventNightStart(player);
            player.sendInfoAllPlayers();
        });

        // Vérification si fin de partie
        const isEndGame: boolean = this.verifyEndGame();

        if (!isEndGame) {
            // Réinitialisation des pouvoirs
            this.resetPowers();

            // Fermeture des chats du jour et réinitilisation des chats de la nuit
            this.getChat(ChatType.CHAT_VILLAGE).close();
            this.getChat(ChatType.CHAT_WEREWOLF).resetChatMembers(unique(...this.getWerewolves(), ...this.getAllPlayers().filter((p) => p.isDead()), this.getPlayerWithPower(InsomniaPower.POWERNAME)));
            this.getChat(ChatType.CHAT_SPIRITISM).resetChatMembers([]);

            // Fermeture du vote précédent et initialisation du vote
            if (this.currentVote) this.currentVote.close();
            this.setVote(new Vote(VoteType.VOTE_WEREWOLF, Player.alivePlayers(this.getWerewolves())));
            this.currentVote.open();

            setTimeout(this.startDay.bind(this), this.gameParam.nightLength);
        }
    }

    public async initGame(): Promise<void> {
        // Vérification des conditions de lancement de la partie
        if (!Game.games.has(this.gameId)) return;
        if (this.getGameParam().nbPlayerMin > this.getAllPlayers().length) {
            this.getAllPlayers().forEach((player) => player.sendMessage("GAME_DELETED", { message: "game deleted" }));
            LOGGER.log(`Game ${this.gameId} cancelled because there isn't enough players`);
            return;
        }

        LOGGER.log(`Initialisation de la partie : ${this.gameId}`);
        //Initialisation des roles et des pouvoirs
        LOGGER.log(`Initialisation des rôles : ${this.gameId}`);
        this.setupRoles();
        LOGGER.log(`Initialisation des pouvoirs : ${this.gameId}`);
        this.setupPower();

        // Lancement du jeu avec la première nuit
        LOGGER.log(`game ${this.gameId} successfuly initialized`);
        this.startNight();
    }

    /* ------------------ Getter et Setter ------------------ */

    /** Return Id of the game
     * @returns {number} Id of the game
     */
    public getGameId(): number {
        return this.gameId;
    }

    public getHost(): User {
        return this.host;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }

    public getVote(): Vote {
        return this.currentVote;
    }

    public setVote(vote: Vote): void {
        this.currentVote = vote;
    }

    public getChat(type: ChatType): Chat {
        return this.chats.find((chat) => chat.getType() === type);
    }
    public getAllPlayers(): Array<Player> {
        return Array.from(this.players.values());
    }

    public getPlayer(username: string): Player {
        return this.players.get(username);
    }

    public getWerewolves(): Array<Player> {
        return this.getAllPlayers().filter((player: Player) => player.isWerewolf());
    }

    private getPlayerWithPower(power: string): Player | undefined {
        return this.getAllPlayers().find((p) => p.getPower() && p.getPower().getName() === power);
    }

    public getWinningRole(): Role | null {
        if (!this.isStarted()) return null;
        if (this.getWerewolves().filter((player) => !player.isDead()).length === 0) return Role.HUMAN;
        else if (this.getAllPlayers().filter((player) => !player.isWerewolf() && !player.isDead()).length === 0) return Role.WEREWOLF;
        return null;
    }

    public getStatus(): GameStatus {
        const timeSinceGameStart: number = Date.now() - this.gameParam.startDate;
        if (timeSinceGameStart < 0) return GameStatus.NOT_STARTED;
        const timeSinceCycleStart = timeSinceGameStart % (this.gameParam.dayLength + this.gameParam.nightLength);
        if (timeSinceCycleStart - this.gameParam.nightLength <= 0) return GameStatus.NIGHT;
        else return GameStatus.DAY;
    }

    /* ------------------ Static Function ------------------ */
    /**
     * Get game from the database
     * @param {number} gameId game id
     * @returns {Game}
     */
    static async load(gameId: number): Promise<Game> {
        const game: { id: number; host: string } & GameParam = await database
            .selectFrom("games")
            .select([
                "id",
                "nbPlayerMin",
                "nbPlayerMax",
                "dayLength",
                "nightLength",
                "startDate",
                "percentageWerewolf",
                "probaContamination",
                "probaInsomnie",
                "probaVoyance",
                "probaSpiritisme",
                "host"
            ])
            .where("id", "=", gameId)
            .executeTakeFirstOrThrow();
        const gameParams: GameParam = {
            nbPlayerMin: game.nbPlayerMin,
            nbPlayerMax: game.nbPlayerMax,
            dayLength: game.dayLength,
            nightLength: game.nightLength,
            startDate: game.startDate,
            percentageWerewolf: game.percentageWerewolf,
            probaContamination: game.probaContamination,
            probaInsomnie: game.probaInsomnie,
            probaVoyance: game.probaVoyance,
            probaSpiritisme: game.probaSpiritisme
        };

        return new Game(gameId, await User.load(game.host), gameParams);
    }

    public static getAllGames(): Array<Game> {
        return Array.from(Game.games.values());
    }

    public static addGameInList(game: Game): void {
        Game.games.set(game.getGameId(), game);
    }

    public static getGame = (gameId: number): Game => {
        const game = Game.games.get(gameId);
        return game;
    };

    /**
     * Function use to create a game table in the database if it is necessary
     * Next, load all game in the database and create an event to start a game at the starting date
     */
    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("games")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("host", "text", (col) => col.notNull().references("users.username"))
            .addColumn("nbPlayerMin", "integer", (col) => col.defaultTo(5).notNull())
            .addColumn("nbPlayerMax", "integer", (col) => col.defaultTo(20).notNull())
            .addColumn("dayLength", "integer", (col) => col.defaultTo(10).notNull())
            .addColumn("nightLength", "integer", (col) => col.defaultTo(12).notNull())
            .addColumn("startDate", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .addColumn("percentageWerewolf", "real", (col) => col.defaultTo(0.33).notNull())
            .addColumn("probaContamination", "real", (col) => col.defaultTo(0).notNull())
            .addColumn("probaInsomnie", "real", (col) => col.defaultTo(0).notNull())
            .addColumn("probaVoyance", "real", (col) => col.defaultTo(0).notNull())
            .addColumn("probaSpiritisme", "real", (col) => col.defaultTo(0).notNull())
            .execute();
    };

    public static async loadAllGame(): Promise<void> {
        // On charge chaque parties en cours
        const gamelist: Array<{ id: number; host: string } & GameParam> = await database
            .selectFrom("games")
            .select([
                "id",
                "host",
                "nbPlayerMin",
                "nbPlayerMax",
                "dayLength",
                "nightLength",
                "startDate",
                "percentageWerewolf",
                "probaContamination",
                "probaInsomnie",
                "probaVoyance",
                "probaSpiritisme"
            ])
            .execute();
        for (const elem of gamelist) {
            const gameParams: GameParam = {
                nbPlayerMin: elem.nbPlayerMin,
                nbPlayerMax: elem.nbPlayerMax,
                dayLength: elem.dayLength,
                nightLength: elem.nightLength,
                startDate: elem.startDate,
                percentageWerewolf: elem.percentageWerewolf,
                probaContamination: elem.probaContamination,
                probaInsomnie: elem.probaInsomnie,
                probaVoyance: elem.probaVoyance,
                probaSpiritisme: elem.probaSpiritisme
            };
            const game: Game = new Game(elem.id, await User.load(elem.host), gameParams);
            game.load();
        }
        LOGGER.log("Chargement des parties déjà créées terminé");
    }

    public async load(): Promise<void> {
        const players = await database.selectFrom("players").select(["user", "alive", "werewolf", "power", "game"]).where("game", "=", this.getGameId()).execute();

        for (const dPlayer of players) {
            const player = await Player.load(this, { ...dPlayer, alive: toBoolean(dPlayer.alive), werewolf: toBoolean(dPlayer.werewolf) });
            this.addPlayer(player);
        }

        LOGGER.log(`Game ${this.gameId} successfully loaded`);
    }

}
