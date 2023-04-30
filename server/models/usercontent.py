from pymongo.database import Database
from .orm import ORM
import os
from typing import TypedDict, Union
from pydantic import BaseModel
import base64

OBJECT_STORAGE_PATH = os.environ.get("OBJECT_STORAGE_PATH", "./content")


class ResourceReference(TypedDict):
    collection: str
    resource: str


class ContentCreateModel(BaseModel):
    filename: str
    mime_type: str
    data: str
    reference: ResourceReference


class ContentMetadata(BaseModel):
    name: str
    mime_type: str
    size: int
    url: str


class UserContent(ORM):
    object_type = "user_content"
    collection_name = "user_content"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        name: str = None,
        ext: str = None,
        reference: Union[ResourceReference, None] = None,
        mime: str = None,
        size: int = 0,
        **kwargs,
    ) -> None:
        super().__init__(id, db, **kwargs)
        self.name = name
        self.ext = ext
        self.reference = reference
        self.mime = mime
        self.size = size
        if not os.path.exists(OBJECT_STORAGE_PATH):
            os.makedirs(OBJECT_STORAGE_PATH)

    @classmethod
    def create(cls, db: Database, content: ContentCreateModel) -> "UserContent":
        new_content = UserContent(
            db=db,
            name=os.path.splitext(content.filename)[0],
            ext=os.path.splitext(content.filename)[1],
            reference=content.reference,
            mime=content.mime_type,
        )
        with open(
            os.path.join(OBJECT_STORAGE_PATH, new_content.id + new_content.ext), "wb"
        ) as destination:
            raw = base64.urlsafe_b64decode(content.data)
            destination.write(raw)

        new_content.size = len(raw)
        new_content.save()
        return new_content

    @property
    def filename(self) -> str:
        return os.path.join(OBJECT_STORAGE_PATH, self.id + self.ext)

    def destroy(self):
        try:
            os.remove(self.filename)
        except:
            pass
        return super().destroy()

    @property
    def metadata(self) -> ContentMetadata:
        return ContentMetadata(
            name=self.name,
            mime_type=self.mime,
            size=self.size,
            url=f"content/{self.id}",
        )
