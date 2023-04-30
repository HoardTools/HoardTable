import { ContextModalProps } from "@mantine/modals";
import { useAPI } from "../../util/api";
import { useSession } from "../../util/session";
import { useState } from "react";
import { TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";

export function UserSettingsDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { get, post } = useAPI();
    const { user, session, setUser } = useSession();
    const [username, setUsername] = useState<string>("");
    const { t } = useTranslation();

    return (
        <>
            <TextInput
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                label={t("layout.user.editor.username")}
            />
        </>
    );
}
