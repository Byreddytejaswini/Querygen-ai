import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            city TEXT NOT NULL,
            age INTEGER NOT NULL
        )
    ''')

    # Check if already has data
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]

    if count == 0:
        dummy_data = [
            ("Alice",   "alice@email.com",   "Delhi",     25),
            ("Bob",     "bob@email.com",     "Mumbai",    30),
            ("Charlie", "charlie@email.com", "Delhi",     25),
            ("Diana",   "diana@email.com",   "Hyderabad", 28),
            ("Eve",     "eve@email.com",     "Chennai",   22),
            ("Frank",   "frank@email.com",   "Bangalore", 35),
            ("Grace",   "grace@email.com",   "Delhi",     30),
            ("Hank",    "hank@email.com",    "Mumbai",    25),
            ("Ivy",     "ivy@email.com",     "Hyderabad", 21),
            ("Jack",    "jack@email.com",    "Chennai",   40),
            ("Karen",   "karen@email.com",   "Delhi",     18),
            ("Leo",     "leo@email.com",     "Bangalore", 25),
            ("Mia",     "mia@email.com",     "Mumbai",    33),
            ("Nick",    "nick@email.com",    "Delhi",     27),
            ("Olivia",  "olivia@email.com",  "Hyderabad", 30),
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, city, age) VALUES (?, ?, ?, ?)",
            dummy_data
        )
        print("✅ Dummy data inserted")

    conn.commit()
    conn.close()
    print("✅ SQLite DB ready")

def execute_sql(sql: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return {"columns": [], "rows": [], "count": 0}

        columns = list(rows[0].keys())
        data = [dict(row) for row in rows]

        return {
            "columns": columns,
            "rows": data,
            "count": len(data)
        }
    except Exception as e:
        return {"error": str(e), "columns": [], "rows": [], "count": 0}