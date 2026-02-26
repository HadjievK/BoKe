"""Database connection management - SERVERLESS VERSION
Use this for Vercel deployment (no connection pooling)
"""
import os
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# For serverless, use the connection string with PgBouncer
# Get this from Supabase: Settings > Database > Connection Pooling
DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Get a new database connection (no pooling for serverless)"""
    return psycopg2.connect(DATABASE_URL)


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = None
    try:
        conn = get_connection()
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()


def execute_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = False):
    """Execute a query and return results"""
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params or ())

            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                # For INSERT/UPDATE/DELETE, return affected rows
                return cursor.rowcount


def execute_many(query: str, params_list: list):
    """Execute a query multiple times with different parameters"""
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount
