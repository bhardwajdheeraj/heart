# 🐳 Docker Deployment Guide

This project includes Docker support for reliable deployment across platforms.

## 📋 Prerequisites

- Docker installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (usually included with Docker Desktop)

## 🚀 Local Testing with Docker

### Step 1: Build the Image
```bash
docker build -t heart-backend .
```

### Step 2: Create `.env` file in `back/` folder
```bash
GROQ_API_KEY=your_groq_api_key
JWT_SECRET_KEY=your_jwt_secret_key
MONGO_URI=your_mongodb_uri
```

### Step 3: Run with Docker Compose
```bash
docker-compose up --build
```

Visit: `http://localhost:5000`

### Step 4: Test API
```bash
curl http://localhost:5000/
# Should return: HeartSense API Running
```

---

## 🌍 Deploy on Render with Docker

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Add Docker support for deployment"
git push origin main
```

### Step 2: Create Web Service on Render
1. Go to https://render.com
2. Click **"New Web Service"**
3. Select your GitHub repo (`bhardwajdheeraj/heart`)

### Step 3: Configure
- **Name:** `heart-backend`
- **Environment:** `Docker`
- **Build Command:** Leave empty
- **Start Command:** Leave empty

### Step 4: Environment Variables
Add in **Environment** section:
```
GROQ_API_KEY=your_key
JWT_SECRET_KEY=your_secret
MONGO_URI=your_mongodb_uri
ENVIRONMENT=production
FLASK_ENV=production
```

### Step 5: Deploy
Click **"Create Web Service"**

---

## 📊 Docker Deployment Advantages

✅ Works on any platform (Windows, Mac, Linux)  
✅ No dependency conflicts  
✅ Same environment locally and in production  
✅ Faster deployment  
✅ Reliable builds  

---

## 🐛 Troubleshooting

### Image won't build
```bash
docker build -t heart-backend --no-cache .
```

### Port already in use
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Container crashes
```bash
# View logs
docker-compose logs -f backend

# Rebuild and restart
docker-compose up --build --force-recreate
```

---

## 📝 Files Included

- `Dockerfile` - Container image definition
- `.dockerignore` - Files to exclude from image
- `docker-compose.yml` - Local development setup
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version specification

---

## ✅ Expected Output

```
heart-backend     | [2026-04-19 14:00:00 +0000] [1] [INFO] Starting gunicorn 23.0.0
heart-backend     | [2026-04-19 14:00:00 +0000] [1] [INFO] Listening at: http://0.0.0.0:5000
heart-backend     | [2026-04-19 14:00:05 +0000] [8] [INFO] Booting worker with pid: 8
```

Backend is now ready at: `http://localhost:5000` or `https://heart-backend.onrender.com`
