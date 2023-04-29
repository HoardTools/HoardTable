from starlite import Controller, get, post
from starlite.datastructures import Headers
from pydantic import BaseModel
from models import ApplicationState, Session


class SessionResponseModel(BaseModel):
    id: str
    logged_in: bool
    expires: float


class SessionController(Controller):
    path = "/auth/session"

    @get("")
    async def get_session(
        self, headers: Headers, app_state: ApplicationState
    ) -> SessionResponseModel:
        session: Session = Session.load_id(
            app_state.database, headers.get("authorization", None)
        )
        if session:
            if session.expired:
                session = Session.create(app_state.database)
        else:
            session = Session.create(app_state.database)
        session.refresh()
        return SessionResponseModel(
            id=session.id, logged_in=bool(session.user_id), expires=session.expires
        )
