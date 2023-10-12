import betterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

import { Database } from "./sql/schema";
import { Game } from "../models/gameModel";
import { Player } from "../models/playerModel";
import { User } from "../models/userModel";
import { Chat } from "../models/chatModel";

const database = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: betterSqlite3("db.sqlite")
    })
});

export const createSchema = async (): Promise<void> => {
    User.schema();
    Player.schema();
    Game.schema();
    Chat.schema();
};

export default database;
