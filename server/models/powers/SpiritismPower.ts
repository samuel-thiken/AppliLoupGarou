import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import Logger from "../../util/Logger";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModel";

const LOGGER = new Logger("SPIRITISM");

export default class SpiritismPower extends Power {

    public static POWERNAME = "SPIRITISM";
    private victim: Player;

    public constructor() {
        super(SpiritismPower.POWERNAME, false);
    }

    public tryAssign(game: Game, players: Player[]): Player|null {
        const proba = game.getGameParam().probaSpiritisme as number;
        if (proba && Math.random() > proba) return;

        const player = players[Math.floor(Math.random() * players.length)];
        player.setPower(this);
        return player;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_SPIRITISM"]): void {
        if (player.getPower().getName() !== SpiritismPower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have spiritism power");
            return;
        }

        const deadPlayer: Player = game.getPlayer(data.target);
        if (!deadPlayer.isDead()) {
            player.sendError("POWER_ERROR", 403, "Dead player is not dead");
            return;
        }

        this.addTarget(deadPlayer);
        this.applyPower(game, player);
    }

    public applyPower(game: Game, player: Player): void {
        game.setChatSpiritism(player, this.getTargets()[0]);
        LOGGER.log(`Spiritism power applied (${player.getName()} and ${this.getTargets()[0].getName()} can now discuss in the spiritism chat`);
    }

}

Power.registerPower(SpiritismPower);
Event.registerHandlers("USE_POWER_SPIRITISM", usePower);
