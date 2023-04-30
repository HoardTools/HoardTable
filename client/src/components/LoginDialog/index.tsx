import { ContextModalProps, modals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MdEmail, MdLock } from "react-icons/md";
import "./style.scss";

export function LoginDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { t } = useTranslation();
    const loginForm = useForm({
        initialValues: {
            username: "",
            password: "",
        },
    });

    return (
        <form
            className="form form-login"
            onSubmit={loginForm.onSubmit(console.log)}
        >
            <Stack spacing={16}>
                <TextInput
                    required
                    variant="filled"
                    label={t("layout.auth.formLogin.username")}
                    icon={<MdEmail />}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formLogin.password")}
                    icon={<MdLock />}
                />
                <Group spacing={8} className="actions" position="right">
                    <Button
                        variant="subtle"
                        onClick={() => {
                            context.closeModal(id);
                            modals.openContextModal({
                                modal: "createAccount",
                                title: t("layout.auth.formCreateAccount.title"),
                                innerProps: {},
                            });
                        }}
                    >
                        {t("layout.auth.formLogin.switch")}
                    </Button>
                    <Button type="submit">
                        {t("layout.auth.formLogin.confirm")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

export function CreateAccountDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { t } = useTranslation();
    const createForm = useForm({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    return (
        <form
            className="form form-create-account"
            onSubmit={createForm.onSubmit(console.log)}
        >
            <Stack spacing={16}>
                <TextInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.username")}
                    icon={<MdEmail />}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.password")}
                    icon={<MdLock />}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.passwordConfirm")}
                    icon={<MdLock />}
                />
                <Group spacing={8} className="actions" position="right">
                    <Button
                        variant="subtle"
                        onClick={() => {
                            context.closeModal(id);
                            modals.openContextModal({
                                modal: "login",
                                title: t("layout.auth.formLogin.title"),
                                innerProps: {},
                            });
                        }}
                    >
                        {t("layout.auth.formCreateAccount.switch")}
                    </Button>
                    <Button type="submit">
                        {t("layout.auth.formCreateAccount.confirm")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
