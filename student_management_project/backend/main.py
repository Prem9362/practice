from pathlib import Path
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    # Works when imported as a package.
    from .schema import Student, StudentUpdate
except ImportError:
    # Works when started directly from the backend folder.
    from schema import Student, StudentUpdate

app = FastAPI(title="Student Management API", version="1.0.0")

# Allow the frontend opened through VS Code Live Server to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "null",  # Allows opening index.html directly as a file during local practice.
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Always locate student_data.json next to this main.py file.
DATA_FILE = Path(__file__).with_name("student_data.json")


def read_students():
    """Read all student records from the JSON file."""
    if not DATA_FILE.exists():
        DATA_FILE.write_text("{}", encoding="utf-8")
    with DATA_FILE.open("r", encoding="utf-8-sig") as file:
        return json.load(file)


def write_students(data):
    """Save all student records to the JSON file."""
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)


@app.get("/")
def index():
    """Get all students."""
    return read_students()


@app.get("/get_student_record/{roll}")
def get_student_record(roll: int):
    """Get one student by roll number."""
    db = read_students()
    student = db.get(str(roll))
    if student is None:
        raise HTTPException(status_code=404, detail=f"Student with roll number {roll} not found")
    return {"roll": roll, **student}


@app.post("/add_student", status_code=201)
def add_student(obj: Student):
    """Add a student. Roll numbers must be unique."""
    db = read_students()
    key = str(obj.roll)
    if key in db:
        raise HTTPException(status_code=409, detail=f"Roll number {obj.roll} already exists")

    db[key] = {
        "Name": obj.name,
        "Marks": obj.marks,
        "Address": obj.adress,
        "Placed": obj.placed,
    }
    write_students(db)
    return {"message": "Student added successfully", "roll": obj.roll, "student": db[key]}


@app.put("/update_student/{roll}")
def update_student(roll: int, obj: StudentUpdate):
    """Update an existing student. The roll number comes from the URL."""
    db = read_students()
    key = str(roll)
    if key not in db:
        raise HTTPException(status_code=404, detail=f"Student with roll number {roll} not found")

    db[key] = {
        "Name": obj.name,
        "Marks": obj.marks,
        "Address": obj.adress,
        "Placed": obj.placed,
    }
    write_students(db)
    return {"message": "Student updated successfully", "roll": roll, "student": db[key]}


@app.delete("/delete_student/{roll}")
def delete_student(roll: int):
    """Delete one student by roll number."""
    db = read_students()
    key = str(roll)
    if key not in db:
        raise HTTPException(status_code=404, detail=f"Student with roll number {roll} not found")

    deleted_student = db.pop(key)
    write_students(db)
    return {"message": "Student deleted successfully", "roll": roll, "student": deleted_student}
