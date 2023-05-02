from starlite import Controller, post, get, Provide
from util import depends_session, depends_user, guard_logged_in, guard_session
from models import Game, GameInvite, Player, User, Session, ApplicationState, SparseGame
from pydantic import BaseModel
from typing import Optional


class GameCreateModel(BaseModel):
    name: str
    image: Optional[str] = None
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
        new_game.image = data.image
        new_game.save()
        return new_game.sparse
