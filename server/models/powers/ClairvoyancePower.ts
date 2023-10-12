import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import Logger from "../../util/Logger";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModel";

const LOGGER = new Logger("CLAIRVOYANCE");

export default class ClairvoyancePower extends Power {

    public static POWERNAME = "CLAIRVOYANCE";
    private victim: Player;

    public constructor() {
        super(ClairvoyancePower.POWERNAME, false);
    }

    public tryAssign(game: Game, players: Player[]): Player|null {
        const proba = game.getGameParam().probaVoyance as number;
        if (proba && Math.random() > proba) return;

        const player = players[Math.floor(Math.random() * players.length)];
        player.setPower(this);
        return player;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CLAIRVOYANCE"]): void {
        if (player.getPower().getName() !== ClairvoyancePower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have clairvoyance power");
            return;
        }

        this.addTarget(game.getPlayer(data.target));
        this.applyPower(game, player);
    }

    public applyPower(game: Game, player: Player): void {
        const target: Player = this.getTargets()[0];
        player.sendMessage("CLAIRVOYANCE_RESPONSE", { role: target.getRole(), power: target.getPowerName() });
        LOGGER.log(`Clairvoyance power applied (target : ${target.getRole()} AND ${target.getPowerName()})`);
    }

}

Power.registerPower(ClairvoyancePower);
Event.registerHandlers("USE_POWER_CLAIRVOYANCE", usePower);
