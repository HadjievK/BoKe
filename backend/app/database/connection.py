"""Database connection management - Optimized for serverless"""
import os
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


@contextmanager
def get_db():
    """
    Context manager for database connections

    Opens a new connection for each request (serverless-friendly).
    Using Supabase connection pooler (port 6543) which handles pooling.
    """
    conn = None
    try:
        # Direct connection - Supabase pooler handles connection reuse
        conn = psycopg2.connect(
            DATABASE_URL,
            connect_timeout=10,
            options='-c statement_timeout=30000'  # 30 second timeout
        )
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()  # Close immediately in serverless


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
