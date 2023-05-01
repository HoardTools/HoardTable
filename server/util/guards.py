from starlite import ASGIConnection, BaseRouteHandler, NotAuthorizedException
from models import Session


def guard_session(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    if not "authorization" in connection.headers.keys():
        raise NotAuthorizedException(detail="Valid session token required")
    db = connection.app.state.database
    session: Session = Session.load_id(db, connection.headers.get("authorization", ""))
    if not session:
        raise NotAuthorizedException(detail="Valid session token required")
    if session.expired:
        raise NotAuthorizedException(detail="Valid session token required")


def guard_logged_in(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    try:
        session: Session = Session.load_id(
            connection.app.state.database, connection.headers.get("authorization", "")
        )
        if not session.user_id:
            raise NotAuthorizedException(detail="Must be logged in")
    except:
        raise NotAuthorizedException(detail="Must be logged in")
