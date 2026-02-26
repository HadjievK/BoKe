"""Database connection management"""
import os
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Connection pool for better performance
pool = None


def init_pool():
    """Initialize the connection pool"""
    global pool
    if pool is None:
        pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL
        )


def get_pool():
    """Get the connection pool, initializing if needed"""
    if pool is None:
        init_pool()
    return pool


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = None
    try:
        conn = get_pool().getconn()
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            get_pool().putconn(conn)


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
