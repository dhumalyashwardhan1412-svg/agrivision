from sqlalchemy import inspect, text
from app.database.database import engine

def run_safe_schema_migrations():
    """
    Safely inspects existing database schema and applies any additive column
    migrations without modifying or dropping existing user records.
    """
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
