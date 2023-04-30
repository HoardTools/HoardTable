import { Avatar, Button, Header, Loader, Menu, Title } from "@mantine/core";
import LogoSvg from "../../assets/icon.svg";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { MdLogin, MdLogout } from "react-icons/md";
import { modals } from "@mantine/modals";
import { useSession } from "../../util/session";
import { useAPI } from "../../util/api";
import { Outlet } from "react-router-dom";

export function LayoutComponent() {
    const { t } = useTranslation();
    const { session, user, setUser } = useSession();
    const api = useAPI();

    return (
        <div className="layout-root">
            <Header height={48} p="xs" className="app-header">
                <img src={LogoSvg} alt="Logo" className="app-logo" />
                <Title order={3} className="app-name">
                    {t("layout.appName")}
                </Title>
                {session.logged_in ? (
                    user ? (
                        <Menu>
                            <Menu.Target>
                                {user.profile_picture ? (
                                    <Avatar
                                        src={user.profile_picture}
                                        className="user-button"
                                        radius="xl"
                                    />
                                ) : (
                                    <Avatar className="user-button" radius="xl">
                                        {user.username
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </Avatar>
                                )}
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    icon={<MdLogout size={16} />}
                                    onClick={() =>
                                        api
                                            .delete<null>("auth/session/logout")
                                            .then((result) => {
                                                if (result.success) {
                                                    setUser(null);
                                                }
                                            })
                                    }
                                >
                                    {t("layout.user.logout")}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <Loader />
                    )
                ) : (
                    <Button
                        className="auth-btn"
                        leftIcon={<MdLogin size={16} />}
                        onClick={() =>
                            modals.openContextModal({
                                modal: "login",
                                title: t("layout.auth.formLogin.title"),
                                innerProps: {},
                            })
                        }
                    >
                        {t("layout.auth.loginButton")}
                    </Button>
                )}
            </Header>
            <div className="content-root">
                <Outlet />
            </div>
        </div>
    );
}
