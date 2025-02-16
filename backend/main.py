from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Session, create_engine, select
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, echo=True)

# Initialize app
app = FastAPI()

# Database Model
class InstagramAccount(SQLModel, table=True):
    id: int | None = None
    username: str
    password: str  # Encrypt this later!

# Dependency for DB session
def get_db():
    with Session(engine) as session:
        yield session

# Routes
@app.get("/accounts")
def get_accounts(db: Session = Depends(get_db)):
    return db.exec(select(InstagramAccount)).all()

@app.post("/accounts")
def add_account(account: InstagramAccount, db: Session = Depends(get_db)):
    db.add(account)
    db.commit()
    return {"message": "Account added!"}
