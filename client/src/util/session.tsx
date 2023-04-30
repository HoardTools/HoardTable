import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { UserData } from "../types/auth";
import { SessionData } from "../types/auth";
import { useAPI } from "./api";

type SessionContextType = {
    session: SessionData;
    user: UserData | null;
    setSession: (session: SessionData) => void;
    setUser: (user: UserData | null) => void;
};
const SessionContext = createContext<SessionContextType>(null as any);

export function SessionProvider(props: { children?: ReactNode | ReactNode[] }) {
    const [session, setSession] = useState<SessionData>({
        id: "",
        expires: 0,
        logged_in: window.localStorage.getItem("uid") ? true : false,
    });
    const [user, setUser] = useState<UserData | null>(null);

    const { get } = useAPI();

    useMemo(() => {
        get<SessionData>("auth/session").then((result) => {
            if (result.success) {
                window.localStorage.setItem("token", result.result.id);
                setSession(result.result);
            }
        });
    }, []);

    useEffect(() => {
        if (session.logged_in) {
            get<UserData>("auth/user").then((result) => {
                if (result.success) {
                    setUser(result.result);
                    window.localStorage.setItem("uid", result.result.id);
                } else {
                    setUser(null);
                    window.localStorage.removeItem("uid");
                }
            });
        }
    }, [session]);

    return (
        <SessionContext.Provider
            value={{
                session,
                user,
                setSession: (session) => {
                    setSession(session);
                    window.localStorage.setItem("token", session.id);
                },
                setUser: (user) => {
                    setUser(user);
                    if (user) {
                        window.localStorage.setItem("uid", user.id);
                    } else {
                        window.localStorage.removeItem("uid");
                    }
                    get<SessionData>("auth/session").then((result) => {
                        if (result.success) {
                            window.localStorage.setItem(
                                "token",
                                result.result.id
                            );
                            setSession(result.result);
                        }
                    });
                },
            }}
        >
            {props.children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextType {
    const session = useContext(SessionContext);
    return session;
}
