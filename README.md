

```markdown
# 🗨️ Chat_App

A full-stack real-time chat application built with **React (frontend)**, **Django/DRF (backend)**, and **nginx** for reverse proxying. The project is fully containerized with **Docker Compose** for easy development and deployment.

---

## 🚀 Features

- 🔐 User registration and login  
- ⚡ JWT authentication with refresh tokens  
- 💬 Real-time chat via WebSockets  
- 🐳 Dockerized frontend, backend, and nginx  
- 🌐 nginx reverse proxy for `/api/` and `/ws/`  
- 🗄️ Easy local setup using `docker-compose`  

---

## 📂 Project Structure

```

Chat\_App/
├── backend/            # Django REST backend (API, auth, chat)
├── frontend/           # React + TypeScript frontend
├── nginx.conf          # nginx reverse proxy config
├── docker-compose.yml  # Docker Compose definition
├── Dockerfile(s)       # Container definitions
└── README.md

````

---

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)  

---

## ⚡ Quick Start

Clone the repo and bring up the stack:

```bash
git clone https://github.com/yamajid/Chat_App.git
cd Chat_App
docker-compose up --build
````

Then open:

* Frontend → [http://localhost](http://localhost)
* API backend → [http://localhost:8000/api/](http://localhost:8000/api/)
* WebSockets → \[ws\://localhost/ws/]

Stop everything:

```bash
docker-compose down
```

---

## 🔧 Configuration

Environment variables can be set in your `.env` file or passed in `docker-compose.yml`.

| Variable      | Default      | Description       |
| ------------- | ------------ | ----------------- |
| `SECRET_KEY`  | required     | Django secret key |
| `DEBUG`       | `True` (dev) | Django debug mode |
| `DB_HOST`     | `db`         | Database hostname |
| `DB_PORT`     | `5432`       | Database port     |
| `DB_NAME`     | `chatapp`    | Database name     |
| `DB_USER`     | `chatuser`   | Database user     |
| `DB_PASSWORD` | `password`   | Database password |

---

## ⚙️ Development

### Run backend locally

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Run frontend locally

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Update Axios `baseURL` to `http://localhost:8000/api`.

---

## 🌐 nginx Reverse Proxy

The included `nginx.conf` routes:

* `/` → React frontend (Vite)
* `/api/` → Django backend (REST API)
* `/ws/` → Django Channels (WebSocket server)

---

## 🧪 Testing

### Backend tests

```bash
cd backend
pytest
```

### Frontend tests

```bash
cd frontend
npm test
```

---

## 🐳 Deployment

For production:

1. Configure proper environment variables.
2. Replace self-signed SSL with real certificates (e.g. Let’s Encrypt).
3. Run with detached mode:

```bash
docker-compose up -d --build
```

---

## 🚧 Common Issues

* **Mixed Content errors** → Make sure both frontend and backend use the same protocol (`http` or `https`).
* **CORS errors** → Add frontend URL to Django `CORS_ALLOWED_ORIGINS`.
* **Invalid token** → Refresh JWT tokens properly with `/api/user/refresh`.

---

## 📜 License

This project is open-source under the MIT License.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -m 'Add feature foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Open a Pull Request

---

## 👤 Author

Developed by **[Younes Amajid](https://github.com/yamajid)** at 1337 coding school.

```

Do you also want me to include **usage examples with screenshots (like chat UI previews)** inside this README, or keep it purely text-based?
```
