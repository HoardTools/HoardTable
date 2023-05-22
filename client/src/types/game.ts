import { useLocalStorage } from "@mantine/hooks";
import { useMemo } from "react";
import { useSession } from "../util/session";
import { useAPI } from "../util/api";
import { omit } from "lodash";

export type SparseGame = {
    id: string;
    name: string;
    owner: string;
    image: string | null;
    resources: number;
    players: number;
};

export type Player = {
    id: string;
    owner_type: "user" | "session";
    owner_id: string;
};

type StoredPlayer = Player & { key: string };

export function usePlayer(): [Player | null, () => void] {
    const { user, session } = useSession();
    const [player, setPlayer] = useLocalStorage<string | null>({
        key: "player",
        defaultValue: null,
    });
    const output: StoredPlayer | null = useMemo(
        () => (player ? JSON.parse(player) : null),
        [player]
    );
    const { post } = useAPI();

    return [
        output ? omit(output, ["key"]) : null,
        () => {
            if (!user && !session) {
                return;
            }
            if (output) {
                post<Player>("/players/refresh", {
                    body: { id: output.id, key: output.key },
                }).then((result) => {
                    console.log(result);
                    if (result.success) {
                        setPlayer(JSON.stringify(result.result));
                    }
                });
            } else {
                post<[Player, string]>("/players/create", {
                    body: {
                        owner_type: user ? "user" : "session",
                        owner_id: user ? user.id : session.id,
                    },
                }).then((result) => {
                    console.log(result);
                    if (result.success) {
                        setPlayer(JSON.stringify(result.result));
                    }
                });
            }
        },
    ];
}
