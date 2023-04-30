import React, { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./app.scss";
import * as translate_en from "./localization/en.json";
import { LayoutComponent } from "./pages/layout";
import { ApiProvider } from "./util/api";
import { CreateAccountDialog, LoginDialog } from "./components/LoginDialog";
import { SessionProvider } from "./util/session";

i18n.use(initReactI18next).init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
        en: {
            translation: translate_en,
        },
    },
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    interpolation: {
        escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
});

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
                primaryShade: 6,
                colorScheme: "dark",
            }}
            withCSSVariables
            withGlobalStyles
            withNormalizeCSS
        >
            <ModalsProvider
                modals={{
                    login: LoginDialog,
                    createAccount: CreateAccountDialog,
                }}
            >
                <Notifications />
                {props.children}
            </ModalsProvider>
        </MantineProvider>
    );
}

function RouterContainer() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<LayoutComponent />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <div className="app-container">
            <ApiProvider>
                <SessionProvider>
                    <MantineSetup>
                        <RouterContainer />
                    </MantineSetup>
                </SessionProvider>
            </ApiProvider>
        </div>
    );
}

export default App;
