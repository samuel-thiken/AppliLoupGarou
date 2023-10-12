import request from "supertest";
import jwt from "jsonwebtoken";
import { Client, url } from "../main.test";
import { test } from "../test-api/testAPI";

export const testUsers = async (allPlayers: Array<Client>): Promise<void> => {
    await test("Create users", async (t) => {
        // Test de la création des utilisateurs
        for (const player of allPlayers) {
            const res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: player.getName(), password: player.getPassword() }));
            const token = res.body.token;
            const name: string = (jwt.decode(token) as { username: string }).username;
            t.equal(name, player.getName());
            player.setToken(token);
        }
    });

    await test("Test whoami", async (t) => {
        // Test de l'authentification d'un utilisateur avec un token
        const res = await request(url).get("/user/whoami").set("x-access-token", allPlayers[0].getToken());
        t.equal(res.body.username, allPlayers[0].getName());
    });

    await test("User login", async (t) => {
        // Test du login d'un utilisateur
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: allPlayers[1].getName(), password: allPlayers[1].getPassword() }));
        const token: string = res.body.token;
        t.equal((jwt.decode(token) as { username: string }).username, allPlayers[1].getName());
    });

    await test("Username already exists", async (t) => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: allPlayers[1].getName(), password: allPlayers[1].getPassword() }));
        t.equal(res.status, 409);
        t.equal(res.text, "User already register");
    });

    await test("Missing password in user creation", async (t) => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }));
        t.equal(res.status, 400);
        t.equal(res.text, "Missing password");
    });

    await test("Missing username in user creation", async (t) => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: allPlayers[1].getPassword() }));
        t.equal(res.status, 400);
        t.equal(res.text, "Missing username");
    });

    await test("Invalid username", async (t) => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "pierre", password: allPlayers[1].getPassword() }));
        t.equal(res.status, 500);
        t.equal(res.text, "Invalid username or invalid password");
    });

    await test("Invalid password", async (t) => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: allPlayers[1].getName(), password: "AZERT1234" }));
        t.equal(res.status, 500);
        t.equal(res.text, "Invalid username or invalid password");
    });

    await test("Missing password in user authentication", async (t) => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }));
        t.equal(res.status, 400);
        t.equal(res.text, "Missing password");
    });

    await test("Missing username in user authentication", async (t) => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: allPlayers[1].getPassword() }));
        t.equal(res.status, 400);
        t.equal(res.text, "Missing username");
    });

    await test("Wrong token in authentication", async (t) => {
        // Échec de l'authentification d'un utilisateur avec un token
        const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB";
        const res = await request(url).get("/user/whoami").set("x-access-token", wrongToken);
        t.equal(res.status, 400);
    });
};
