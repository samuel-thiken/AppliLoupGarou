import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import Logger from "../../util/Logger";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModel";

const LOGGER = new Logger("CONTAMINATION");

export default class ContaminationPower extends Power {

    public static POWERNAME = "CONTAMINATION";
    private victim: Player;

    public constructor() {
        super(ContaminationPower.POWERNAME, true);
    }

    public tryAssign(game: Game, players: Player[]): Player|null {
        const werewolves = players.filter((player) => player.isWerewolf());
        if (werewolves.length === 0) return;

        const proba = game.getGameParam().probaContamination as number;
        if (proba && Math.random() > proba) return;

        const player = werewolves[Math.floor(Math.random() * werewolves.length)];
        player.setPower(this);
        return player;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CONTAMINATION"]): void {
        if (player.getPower().getName() !== ContaminationPower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have contamination power");
            return;
        }
        const victim: Player = game.getPlayer(data.target);
        if (victim.isDead()) {
            player.sendError("POWER_ERROR", 403, "Contaminated player is dead");
            return;
        }

        this.addTarget(victim);
    }

    public applyPower(game: Game, player: Player): void {
        this.getTargets()[0].setWerewolf(true);
        LOGGER.log(`Contamination power applied (${this.getTargets()[0].getName()} is now a werewolf)`);
    }

}

Power.registerPower(ContaminationPower);
Event.registerHandlers("USE_POWER_CONTAMINATION", usePower);
