from pymongo.database import Database
from .orm import ORM
from typing import Literal, Union
from security import password_gen
from secrets import token_urlsafe
from pydantic import BaseModel
import time

GAME_RESOURCES = Literal["map", "document", "token"]


class SerializedPlayer(BaseModel):
    id: str
    owner_id: str
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
        **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.key = key
        self.owner_type = owner_type
        self.owner_id = owner_id

    @classmethod
    def create(
        cls,
        db: Database,
        owner_type: Literal["user", "session"],
        owner_id: str,
    ) -> tuple["Player", str]:
        raw_key = token_urlsafe(32)
        return (
            Player(
                db=db,
                key=password_gen(raw_key),
                owner_type=owner_type,
                owner_id=owner_id,
            ),
            raw_key,
        )

    def verify(self, key: str) -> bool:
        return password_gen(key) == self.key

    @property
    def data(self):
        return SerializedPlayer(
            id=self.id, owner=self.owner_id, owner_type=self.owner_type
        )


class InviteModel(BaseModel):
    id: str
    game_id: str
    remaining_uses: Union[int, None] = None
    valid_until: Union[float, None] = None


class GameInvite(ORM):
    object_type = "game_invite"
    collection_name = "invites"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        game_id: str = None,
        active: bool = False,
        remaining_uses: int = None,
        valid_until: float = None,
        **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.game_id = game_id
        self.active = active
        self.remaining_uses = remaining_uses
        self.valid_until = valid_until

    @classmethod
    def create(
        cls, db: Database, game: str, uses: int = None, expires: float = None
    ) -> "GameInvite":
        return GameInvite(
            id=token_urlsafe(8),
            db=db,
            game_id=game,
            remaining_uses=uses,
            valid_until=expires,
        )

    def activate(self):
        self.active = True
        self.save()

    def verify(self) -> bool:
        if not self.active:
            return False
        if self.remaining_uses != None and self.remaining_uses < 0:
            self.destroy()
            return False
        if self.valid_until != None and self.valid_until < time.time():
            self.destroy()
            return False

        if self.remaining_uses != None:
            self.remaining_uses -= 1
        return True

    @property
    def data(self) -> InviteModel:
        return InviteModel(
            id=self.id,
            game_id=self.game_id,
            remaining_uses=self.remaining_uses,
            valid_until=self.valid_until,
        )


class SparseGame(BaseModel):
    id: str
    name: str
    owner: str
    image: Union[str, None]
    resources: int
    players: int


class FullGame(BaseModel):
    id: str
    name: str
    owner: str
    image: Union[str, None]
    resources: dict[str, GAME_RESOURCES]
    players: list[str]


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

    @property
    def sparse(self) -> SparseGame:
        return SparseGame(
            id=self.id,
            name=self.name,
            owner=self.owner,
            image=self.image,
            resources=len(self.resources.keys()),
            players=len(self.players),
        )

    @property
    def full(self) -> FullGame:
        return FullGame(
            id=self.id,
            name=self.name,
            owner=self.owner,
            image=self.image,
            resources=self.resources,
            players=self.players,
        )
