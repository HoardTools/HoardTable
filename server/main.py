from starlite import Starlite, State, Provide
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from models import ApplicationState
from controllers import *

load_dotenv()


def on_start(app_state: State) -> None:
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    MONGO_DATABASE = os.environ.get("MONGO_DATABASE", "hoard_table")

    client = MongoClient(MONGO_URL)
    app_state.mongo_client = client
    app_state.database = client[MONGO_DATABASE]


def provide_app_state(state: State) -> ApplicationState:
    return state


app = Starlite(
    [SessionController],
    on_startup=[on_start],
    dependencies={"app_state": Provide(provide_app_state)},
)
