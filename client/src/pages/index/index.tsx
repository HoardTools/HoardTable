import { Button, Group } from "@mantine/core";
import { useAPI } from "../../util/api";
import { useSession } from "../../util/session";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { modals } from "@mantine/modals";
import { TFunction } from "i18next";

function openCreate(t: TFunction<"translation", undefined, "translation">) {
    modals.openContextModal({
        modal: "createGame",
        title: t("index.createDialog.title"),
        innerProps: {},
    });
}

export function IndexPage() {
    const { user } = useSession();
    const api = useAPI();
    const { t } = useTranslation();
    return (
        <div className="container">
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
                            ? () => openCreate(t)
                            : () =>
                                  modals.openContextModal({
                                      modal: "login",
                                      title: t("layout.auth.formLogin.title"),
                                      innerProps: {
                                          after: () => openCreate(t),
                                      },
                                  })
                    }
                >
                    {t("index.actions.create")}
                </Button>
            </Group>
        </div>
    );
}
