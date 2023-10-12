import express from "express";
import { debugUser, login, register, whoAmI } from "../controllers/userController";
const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.get("/whoami", whoAmI);
userRouter.post("/register", register);
userRouter.get("/debug", debugUser);

export default userRouter;
