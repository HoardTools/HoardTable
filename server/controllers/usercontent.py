from starlite import Controller, post, get, NotFoundException, File
from models import UserContent, ContentCreateModel, ContentMetadata, ApplicationState
from util import guard_session


class UserContentController(Controller):
    path = "/content"
    guards = [guard_session]

    @post("")
    async def add_content(
        self, app_state: ApplicationState, data: ContentCreateModel
    ) -> ContentMetadata:
        new_content = UserContent.create(app_state.database, data)
        return new_content.metadata

    @get("/{content:str}")
    async def get_content(self, app_state: ApplicationState, content: str) -> File:
        if "." in content:
            content = content.rsplit(".", 1)
        loaded: UserContent = UserContent.load_id(app_state.database, content)
        if loaded == None:
            raise NotFoundException(detail=f"Content {content} does not exist")
        return File(path=loaded.filename, filename=loaded.id + loaded.ext)

    @get("/{content:str}/meta")
    async def get_content_meta(
        self, app_state: ApplicationState, content: str
    ) -> ContentMetadata:
        if "." in content:
            content = content.rsplit(".", 1)
        loaded: UserContent = UserContent.load_id(app_state.database, content)
        if loaded == None:
            raise NotFoundException(detail=f"Content {content} does not exist")
        return loaded.metadata
