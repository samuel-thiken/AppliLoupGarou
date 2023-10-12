import React, { useState } from "react";

export type UserContextType = {
    token: string;
    setToken:(token: string) => void;
    username: string;
    setUsername: (username: string) => void;
}

export const UserContext = React.createContext<UserContextType>({
            token: "",
            setToken: () => null,
            username: "",
            setUsername: () => null
        });

export function UserProvider(props: { children: React.ReactNode }): React.ReactElement {
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");

    return <UserContext.Provider value={{ token, setToken, username, setUsername }}>{props.children}</UserContext.Provider>;
}
