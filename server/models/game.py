from pymongo.database import Database
from .orm import ORM
from typing import Literal, TypedDict
from security import password_gen
from secrets import token_urlsafe
from pydantic import BaseModel

GAME_RESOURCES = Literal["map", "document", "token"]


class SerializedPlayer(BaseModel):
    id: str
    name: str
    owner: str
    owner_type: Literal["user", "session"]


class Player(ORM):
    object_type = "player"
    collection_name = "players"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        key: str = None,
        owner_type: Literal["user", "session"] = "user",
        owner_id: str = None,
        name: str = None,
        **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.key = key
        self.owner_type = owner_type
        self.owner_id = owner_id
        self.name = name

    @classmethod
    def create(
        cls,
        db: Database,
        owner_type: Literal["user", "session"],
        owner_id: str,
        name: str,
    ) -> tuple["Player", str]:
        raw_key = token_urlsafe(32)
        return (
            Player(
                db=db,
                key=password_gen(raw_key),
                owner_type=owner_type,
                owner_id=owner_id,
                name=name,
            ),
            raw_key,
        )

    def verify(self, key: str) -> bool:
        return password_gen(key) == self.key

    @property
    def data(self):
        return SerializedPlayer(
            id=self.id, name=self.name, owner=self.owner_id, owner_type=self.owner_type
        )


class GameInvite(ORM):
    object_type = "game_invite"
    collection_name = "invites"

    def __init__(
        self, id: str = None, db: Database = None, game_id: str = None, **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.game_id = game_id

    @classmethod
    def create(cls, db: Database, game: str) -> "GameInvite":
        return GameInvite(id=token_urlsafe(8), db=db, game_id=game)


class Game(ORM):
    object_type = "game"
    collection_name = "games"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        name: str = None,
        image: str = None,
        owner: str = None,
        resources: dict[str, GAME_RESOURCES] = {},
        password_hash: str = None,
        players: list[str] = [],
        **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.name = name
        self.image = image
        self.owner = owner
        self.resources = resources
        self.password_hash = password_hash
        self.players = players

    @classmethod
    def create(
        cls, db: Database, name: str, owner: str, password: str = None
    ) -> "Game":
        return Game(
            db=db,
            name=name,
            owner=owner,
            password_hash=password_gen(password) if password else None,
        )
