#!/bin/bash
echo "Running database migrations..."
alembic upgrade head
echo "Seeding database..."
python -c "from app.seed import seed; seed()"
echo "Starting server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}