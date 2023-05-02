from .orm import ORM
from pymongo.database import Database
from typing import Union
from time import time
from security import password_gen

SESSION_EXPIRE = 3600 * 96


class Session(ORM):
    object_type = "session"
    collection_name = "sessions"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        user_id: Union[None, str] = None,
        expires: float = 0,
        **kwargs
    ) -> None:
        super().__init__(id, db)
        self.user_id = user_id
        self.expires = expires

    @property
    def expired(self):
        return time() > self.expires

    @classmethod
    def create(cls, db: Database):
        return cls(db=db, expires=time() + SESSION_EXPIRE)

    def login(self, username: str, password: str) -> "User":
        result: list[User] = User.load_query(self.db, {"username": username})
        if len(result) == 1:
            if result[0].verify(password):
                self.user_id = result[0].id
                self.save()
                return result[0]
        return None

    def logout(self):
        self.user_id = None
        self.save()

    def refresh(self):
        self.expires = time() + SESSION_EXPIRE
        self.save()

    @property
    def user(self):
        if self.user_id:
            return User.load_id(self.db, self.user_id)
        return None


class User(ORM):
    object_type = "user"
    collection_name = "users"

    def __init__(
        self,
        id: str = None,
        db: Database = None,
        username: str = "User",
        password_hash: str = None,
        profile_picture: str = None,
        **kwargs
    ) -> None:
        super().__init__(id, db)
        self.username = username
        self.password_hash = password_hash
        self.profile_picture = profile_picture

    @classmethod
    def create(cls, db: Database, username: str, password: str):
        return cls(
            db=db,
            username=username,
            password_hash=password_gen(password),
        )

    def verify(self, password: str):
        return password_gen(password) == self.password_hash
