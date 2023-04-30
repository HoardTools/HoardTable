from starlite import Controller, get, post, Provide
from starlite.exceptions import *
from starlite.datastructures import Headers
from pydantic import BaseModel
from models import ApplicationState, Session, User
from util import guard_session, depends_session
from typing import Union


class SessionResponseModel(BaseModel):
    id: str
    logged_in: bool
    expires: float


class UserDataModel(BaseModel):
    id: str
    username: str
    profile_picture: Union[str, None]


class UserRequestModel(BaseModel):
    username: str
    password: str


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


class UserController(Controller):
    path = "/auth/user"
    guards = [guard_session]
    dependencies = {"session": Provide(depends_session)}

    @post("/create")
    async def create_user(
        self, session: Session, app_state: ApplicationState, data: UserRequestModel
    ) -> UserDataModel:
        exists = (
            len(User.load_query(app_state.database, {"username": data.username})) > 0
        )
        if exists:
            raise MethodNotAllowedException(detail="User exists")
        new_user = User.create(app_state.database, data.username, data.password)
        new_user.save()
        session.login(data.username, data.password)
        return UserDataModel(
            id=new_user.id,
            username=new_user.username,
            profile_picture=new_user.profile_picture,
        )
