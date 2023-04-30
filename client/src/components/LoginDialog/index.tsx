import { ContextModalProps, modals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MdCheckCircle, MdEmail, MdError, MdLock } from "react-icons/md";
import "./style.scss";
import { useAPI } from "../../util/api";
import { UserData } from "../../types/auth";
import { notifications } from "@mantine/notifications";
import { useSession } from "../../util/session";

export function LoginDialog({
    context,
    id,
    innerProps,
}: ContextModalProps<{}>) {
    const { t } = useTranslation();
    const { post } = useAPI();
    const { setUser } = useSession();
    const loginForm = useForm({
        initialValues: {
            username: "",
            password: "",
        },
    });

    return (
        <form
            className="form form-login"
            onSubmit={loginForm.onSubmit((values) =>
                post<UserData>("auth/session/login", {
                    body: {
                        username: values.username,
                        password: values.password,
                    },
                }).then((result) => {
                    if (result.success) {
                        setUser(result.result);
                        notifications.show({
                            title: t("generic.success"),
                            message: t("layout.auth.formLogin.statusSuccess"),
                            color: "green",
                            icon: <MdCheckCircle />,
                        });
                        context.closeModal(id);
                    } else {
                        notifications.show({
                            title: t("generic.error"),
                            message: t("layout.auth.formLogin.statusFailure"),
                            color: "red",
                            icon: <MdError />,
                        });
                        console.error(result);
                    }
                })
            )}
        >
            <Stack spacing={16}>
                <TextInput
                    required
                    variant="filled"
                    label={t("layout.auth.formLogin.username")}
                    icon={<MdEmail />}
                    {...loginForm.getInputProps("username")}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formLogin.password")}
                    icon={<MdLock />}
                    {...loginForm.getInputProps("password")}
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
    const { post } = useAPI();
    const { setUser } = useSession();
    const createForm = useForm({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            confirmPassword: (value, values) =>
                value === values.password
                    ? null
                    : t("errors.layout.createAccount.passwordMatch"),
        },
    });

    return (
        <form
            className="form form-create-account"
            onSubmit={createForm.onSubmit((values) =>
                post<UserData>("auth/user/create", {
                    body: {
                        username: values.username,
                        password: values.password,
                    },
                }).then((result) => {
                    if (result.success) {
                        setUser(result.result);
                        notifications.show({
                            title: t("generic.success"),
                            message: t(
                                "layout.auth.formCreateAccount.statusSuccess"
                            ),
                            color: "green",
                            icon: <MdCheckCircle />,
                        });
                        context.closeModal(id);
                    } else {
                        notifications.show({
                            title: t("generic.error"),
                            message: t(
                                "layout.auth.formCreateAccount.statusFailure"
                            ),
                            color: "red",
                            icon: <MdError />,
                        });
                        console.error(result);
                    }
                })
            )}
        >
            <Stack spacing={16}>
                <TextInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.username")}
                    icon={<MdEmail />}
                    {...createForm.getInputProps("username")}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.password")}
                    icon={<MdLock />}
                    {...createForm.getInputProps("password")}
                />
                <PasswordInput
                    required
                    variant="filled"
                    label={t("layout.auth.formCreateAccount.passwordConfirm")}
                    icon={<MdLock />}
                    {...createForm.getInputProps("confirmPassword")}
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
