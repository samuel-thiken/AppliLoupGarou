import { Game } from "./gameModel";
import { Player } from "./playerModel";

type SubPower = {
    new(): Power
}

export default abstract class Power {

    private static powers: Array<SubPower> = [];

    public static registerPower(power: SubPower): void {
        Power.powers.push(power);
    }
    public static getPowers(): Array<SubPower> {
        return Power.powers;
    }

    private name: string;
    private alreadyUsed: boolean;
    private applyDay: boolean;
    private targets: Array<Player>;

    public constructor(name: string, applyDay: boolean) {
        this.name = name;
        this.alreadyUsed = false;
        this.applyDay = applyDay;
        this.targets = [];
    }

    public getName(): string {
        return this.name;
    }

    public setAlreadyUsed(isUsed: boolean): void {
        this.alreadyUsed = isUsed;
    }

    public getAlreadyUsed(): boolean {
        return this.alreadyUsed;
    }

    public getApplyDay(): boolean {
        return this.applyDay;
    }

    public getTargets(): Array<Player> {
        return this.targets;
    }

    public addTarget(target: Player): void {
        this.targets.push(target);
    }

    public abstract usePower(game: Game, player: Player, data: Record<string, any>): void;

    public abstract applyPower(game: Game, player: Player): void;

    public abstract tryAssign(game: Game, players: Array<Player>): Player|null;

}
