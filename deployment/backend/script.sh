
cd app

pip install --no-cache-dir -r requirements.txt

python manage.py makemigrations chat_backend
python manage.py migrate


python -u manage.py runserver 0.0.0.0:8000 