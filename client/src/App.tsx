import React, { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import "./app.scss";

function MantineSetup(props: {
    children?: ReactNode | ReactNode[];
}): JSX.Element {
    return (
        <MantineProvider
            theme={{
                colors: {
                    brand: [
                        "#fff8da",
                        "#ffebad",
                        "#ffdd7d",
                        "#ffcf4b",
                        "#ffc21a",
                        "#e6a800",
                        "#b38300",
                        "#805d00",
                        "#4e3800",
                        "#1d1300",
                    ],
                },
                primaryColor: "brand",
                colorScheme: "dark",
            }}
            withCSSVariables
            withGlobalStyles
            withNormalizeCSS
        >
            <ModalsProvider>
                <Notifications />
                {props.children}
            </ModalsProvider>
        </MantineProvider>
    );
}

function App() {
    return (
        <div className="app-container">
            <MantineSetup></MantineSetup>
        </div>
    );
}

export default App;
