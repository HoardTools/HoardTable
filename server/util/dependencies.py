from models import ApplicationState, Session
from starlite.datastructures import Headers


def depends_session(app_state: ApplicationState, headers: Headers) -> Session:
    return Session.load_id(app_state.database, headers.get("authorization", None))
