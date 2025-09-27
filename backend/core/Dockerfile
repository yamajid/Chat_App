FROM    python:3.11-slim

WORKDIR /app

# Install system dependencies including PostgreSQL client
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY    .  /

RUN     chmod +x /script.sh

EXPOSE  8000

CMD    ["sh", "/script.sh"]