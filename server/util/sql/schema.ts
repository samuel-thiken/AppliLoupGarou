import { Generated } from "kysely";

export enum SQLBoolean {
    true = 1,
    false = 0,
}
export function toBoolean(sql: SQLBoolean): boolean {
    return sql === SQLBoolean.true;
}

export interface UserTable {
    username: string;
    password: string;
}

export interface PlayerTable {
    id: Generated<number>;
    power: string;
    user: string;
    game: number;
    alive: SQLBoolean;
    werewolf: SQLBoolean;
}

export interface GameTable {
    id: Generated<number>;
    host: string;
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
}

export interface MessageTable {
    id: Generated<number>;
    game: number;
    type: string;
    user: string;
    content: string;
    date: number;
}

export interface Database {
    users: UserTable;
    players: PlayerTable;
    games: GameTable;
    messages: MessageTable;
}
