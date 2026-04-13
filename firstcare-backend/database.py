from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings

# engine = create_engine(
#     settings.database_url,
#     pool_pre_ping=True,      # reconnect on stale connections
#     pool_size=5,
#     pool_recycle=3600,
#     max_overflow=10,

# )
# connect_args only for SQLite
engine = create_engine(
    settings.database_url, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
