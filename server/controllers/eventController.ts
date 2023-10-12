import { Game } from "../models/gameModel";
import { ClientToServerEvents } from "./event/eventTypes";
import { Player } from "../models/playerModel";

type functionHandler = (game: Game, player: Player, data: Record<string, any>) => void;

export class Event {

    private static eventHandlers: { [key: string]: Array<functionHandler> } = {};

    /**
     * Renvoie la liste des méthodes associées à un événement
     * @param {string} event nom de l'événement
     * @returns {Array<functionHandler>} Liste des méthodes associées à l'événement
     */
    public static getEventActions(event: string): Array<functionHandler> {
        if (Event.eventHandlers[event]) return Event.eventHandlers[event];
        return null;
    }

    /**
     * Enregistre une méthode à exécuter lors de l'arrivé d'un événement
     * @param {string} event nom de l'événement
     * @param {functionHandler} func méthode à exécuter lors de l'arrivée de l'événement
     */
    public static registerHandlers<T extends keyof ClientToServerEvents>(event: T, func: (game: Game, user: Player, data: ClientToServerEvents[T]) => void): void {
        if (Event.eventHandlers[event]) Event.eventHandlers[event].push(func);
        else Event.eventHandlers[event] = [func];
    }

}
