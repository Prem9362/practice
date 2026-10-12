STUDENT MANAGEMENT PROJECT (FastAPI + HTML + CSS + JavaScript)
===============================================================

IMPORTANT: The frontend and backend run at TWO different addresses.

1) Extract this ZIP.
2) Open the extracted student_management_project folder in VS Code.

START THE BACKEND
-----------------
Open a VS Code terminal and run these commands:

    cd backend
    python -m pip install fastapi uvicorn
    python -m uvicorn main:app --reload

Keep this terminal open. Check that this works:
    http://127.0.0.1:8000/

Swagger API docs:
    http://127.0.0.1:8000/docs

START THE FRONTEND
------------------
Open a SECOND terminal in VS Code (leave the backend running) and run:

    cd frontend
    python -m http.server 5500

Then open this exact address in your browser:
    http://127.0.0.1:5500/

This built-in server avoids needing the VS Code Live Server extension.
Do NOT open http://127.0.0.1:8000/ expecting the dashboard; that address returns API JSON.

API OPERATIONS
--------------
GET    /                         list all students
GET    /get_student_record/{roll} get one student
POST   /add_student              add a student
PUT    /update_student/{roll}    update a student
DELETE /delete_student/{roll}    delete a student

NOTES
-----
- Student data is stored in backend/student_data.json.
- The API schema uses `adress` (one 'd' after a) for compatibility with this project's existing fields.
- Roll numbers must be unique.
- If port 8000 or 5500 is already in use, close the other server or use a free port and update the API/CORS settings accordingly.
