#!/bin/sh

cd /

pip install --no-cache-dir -r requirements.txt

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgresql -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing command"

python manage.py makemigrations chat_backend authentication
python manage.py migrate

python -u manage.py runserver 0.0.0.0:8000 