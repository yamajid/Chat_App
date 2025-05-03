FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc libpq-dev && apt-get clean

COPY requirements.txt /app/
RUN pip install --no--cach-dir -r requirements.txt

COPY . /app/

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
