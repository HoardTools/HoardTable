import { Button, Group } from "@mantine/core";
import { useAPI } from "../../util/api";
import { useSession } from "../../util/session";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { modals } from "@mantine/modals";

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
                            ? console.log
                            : () =>
                                  modals.openContextModal({
                                      modal: "login",
                                      title: t("layout.auth.formLogin.title"),
                                      innerProps: {
                                          after: () => console.log(),
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
