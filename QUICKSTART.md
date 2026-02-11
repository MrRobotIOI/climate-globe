# Climate Globe - Quick Start Guide (Full-Stack)

## 🚀 Two Ways to Run

### Option 1: Manual Setup (Recommended for Development)
### Option 2: Docker Compose (Quick & Easy)

---

## Option 1: Manual Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm & pip

### Step 1: Extract the Project
```bash
tar -xzf climate-globe.tar.gz
cd climate-globe
```

### Step 2: Run the Setup Script
```bash
chmod +x setup-fullstack.sh
./setup-fullstack.sh
```

This installs all dependencies for both frontend and backend!

### Step 3: Start Both Servers

**Terminal 1 - Backend (Python FastAPI)**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```
✅ Backend running at: http://localhost:8000

**Terminal 2 - Frontend (Next.js)**
```bash
# From project root
npm run dev
```
✅ Frontend running at: http://localhost:3000

### Step 4: Open in Browser
Navigate to: **http://localhost:3000**

---

## Option 2: Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Quick Start
```bash
cd climate-globe
docker-compose up
```

That's it! Both services will start automatically:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 🔧 Manual Setup (Detailed)

### Backend Setup
### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# Run the server
python main.py
```

Backend will start at http://localhost:8000

**View API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Setup
```bash
# From project root
npm install

# Run development server
npm run dev
```

Frontend will start at http://localhost:3000

---

## 🎮 Using the App

### Controls
- **Left Click + Drag**: Rotate the globe
- **Scroll**: Zoom in/out
- **Hover**: View details about climate data points

### Data Layers
- **All Data**: Shows both threats and solutions
- **Threats Only**: CO₂ emissions, temperature anomalies, deforestation
- **Defense Only**: Renewables, reforestation, conservation
- **Specific Categories**: Filter by emissions, temperature, renewables, etc.

### Toggles
- **Show Threats**: Turn threat indicators on/off
- **Show Defense**: Turn solution indicators on/off

---

## 📊 What You're Seeing

### Red/Orange Hexagons = Climate Threats
- **CO₂ Emissions**: Major industrial zones and cities
- **Temperature Anomalies**: Areas experiencing record heat
- **Deforestation**: Amazon, Borneo, Congo Basin
- **Sea Level Rise**: Vulnerable coastal regions
- **Ocean Heat**: Record warming zones

### Green Hexagons = Climate Solutions
- **Renewable Energy**: Solar and wind farms
- **Reforestation**: Tree planting projects
- **Conservation**: Protected forest areas
- **Carbon Capture**: Direct air capture facilities

---

## 🏗️ Architecture

```
┌─────────────────┐      REST API      ┌─────────────────┐
│   Frontend      │◄──────────────────►│   Backend       │
│   Next.js       │   HTTP Requests    │   FastAPI       │
│   Port 3000     │                    │   Port 8000     │
└─────────────────┘                    └─────────────────┘
         │                                      │
         │                                      │
    3D Globe                              Climate Data
   Visualization                          Processing
```

**Data Flow:**
1. Frontend loads and displays 3D globe
2. Frontend makes API call to backend: `GET /api/climate/all`
3. Backend returns climate data (threats + defense + stats)
4. Frontend renders data as hexagonal markers on globe
5. User interacts with globe (hover, filter, zoom)

---

## 📡 API Endpoints

The backend provides these REST endpoints:

- `GET /api/health` - Health check
- `GET /api/climate/all` - All climate data
- `GET /api/climate/threats?category=emissions` - Filtered threats
- `GET /api/climate/defense?category=renewable` - Filtered solutions
- `GET /api/climate/stats` - Climate statistics
- `GET /api/climate/summary` - Data summary

Test them at: http://localhost:8000/docs

---

## 🔧 For Development

### Project Structure
```
climate-globe/
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   └── ClimateGlobe.tsx   # Globe component
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts      # Backend API client
│   │   ├── data.ts            # Fallback sample data
│   │   └── types.ts           # TypeScript types
│   └── package.json
├── backend/
│   ├── main.py                # FastAPI app & routes
│   ├── models.py              # Pydantic models
│   ├── services.py            # Data service layer
│   └── requirements.txt       # Python dependencies
```

### Key Files to Modify

**Adding New Data Points** (`backend/services.py`):
```python
# Add to threatData or defenseData in ClimateDataService
ThreatData(
    lat=40.7128, lng=-74.0060,
    value=6.2,
    category=ThreatCategory.EMISSIONS,
    intensity=Intensity.MEDIUM,
    label="New York Metro",
    description="Urban emissions from transport"
)
```

**Creating New API Endpoints** (`backend/main.py`):
```python
@app.get("/api/climate/custom")
async def get_custom_data():
    # Your custom logic here
    return {"data": "your data"}
```

**Updating Frontend API Client** (`lib/api/client.ts`):
```typescript
async getCustomData() {
    const response = await fetch(`${this.baseUrl}/api/climate/custom`);
    return response.json();
}
```

**Styling** (`app/globals.css`, `tailwind.config.js`):
- Modify colors, fonts, layouts
- Update Tailwind theme

**Globe Settings** (`components/ClimateGlobe.tsx`):
- Adjust camera position
- Change rotation speed
- Modify hex altitude/colors

---

## 🌐 Connecting Real APIs

Replace sample data with live sources:

### 1. NASA FIRMS (Fire Data)
```typescript
const fireData = await fetch('https://firms.modaps.eosdis.nasa.gov/api/...')
```

### 2. Global Forest Watch (Deforestation)
```typescript
const forestData = await fetch('https://data-api.globalforestwatch.org/...')
```

### 3. NOAA Climate (Temperature, Ocean)
```typescript
const climateData = await fetch('https://www.ncei.noaa.gov/access/...')
```

---

## 📝 Resume Talking Points

**Technical Skills Demonstrated:**
- **Full-stack development** (Next.js frontend + Python FastAPI backend)
- Next.js 14 with App Router
- TypeScript for type safety
- **Python FastAPI** for REST APIs
- **Pydantic** for data validation
- 3D graphics with Three.js/globe.gl
- Complex state management
- Responsive design with Tailwind CSS
- **RESTful API architecture**
- **Microservices** pattern

**Project Highlights:**
- Built interactive 3D data visualization
- Implemented scientific climate indicators
- Designed **RESTful API** with Python FastAPI
- **Full-stack architecture** (frontend + backend)
- Production-ready code structure
- **Aligns with RBC tech stack** (TypeScript, Python, REST APIs)

**Interview Discussion Topics:**
- "Why I chose FastAPI for the backend" (async, fast, auto-docs)
- "How I structured the data service layer" (separation of concerns)
- "Frontend-backend communication patterns" (REST API, error handling)
- "Performance optimization for rendering hundreds of data points"
- "How this mirrors RBC's microservices architecture"
- "Future enhancement: Kubernetes deployment with horizontal scaling"

**Resume Bullet Point Examples:**
- "Developed full-stack climate data visualization platform with Next.js frontend and Python FastAPI backend, rendering 30+ global data points on interactive 3D globe"
- "Architected RESTful API with FastAPI and Pydantic validation, serving climate threat and solution data with <50ms response times"
- "Built type-safe TypeScript React application integrating with Python microservice using REST APIs and async/await patterns"

---

## 🐛 Troubleshooting

**Backend won't start?**
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall

# Check if port 8000 is in use
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows
```

**Frontend can't connect to backend?**
- Make sure backend is running on port 8000
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Check browser console for CORS errors
- Verify backend health: http://localhost:8000/api/health

**Globe not loading?**
- Check browser console for errors
- Ensure you're running Node 18+
- Try clearing cache and rebuilding

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001  # Use different port
```

**Dependencies won't install?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Build for Production
```bash
npm run build
npm start  # Runs on port 3000
```

---

## 🎯 Next Steps

1. **Test locally** - Make sure everything runs smoothly
2. **Customize data** - Add your own climate data points
3. **Connect APIs** - Integrate real-time data sources
4. **Add features**:
   - Time slider to show historical data
   - Comparison mode (2020 vs 2030)
   - Export data functionality
   - User authentication
5. **Deploy** - Put it live on Vercel
6. **Add to resume** - List under projects with GitHub link

---

## 💡 Enhancement Ideas

- **Animations**: Pulse effects for active threats
- **Arcs**: Show connections between problems and solutions
- **Charts**: Add D3.js charts for detailed stats
- **Mobile**: Optimize touch controls
- **AR Mode**: WebXR for viewing in AR

---

**Questions?** The code is well-commented and structured for easy modification!

Good luck with your resume project! 🚀🌍
