import { NextFunction, Request, Response } from "express";
import { getTokenContent } from "./userController";
import { User } from "../models/userModel";

export type AuthenticatedRequest = Request & { user: User };

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.headers["x-access-token"]) {
            res.status(404).send("x-access-token field not found");
            return;
        }
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        const user: User = await User.load(username);

        if (!user) {
            res.status(404).send("Player not found");
            return;
        } else {
            req.user = user;
            return next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error connecting to database");
    }
}
