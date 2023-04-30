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
