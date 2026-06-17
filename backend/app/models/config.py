from pydantic import BaseModel


class RuntimeConfigModel(BaseModel):
    key: str
    value: dict
