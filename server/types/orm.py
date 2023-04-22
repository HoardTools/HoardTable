from pymongo.collection import Collection
from pymongo.database import Database

EXCLUDE_UNIVERSAL = ["collection"]


class ORM:
    object_type: str = None
    collection_name: str = None
    exclude: list[str] = []

    def __init__(self, id: str = "", db: Database = None) -> None:
        self.id = id
        if db and self.collection_name:
            self.collection: Collection = db[self.collection_name]
        else:
            self.collection: Collection = None

    def _iter_nested_list(self, lst: list):
        result = []
        for i in lst:
            if type(i) == list:
                result.append(self._iter_nested_list(i))
            elif type(i) == dict:
                result.append(self._iter_nested_dict(i))
            elif issubclass(i, ORM):
                result.append(i.as_dict)
            else:
                result.append(i)
        return result

    def _iter_nested_dict(self, dct: dict):
        result = {}
        for k, v in dct.items():
            if type(v) == list:
                result[k] = self._iter_nested_list(v)
            elif type(v) == dict:
                result[k] = self._iter_nested_dict(v)
            elif issubclass(v, ORM):
                result[k] = v.as_dict
            else:
                result[k] = v
        return result

    @property
    def as_dict(self) -> dict:
        filtered = {
            k: v
            for k, v in self.__dict__.items()
            if not k in EXCLUDE_UNIVERSAL and not k in self.exclude
        }
        return self._iter_nested_dict(filtered)

    @classmethod
    def from_dict(cls, data: dict, db: Database = None):
        return cls(db=db, **data)

    @classmethod
    def load_query(cls, db: Database, query: dict) -> list:
        collection: Collection = db[cls.collection_name]
        result = [cls.from_dict(i, db=db) for i in collection.find(query)]
        return result

    @classmethod
    def load_id(cls, db: Database, id: str):
        result = cls.load_query(db, {"id": id})
        if len(result) > 0:
            return result[0]
        return None

    def save(self):
        if not self.collection:
            raise RuntimeError("No database specified")
        self.collection.replace_one({"id": self.id}, self.as_dict, upsert=True)
