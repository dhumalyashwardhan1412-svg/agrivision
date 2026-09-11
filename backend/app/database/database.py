from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def apply_migrations():
    try:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            existing_cols = [c["name"] for c in inspector.get_columns("users")]
            with engine.begin() as conn:
                if "status" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'"))
                if "warning_count" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN warning_count INTEGER DEFAULT 0"))
                if "suspension_until" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN suspension_until DATETIME"))
                if "blocked_at" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN blocked_at DATETIME"))
                if "blocked_reason" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN blocked_reason TEXT"))
                if "preferred_language" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'"))
    except Exception as e:
        print(f"Migration check: {e}")
