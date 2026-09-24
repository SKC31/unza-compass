"""
Seed script for UNZA Compass.

Run with:
    python seed.py

What it does:
1. Creates all database tables if they don't exist.
2. Creates (or updates the password of) the single admin account, using
   ADMIN_EMAIL / ADMIN_PASSWORD from the environment.
3. Loads knowledge base entries from the JSON files in ../knowledge/
   (skips items that already exist, matched by title, so it's safe to re-run).

This module is also imported by main.py to run the same seeding logic
automatically on app startup (see run_seed() below) — useful on hosts like
Render's free tier where shell access isn't available to run this manually.
"""
import json
import os

from auth import hash_password
from config import settings
from database import Base, engine, SessionLocal
from models import AdminUser, KnowledgeItem

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")


def seed_admin(db):
    existing = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_EMAIL).first()
    if existing:
        existing.hashed_password = hash_password(settings.ADMIN_PASSWORD)
        db.commit()
        print(f"✓ Admin account updated: {settings.ADMIN_EMAIL}")
    else:
        admin = AdminUser(
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
        )
        db.add(admin)
        db.commit()
        print(f"✓ Admin account created: {settings.ADMIN_EMAIL}")


def seed_knowledge(db):
    if not os.path.isdir(KNOWLEDGE_DIR):
        print(f"⚠ Knowledge directory not found at {KNOWLEDGE_DIR}, skipping.")
        return

    existing_titles = {item.title for item in db.query(KnowledgeItem).all()}
    added = 0

    for filename in sorted(os.listdir(KNOWLEDGE_DIR)):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(KNOWLEDGE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            entries = json.load(f)

        for entry in entries:
            if entry["title"] in existing_titles:
                continue

            item = KnowledgeItem(
                title=entry["title"],
                category=entry["category"],
                content=entry["content"],
                keywords=",".join(entry.get("keywords", [])),
                source=entry.get("source", ""),
            )
            db.add(item)
            existing_titles.add(entry["title"])
            added += 1

    db.commit()
    print(f"✓ Knowledge base seeded: {added} new items added")


def run_seed():
    """
    Runs the full seed process: create tables, seed admin, seed knowledge.
    Safe to call repeatedly (admin password is reset to env value each time,
    knowledge items are matched by title and never duplicated).
    Used both by the CLI entrypoint below and by main.py on startup.
    """
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_admin(db)
        seed_knowledge(db)
    finally:
        db.close()


def main():
    print("Setting up UNZA Compass database...")
    run_seed()
    print("\nDone. Start the backend with: uvicorn main:app --reload")


if __name__ == "__main__":
    main()