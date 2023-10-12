import React, { useState } from "react";

type Theme = "light" | "dark" | "system";

export const SettingsContext = React.createContext<{
    theme: Theme;
    setTheme:(theme: Theme) => void;
        }>({
            theme: "dark",
            setTheme: () => null
        });

export function SettingsProvider(props: { children: React.ReactNode }): React.ReactElement {
    const [theme, setTheme] = useState<Theme>("system");

    return <SettingsContext.Provider value={{ theme, setTheme }}>{props.children}</SettingsContext.Provider>;
}
