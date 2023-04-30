import { Button, Header, Title } from "@mantine/core";
import LogoSvg from "../../assets/icon.svg";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { MdLogin } from "react-icons/md";
import { modals } from "@mantine/modals";

export function LayoutComponent() {
    const { t } = useTranslation();

    return (
        <Header height={48} p="xs" className="app-header">
            <img src={LogoSvg} alt="Logo" className="app-logo" />
            <Title order={3} className="app-name">
                {t("layout.appName")}
            </Title>
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
        </Header>
    );
}
