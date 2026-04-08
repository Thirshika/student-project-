"""
TalentAtlas Backend — FastAPI entry point.
Run with: python run.py
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import init_db, UPLOAD_DIR
from app.routes import auth, students, hr, admin

app = FastAPI(title="TalentAtlas API", version="1.0.0")

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Register routes
from app.routes import auth, students, hr, admin, jobs
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(hr.router)
app.include_router(admin.router)
app.include_router(jobs.router)
from app.routes import challenges
app.include_router(challenges.router)


@app.get("/")
def root():
    return {"message": "TalentAtlas API is running!", "version": "1.0.0"}


@app.on_event("startup")
def startup():
    init_db()
    print("Database initialized.")


if __name__ == "__main__":
    uvicorn.run("run:app", host="127.0.0.1", port=8000, reload=True)
