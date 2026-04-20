#!/bin/bash
echo "Starting server on port ${PORT:-8080}"
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}