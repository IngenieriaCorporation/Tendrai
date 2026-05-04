# TendrAI — AI-Powered Tender Management SaaS

**Stack:** FastAPI + MongoDB Atlas + React + Vite  
**Hosting:** Render (backend) + Vercel (frontend)

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in MONGODB_URL and OPENAI_API_KEY
uvicorn app.main:app --reload
# → http://localhost:8000/api/docs
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# → http://localhost:5173
```

---

## Deploy

### 1. MongoDB Atlas (free)
- Create cluster at mongodb.com/atlas
- Add user + allow all IPs (0.0.0.0/0)
- Copy connection string → used in next step

### 2. Render (backend)
- New Web Service → connect GitHub repo
- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars: `MONGODB_URL`, `OPENAI_API_KEY`, `FRONTEND_URL`
- Add Disk: mount `/app/uploads`, 5 GB

### 3. Vercel (frontend)
- New Project → import repo
- Root Directory: `frontend`
- Framework: Vite
- Add env var: `VITE_API_URL` = your Render URL
- Deploy

### 4. Connect CORS
- Go back to Render → set `FRONTEND_URL` = your Vercel URL → redeploy
