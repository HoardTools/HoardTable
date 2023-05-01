from models import ApplicationState, Session, User
from starlite.datastructures import Headers


def depends_session(app_state: ApplicationState, headers: Headers) -> Session:
    return Session.load_id(app_state.database, headers.get("authorization", None))


def depends_user(app_state: ApplicationState, headers: Headers) -> User:
    session: Session = Session.load_id(
        app_state.database, headers.get("authorization", None)
    )
    return session.user
