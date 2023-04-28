from typing import TypedDict, Literal


class AccessKey(TypedDict):
    id: str
    user_type: Literal["user", "session"]
    expires: float
