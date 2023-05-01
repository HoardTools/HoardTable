from starlite import Controller, get, post, Provide, delete, put
from starlite.exceptions import *
from starlite.datastructures import Headers
from pydantic import BaseModel
from models import ApplicationState, Session, User, UserContent
from util import guard_session, depends_session, guard_logged_in, depends_user
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


class UserSettingsModel(BaseModel):
    username: str
    profile: Union[str, None]


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

    @post(
        "/login",
        guards=[guard_session],
        dependencies={"session": Provide(depends_session)},
    )
    async def login(
        self, session: Session, app_state: ApplicationState, data: UserRequestModel
    ) -> UserDataModel:
        login = session.login(data.username, data.password)
        if login == None:
            raise NotFoundException(detail="Incorrect username/password")
        return UserDataModel(
            id=login.id, username=login.username, profile_picture=login.profile_picture
        )

    @delete(
        "/logout",
        guards=[guard_session],
        dependencies={"session": Provide(depends_session)},
    )
    async def logout(self, session: Session) -> None:
        session.logout()


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

    @get("", guards=[guard_logged_in])
    async def get_user(self, session: Session) -> UserDataModel:
        if session.user_id:
            user: User = session.user
            return UserDataModel(
                id=user.id, username=user.username, profile_picture=user.profile_picture
            )
        raise MethodNotAllowedException(detail="Not logged in")

    @put(
        "/settings",
        guards=[guard_logged_in],
        dependencies={"user": Provide(depends_user)},
    )
    async def modify_user(
        self, user: User, data: UserSettingsModel, app_state: ApplicationState
    ) -> UserDataModel:
        existence_check: list[User] = User.load_query(
            app_state.database, {"username": user.username}
        )
        if len(existence_check) > 0 and existence_check[0].id != user.id:
            temp: UserContent = UserContent.load_id(
                app_state.database, data.profile.split("/")[2]
            )
            if temp:
                temp.destroy()
            raise MethodNotAllowedException(detail="Username in use")

        if data.profile != user.profile_picture and user.profile_picture:
            prev_profile: UserContent = UserContent.load_id(
                app_state.database, user.profile_picture.split("/")[2]
            )
            if prev_profile:
                prev_profile.destroy()

        user.username = data.username
        user.profile_picture = data.profile
        user.save()
        return UserDataModel(
            id=user.id, username=user.username, profile_picture=user.profile_picture
        )
