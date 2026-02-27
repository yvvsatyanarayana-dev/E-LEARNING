from fastapi import FastAPI
from Core.Config import settings
from Core.Database import engine, Base

app = FastAPI()
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": f"{settings.DATABASE_URL} is connected successfully!"}