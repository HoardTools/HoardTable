import { ContextModalProps } from "@mantine/modals";
import { useAPI } from "../../util/api";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
    HoardDropzone,
    SerialFile,
    getContentModel,
} from "../HoardDropzone/HoardDropzone";
import { useForm } from "@mantine/form";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { MdCheck, MdEdit, MdError, MdLock } from "react-icons/md";
import { SparseGame } from "../../types/game";
import { notifications } from "@mantine/notifications";

export function GameCreateDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { post } = useAPI();
    const { t } = useTranslation();
    const [image, setImage] = useState<SerialFile | null>(null);
    const form = useForm({
        initialValues: {
            name: "",
            password: "",
        },
        validate: {
            name: (value) =>
                value.length > 0
                    ? null
                    : t("errors.input.fillField", {
                          field: t("index.createDialog.name"),
                      }),
        },
    });

    return (
        <form
            onSubmit={form.onSubmit((v) => {
                post<SparseGame>("game/create", {
                    body: {
                        name: form.values["name"],
                        password:
                            form.values["password"].length > 0
                                ? form.values["password"]
                                : undefined,
                        image: image
                            ? getContentModel(image, {
                                  collection: "games",
                                  resource: "",
                              })
                            : undefined,
                    },
                }).then((result) => {
                    if (result.success) {
                        notifications.show({
                            title: t("generic.success") ?? "",
                            color: "green",
                            icon: <MdCheck />,
                            message: t("index.createDialog.success", {
                                name: result.result.name,
                            }),
                        });
                        context.closeModal(id);
                    } else {
                        notifications.show({
                            title: t("generic.error") ?? "",
                            color: "red",
                            icon: <MdError />,
                            message: t("index.createDialog.failure"),
                        });
                    }
                });
            })}
        >
            <Stack spacing={"sm"}>
                <TextInput
                    {...form.getInputProps("name")}
                    withAsterisk
                    icon={<MdEdit />}
                    label={t("index.createDialog.name")}
                />
                <PasswordInput
                    {...form.getInputProps("password")}
                    icon={<MdLock />}
                    label={t("index.createDialog.password")}
                    placeholder={t("generic.optional") ?? ""}
                />
                <HoardDropzone
                    label={t("index.createDialog.image") ?? ""}
                    preview
                    maxFiles={1}
                    files={image ? { [image.name]: image } : {}}
                    onChange={(files) =>
                        setImage(
                            Object.values(files).length > 0
                                ? Object.values(files)[0]
                                : null
                        )
                    }
                />
                <div style={{ marginRight: "0px", marginLeft: "auto" }}>
                    <Button
                        type="submit"
                        leftIcon={<MdCheck size={16} />}
                        fullWidth={false}
                    >
                        {t("generic.submit")}
                    </Button>
                </div>
            </Stack>
        </form>
    );
}
