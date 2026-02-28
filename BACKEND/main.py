from fastapi import FastAPI
from Core.Config import settings
from Core.Database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
Base.metadata.create_all(bind=engine)

origins = [
        'https://localhost:5173/',
        'http://localhost:5173/'
]
app.middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)


@app.get("/")
async def root():
    return {"message": f"{settings.DATABASE_URL} is connected successfully!"}
