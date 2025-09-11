# 💬 Chat App

## Overview
A real-time chat application built with **Django REST Framework** and **React.js**, enabling secure authentication, persistent chat rooms, and instant communication powered by **WebSockets**.  
The app is fully containerized with **Docker Compose** and uses **NGINX** as a reverse proxy.

---

## 🌟 Key Features

### 💬 Chat Features
- **Real-Time Messaging**: Powered by WebSockets for instant communication  
- **Private & Group Chats**: Connect with individuals or multiple users  
- **Persistent Conversations**: Messages are stored in the database  
- **Notifications**: Get notified when new messages arrive  

### 👤 User Features
- **JWT Authentication**: Secure login with refresh tokens  
- **User Registration & Login**: Simple onboarding flow  
- **Profile Management**: Manage account details  
- **Session Handling**: Automatic token refresh for smoother experience  

---

## 🛠 Technology Stack

### Backend Infrastructure
- **Framework**: Django & Django REST Framework  
- **Real-Time**: Django Channels (WebSockets)  
- **Authentication**: JWT (access & refresh tokens)  
- **Database**: PostgreSQL  

### Frontend Development
- **Framework**: React.js + TypeScript  
- **Styling**: Modern CSS / Tailwind 
- **State Management**: React Context 
- **API Communication**: Axios with centralized instance  

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose  
- **Web Server**: NGINX (Reverse Proxy + SSL termination)  
- **Certificates**: Self-signed (dev) / Let’s Encrypt (prod-ready)  

---

## 🚀 Getting Started

### Prerequisites
```bash
# Required installations
- Docker & Docker Compose

### Instalation Steps
git clone https://github.com/yamajid/Chat_App.git
cd Chat_App

# Start the application
make up
```
### The app will be available at::
- 

