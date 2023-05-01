import { ContextModalProps } from "@mantine/modals";
import { useAPI } from "../../util/api";
import { useSession } from "../../util/session";
import { useMemo, useState } from "react";
import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
    HoardDropzone,
    SerialFile,
    submitUserContent,
} from "../HoardDropzone/HoardDropzone";
import { UserData } from "../../types/auth";
import { MdCancel, MdCheck, MdError } from "react-icons/md";
import { notifications } from "@mantine/notifications";

export function UserSettingsDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { get, put } = useAPI();
    const { user, session, setUser } = useSession();
    const [username, setUsername] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<SerialFile | null>(
        null
    );
    const { t } = useTranslation();

    useMemo(() => {
        if (!user) {
            context.closeModal(id);
            return;
        }

        get<UserData>("auth/user").then((result) => {
            if (result.success) {
                setUsername(result.result.username);
                setProfilePicture(
                    result.result.profile_picture
                        ? {
                              name: result.result.id,
                              mimeType: "usercontent",
                              data: result.result.profile_picture,
                          }
                        : null
                );
            } else {
                context.closeModal(id);
            }
        });
    }, []);

    return (
        <Stack spacing={"sm"}>
            <TextInput
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                label={t("layout.user.editor.username")}
            />
            <HoardDropzone
                maxFiles={1}
                preview
                files={
                    profilePicture
                        ? { [profilePicture.name]: profilePicture }
                        : {}
                }
                onChange={(files) => setProfilePicture(Object.values(files)[0])}
                label={t("layout.user.editor.profile") ?? undefined}
            />
            <Group spacing={"sm"} position="right">
                <Button
                    variant="subtle"
                    leftIcon={<MdCancel size={18} />}
                    onClick={() => context.closeModal(id)}
                >
                    {t("generic.cancel")}
                </Button>
                <Button
                    variant="filled"
                    leftIcon={<MdCheck size={18} />}
                    disabled={username.length === 0}
                    onClick={() => {
                        if (
                            profilePicture &&
                            profilePicture.mimeType !== "usercontent"
                        ) {
                            submitUserContent(profilePicture, {
                                collection: "users",
                                resource: (user as UserData).id,
                            }).then((url) => {
                                put<UserData>("auth/user/settings", {
                                    body: {
                                        username,
                                        profile: url,
                                    },
                                }).then((result) => {
                                    if (result.success) {
                                        context.closeModal(id);
                                        setUser(result.result);
                                    } else {
                                        notifications.show({
                                            title: t("generic.error"),
                                            message: t(
                                                "layout.user.editor.failure"
                                            ),
                                            icon: <MdError />,
                                            color: "red",
                                        });
                                    }
                                });
                            });
                        } else {
                            put<UserData>("auth/user/settings", {
                                body: {
                                    username,
                                    profile: null,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    context.closeModal(id);
                                    setUser(result.result);
                                } else {
                                    notifications.show({
                                        title: t("generic.error"),
                                        message: t(
                                            "layout.user.editor.failure"
                                        ),
                                        icon: <MdError />,
                                        color: "red",
                                    });
                                }
                            });
                        }
                    }}
                >
                    {t("generic.submit")}
                </Button>
            </Group>
        </Stack>
    );
}
