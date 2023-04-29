from typing import TypedDict, Literal
from starlite import State
from pymongo.database import Database
from pymongo import MongoClient


class AccessKey(TypedDict):
    id: str
    user_type: Literal["user", "session"]
    expires: float


class ApplicationState(State):
    database: Database
    mongo_client: MongoClient
