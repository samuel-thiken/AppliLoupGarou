import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModel";

export default class InsomniaPower extends Power {

    public static POWERNAME = "INSOMNIA";

    public constructor() {
        super(InsomniaPower.POWERNAME, false);
    }

    public tryAssign(game: Game, players: Player[]): Player|null {
        const humans = players.filter((player) => !player.isWerewolf());
        if (humans.length === 0) return;

        const proba = game.getGameParam().probaInsomnie as number;
        if (proba && Math.random() > proba) return;

        const player = humans[Math.floor(Math.random() * humans.length)];
        player.setPower(this);
        return player;
    }

    public usePower(game: Game, player: Player, data: Record<string, any>): void {
        throw new Error("Method not implemented.");
    }

    public applyPower(game: Game, player: Player): void {
        throw new Error("Method not implemented.");
    }

}

Power.registerPower(InsomniaPower);
