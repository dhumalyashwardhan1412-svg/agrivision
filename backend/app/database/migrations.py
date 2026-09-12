from sqlalchemy import inspect, text
from app.database.database import engine


def run_safe_schema_migrations():
    """
    Safely inspects the existing database schema and applies
    additive/non-destructive migrations.

    This function:
    - Does not drop tables.
    - Does not delete existing records.
    - Adds missing columns.
    - Expands selected columns when required.
    - Supports PostgreSQL on Render.
    """

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    # Detect database type
    database_dialect = engine.dialect.name

    # PostgreSQL uses TIMESTAMP instead of DATETIME
    datetime_type = "TIMESTAMP" if database_dialect == "postgresql" else "DATETIME"

    # =========================================================
    # USERS TABLE
    # =========================================================

    if "users" in table_names:
        existing_cols = {
            column["name"]
            for column in inspector.get_columns("users")
        }

        with engine.begin() as conn:

            if "status" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'
                        """
                    )
                )

            if "warning_count" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN warning_count INTEGER DEFAULT 0
                        """
                    )
                )

            if "suspension_until" not in existing_cols:
                conn.execute(
                    text(
                        f"""
                        ALTER TABLE users
                        ADD COLUMN suspension_until {datetime_type}
                        """
                    )
                )

            if "blocked_at" not in existing_cols:
                conn.execute(
                    text(
                        f"""
                        ALTER TABLE users
                        ADD COLUMN blocked_at {datetime_type}
                        """
                    )
                )

            if "blocked_reason" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN blocked_reason TEXT
                        """
                    )
                )

            if "preferred_language" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'
                        """
                    )
                )

            if "verification_status" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN verification_status VARCHAR(20)
                        DEFAULT 'VERIFIED'
                        """
                    )
                )

            if "verified_by_id" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN verified_by_id INTEGER
                        """
                    )
                )

            if "verified_at" not in existing_cols:
                conn.execute(
                    text(
                        f"""
                        ALTER TABLE users
                        ADD COLUMN verified_at {datetime_type}
                        """
                    )
                )

            if "verification_notes" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN verification_notes TEXT
                        """
                    )
                )

            if "rejection_reason" not in existing_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN rejection_reason TEXT
                        """
                    )
                )

    # =========================================================
    # SHOP PRODUCTS TABLE
    # =========================================================

    if "shop_products" in table_names:
        shop_cols = {
            column["name"]
            for column in inspector.get_columns("shop_products")
        }

        with engine.begin() as conn:

            if "low_stock_threshold" not in shop_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE shop_products
                        ADD COLUMN low_stock_threshold INTEGER DEFAULT 10
                        """
                    )
                )

    # =========================================================
    # NOTIFICATIONS TABLE
    # =========================================================

    if "notifications" in table_names:
        notif_cols = {
            column["name"]
            for column in inspector.get_columns("notifications")
        }

        with engine.begin() as conn:

            if "user_role" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN user_role VARCHAR(50)
                        """
                    )
                )

            if "notification_type" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN notification_type VARCHAR(100)
                        DEFAULT 'SYSTEM'
                        """
                    )
                )

            if "related_entity_type" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN related_entity_type VARCHAR(100)
                        """
                    )
                )

            if "related_entity_id" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN related_entity_id VARCHAR(100)
                        """
                    )
                )

            if "action_url" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN action_url VARCHAR(255)
                        """
                    )
                )

            if "priority" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN priority VARCHAR(20)
                        DEFAULT 'INFO'
                        """
                    )
                )

            if "event_key" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN event_key VARCHAR(255)
                        """
                    )
                )

            if "metadata_json" not in notif_cols:
                conn.execute(
                    text(
                        """
                        ALTER TABLE notifications
                        ADD COLUMN metadata_json TEXT
                        """
                    )
                )

            if "read_at" not in notif_cols:
                conn.execute(
                    text(
                        f"""
                        ALTER TABLE notifications
                        ADD COLUMN read_at {datetime_type}
                        """
                    )
                )

    # =========================================================
    # SOIL TESTS TABLE
    # Fix PostgreSQL "value too long for VARCHAR(20)"
    # =========================================================

    if "soil_tests" in table_names:

        with engine.begin() as conn:

            if database_dialect == "postgresql":

                # Grade values such as:
                # "Grade A (Prime Fertile)"
                conn.execute(
                    text(
                        """
                        ALTER TABLE soil_tests
                        ALTER COLUMN health_grade TYPE VARCHAR(100)
                        """
                    )
                )

                # NPK descriptions can be much longer than 100 chars
                conn.execute(
                    text(
                        """
                        ALTER TABLE soil_tests
                        ALTER COLUMN npk_status TYPE TEXT
                        """
                    )
                )

                # Laboratory names may also be long
                conn.execute(
                    text(
                        """
                        ALTER TABLE soil_tests
                        ALTER COLUMN lab_name TYPE VARCHAR(255)
                        """
                    )
                )

            else:
                # SQLite does not support ALTER COLUMN TYPE in the
                # same way PostgreSQL does.
                #
                # Existing SQLite VARCHAR lengths are generally not
                # strictly enforced, so no destructive migration
                # is required here.
                pass

    print("Database migrations completed successfully.")