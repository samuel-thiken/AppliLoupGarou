declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            PORT: string;
            HOST: string;
        }
    }
}
export {};
