"""Script to initialize database schema"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("🔧 Connecting to database...")
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

print("📄 Reading schema file...")
with open("app/database/schema.sql", "r", encoding="utf-8") as f:
    schema_sql = f.read()

print("🚀 Executing schema...")
cursor.execute(schema_sql)
conn.commit()

print("✅ Database schema created successfully!")
print("📊 Verifying tables...")

cursor.execute("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
""")

tables = cursor.fetchall()
print(f"\n✅ Created {len(tables)} tables:")
for table in tables:
    print(f"   - {table[0]}")

cursor.close()
conn.close()

print("\n🎉 Database setup complete!")
