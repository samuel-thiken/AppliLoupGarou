import { Game, GameStatus } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import Power from "../../models/powerModel";
import { Event } from "../eventController";

export const usePower = async (game: Game, player: Player, data: Record<string, any>): Promise<void> => {
    if (game.getStatus() !== GameStatus.NIGHT) {
        player.sendError("POWER_ERROR", 403, "Power can be used only during the night");
        return;
    }
    if (player.isDead()) {
        player.sendError("POWER_ERROR", 403, "Dead player cannot use power");
        return;
    }
    if (!player.getPower()) {
        player.sendError("POWER_ERROR", 403, "Player don't have any power");
        return;
    }

    const power: Power = player.getPower();
    if (power.getAlreadyUsed()) {
        player.sendError("POWER_ERROR", 403, "Player has already used his power");
        return;
    }

    if (!game.getPlayer(data.target)) {
        player.sendError("POWER_ERROR", 403, "Target player is not in the game");
        return;
    }

    power.usePower(game, player, data);
    power.setAlreadyUsed(true);
    player.sendPowerState();
};

function getInfoPower(game: Game, player: Player): void {
    player.sendPowerState();
}

Event.registerHandlers("GET_ALL_INFO", getInfoPower);
