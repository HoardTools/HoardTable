from starlite import State
from pymongo.database import Database
from pymongo import MongoClient


class ApplicationState(State):
    database: Database
    mongo_client: MongoClient
