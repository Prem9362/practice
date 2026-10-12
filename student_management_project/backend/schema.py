from pydantic import BaseModel, Field


class Student(BaseModel):
    """Request body for adding a student; includes the roll number."""
    roll: int = Field(gt=0)
    name: str = Field(min_length=1)
    marks: float = Field(ge=0, le=100)
    adress: str = Field(min_length=1)
    placed: bool


class StudentUpdate(BaseModel):
    """Request body for updating a student; roll is supplied in the URL."""
    name: str = Field(min_length=1)
    marks: float = Field(ge=0, le=100)
    adress: str = Field(min_length=1)
    placed: bool
