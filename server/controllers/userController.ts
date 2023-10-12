import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import database from "../util/database";
import { User } from "../models/userModel";
import { AuthenticatedRequest } from "./authenticationController";
import Logger from "../util/Logger";

const { JWT_SECRET } = process.env;

const LOGGER = new Logger("AUTHENTICATION");

export const getTokenContent = (token: string): { username: string } => {
    if (!jwt.verify(token, JWT_SECRET)) throw new Error("Invalid Token !");

    const username: string = (jwt.decode(token) as { username: string }).username;
    return {
        username: username
    };
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    LOGGER.log("Authentification de l'utilisateur");

    if (!username) {
        res.status(400).send("Missing username");
        return;
    }
    if (!password) {
        res.status(400).send("Missing password");
        return;
    }

    try {
        const user = await database.selectFrom("users").select(["username", "password"]).where("username", "=", username).executeTakeFirstOrThrow();
        if (!user) {
            res.status(500).send("Invalid username or invalid password");
            return;
        }
        if (!(await bcrypt.compare(password, user.password))) {
            res.status(500).send("Invalid username or invalid password");
            return;
        }
    } catch (e) {
        res.status(500).send("Invalid username or invalid password");
        return;
    }

    const token: string = jwt.sign(
        {
            username: username
        },
        JWT_SECRET
    );

    res.status(200).json({
        token: token
    });
};

export const whoAmI = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const username: string = getTokenContent(req.headers["x-access-token"] as string).username;
        res.status(200).json({ username: username });
    } catch (e) {
        res.sendStatus(400);
    }
};

export const register = async (req: Request<any, any, { username: string; password: string }>, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username) {
        res.status(400).send("Missing username");
        return;
    }
    if (!password) {
        res.status(400).send("Missing password");
        return;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // On s'assure que le nom d'utilisateur n'est pas déjà utilisé
    if (User.getUser(username)) {
        res.status(409).send("User already register");
        return;
    }

    // Insertion de l'utilisateur dans la base de données
    try {
        await database.insertInto("users").values({ username: username, password: hashPassword }).execute();
    } catch (e) {
        res.sendStatus(500);
        return;
    }

    // Insertion de l'utilisateur dans le dictionnaire des utilisateurs
    await User.load(username);

    const token: string = jwt.sign(
        {
            username: username
        },
        JWT_SECRET
    );

    res.status(200).json({
        token: token
    });
};

export const debugUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await database.selectFrom("users").select(["username", "password"]).execute();
        res.status(200).json(users);
    } catch (e) {
        res.sendStatus(404);
        return;
    }
};
