from pymongo.database import Database
from .orm import ORM
from .misc import AccessKey
from typing import Literal

GAME_RESOURCES = Literal["map", "document", "token"]


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
        access: list[AccessKey] = [],
        resources: dict[str, GAME_RESOURCES] = {},
        **kwargs
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.name = name
        self.image = image
        self.owner = owner
        self.access = access
        self.resources = resources
