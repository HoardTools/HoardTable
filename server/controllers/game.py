from starlite import Controller, post, get, Provide, NotFoundException, NotAuthorizedException
from util import depends_session, depends_user, guard_logged_in, guard_session
from models import (
    Game,
    GameInvite,
    Player,
    User,
    Session,
    ApplicationState,
    SparseGame,
    ContentCreateModel,
    UserContent,
    SerializedPlayer
)
from pydantic import BaseModel
from typing import Optional, Literal


class GameCreateModel(BaseModel):
    name: str
    image: Optional[ContentCreateModel] = None
    password: Optional[str] = None


class GameController(Controller):
    path = "/game"
    guards = [guard_session]
    dependencies = {"session": Provide(depends_session)}

    @post(
        "/create",
        guards=[guard_logged_in],
        dependencies={"user": Provide(depends_user)},
    )
    async def create_game(
        self, app_state: ApplicationState, user: User, data: GameCreateModel
    ) -> SparseGame:
        new_game = Game.create(
            app_state.database, data.name, user.id, password=data.password
        )
        if data.image:
            data.image.reference["resource"] = new_game.id
            new_game.image = UserContent.create(
                app_state.database, data.image
            ).metadata.url
        new_game.save()
        return new_game.sparse

    @get(
        "/owned", guards=[guard_logged_in], dependencies={"user": Provide(depends_user)}
    )
    async def get_owned_games(
        self, app_state: ApplicationState, user: User
    ) -> list[SparseGame]:
        all_games: list[Game] = Game.load_query(app_state.database, {"owner": user.id})
        return [i.sparse for i in all_games]

class PlayerCreateModel(BaseModel):
    owner_type: Literal["user", "session"]
    owner_id: str

class PlayerRefreshModel(BaseModel):
    id: str
    key: str

class PlayerController(Controller):
    path = "/players"
    guards = [guard_session]
    dependencies = {"session": Provide(depends_session)}

    @post("/create")
    async def create_player(self, app_state: ApplicationState, data: PlayerCreateModel) -> tuple[SerializedPlayer, str]:
        new_player, key = Player.create(app_state.database, data.owner_type, data.owner_id)
        new_player.save()
        return [new_player.data, key]
    
    @post("/refresh")
    async def refresh_player(self, app_state: ApplicationState, data: PlayerRefreshModel, session: Session) -> SerializedPlayer:
        loaded: Player = Player.load_id(app_state.database, data.id)
        if loaded == None:
            raise NotFoundException("Could not refresh (ID/Key invalid)")
        if not loaded.verify(data.key):
            raise NotFoundException("Could not refresh (ID/Key invalid)")
        
        if loaded.owner_type == "user" and session.user_id != loaded.owner_id:
            raise NotAuthorizedException("Could not refresh (Player is user-owned, please login)")

        if loaded.owner_type == "session" and session.id != loaded.owner_id:
            loaded.owner_id = session.id
            loaded.save()

        return loaded.data


