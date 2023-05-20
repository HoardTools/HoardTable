import { Button, Card, Group, Stack, Text, Badge, Paper } from "@mantine/core";
import { useAPI } from "../../util/api";
import { useSession } from "../../util/session";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { modals } from "@mantine/modals";
import { TFunction } from "i18next";
import { SparseGame } from "../../types/game";
import { useMemo, useState } from "react";

function openCreate(
    t: TFunction<"translation", undefined, "translation">,
    onClose: () => void
) {
    modals.openContextModal({
        modal: "createGame",
        title: t("index.createDialog.title"),
        innerProps: {},
        onClose,
    });
}

function GameCard(props: SparseGame) {
    const { user } = useSession();
    const { t } = useTranslation();
    return (
        <Card className="game-card">
            <Card.Section>
                <Group position="center" p="md">
                    <img
                        src={props.image ?? "./android-chrome-512x512.png"}
                        className="game-image"
                        alt=""
                    />
                </Group>
            </Card.Section>
            <Group position="apart" className="game-header">
                <Text weight={500}>{props.name}</Text>
                {props.owner === (user && user.id) ? (
                    <Badge color="yellow">{t("index.cards.badge.owner")}</Badge>
                ) : (
                    <Badge color="gray">{t("index.cards.badge.player")}</Badge>
                )}
            </Group>
        </Card>
    );
}

export function IndexPage() {
    const { user } = useSession();
    const { get } = useAPI();
    const { t } = useTranslation();

    const [ownedGames, setOwnedGames] = useState<SparseGame[]>([]);

    function updateGames() {
        if (!user) {
            return;
        }

        get<SparseGame[]>("game/owned").then((result) => {
            if (result.success) {
                setOwnedGames(result.result);
            }
        });
    }

    useMemo(updateGames, [user]);

    return (
        <div className="container">
            <Stack spacing={"xl"} className="index-actions">
                <Group className="action-btns" spacing={"md"} position="center">
                    <Button
                        size="lg"
                        color="brand"
                        className="button"
                        variant="outline"
                    >
                        {t("index.actions.join")}
                    </Button>
                    <Button
                        size="lg"
                        color="brand"
                        className="button"
                        variant="outline"
                        onClick={
                            user
                                ? () => openCreate(t, updateGames)
                                : () =>
                                      modals.openContextModal({
                                          modal: "login",
                                          title: t(
                                              "layout.auth.formLogin.title"
                                          ),
                                          innerProps: {
                                              after: () =>
                                                  openCreate(t, updateGames),
                                          },
                                      })
                        }
                    >
                        {t("index.actions.create")}
                    </Button>
                </Group>
                {user && (
                    <Paper className="game-list" p="md" withBorder>
                        <Group spacing={"md"}>
                            {ownedGames.map((v, i) => (
                                <GameCard {...v} key={i} />
                            ))}
                        </Group>
                    </Paper>
                )}
            </Stack>
        </div>
    );
}
