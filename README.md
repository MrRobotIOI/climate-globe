# Climate Globe - 3D Climate Data Visualization

An interactive 3D globe visualization showing global climate threats and solutions, built with **Next.js 14**, **TypeScript**, **globe.gl**, and **Python FastAPI** backend.

## 🌍 Features

- **Interactive 3D Globe** - Rotate, zoom, and explore climate data worldwide
- **Climate Threats** - Visualize CO₂ emissions, temperature anomalies, deforestation, sea-level rise, and ocean heat
- **Climate Solutions** - See renewable energy projects, reforestation efforts, conservation zones, and carbon capture
- **Real-time Filtering** - Toggle between different data layers and categories
- **Scientific Data** - Based on IPCC indicators and validated climate research
- **Full-Stack Architecture** - Next.js frontend + Python FastAPI backend

## 🚀 Getting Started

This is a **full-stack application** with separate frontend and backend servers.

### Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- npm or yarn package manager
- pip (Python package manager)

### Quick Start (Both Servers)

#### Terminal 1 - Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs at: **http://localhost:8000**

#### Terminal 2 - Frontend (Next.js)
```bash
# From project root
npm install
npm run dev
```
Frontend runs at: **http://localhost:3000**

### Detailed Setup

#### 1. Backend Setup (Python)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The FastAPI backend will start at http://localhost:8000

**View API Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 2. Frontend Setup (Next.js)

```bash
# From project root
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

The Next.js frontend will start at http://localhost:3000

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **globe.gl** - 3D globe visualization (built on Three.js)
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D graphics rendering

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **HTTPX** - Async HTTP client

## 📡 API Architecture

The frontend communicates with the backend via REST API:

```
Frontend (Next.js)  <-->  Backend API (FastAPI)  <-->  Data Sources
   Port 3000              Port 8000                     (Future: Real APIs)
```

**API Endpoints:**
- `GET /api/climate/all` - All climate data
- `GET /api/climate/threats` - Threat indicators
- `GET /api/climate/defense` - Solution data
- `GET /api/climate/stats` - Climate statistics

See `backend/README.md` for complete API documentation.

## 📊 Data Sources

Current implementation uses sample data structured to match real climate datasets:

- **Threat Data**: CO₂ emissions, temperature anomalies, deforestation zones, sea-level vulnerability, ocean heat
- **Defense Data**: Renewable energy capacity, reforestation projects, conservation zones, carbon capture facilities

### Integrating Real APIs

To connect real-time data, you can integrate these APIs:

1. **NASA FIRMS** - Active fire data
   - API: https://firms.modaps.eosdis.nasa.gov/api/

2. **Global Forest Watch** - Deforestation and reforestation data
   - API: https://www.globalforestwatch.org/

3. **NOAA Climate Data** - Temperature, ocean heat, sea level
   - API: https://www.ncei.noaa.gov/access

4. **IEA Energy Data** - Renewable energy statistics
   - API: https://www.iea.org/data-and-statistics

## 🎯 For Your Resume

This project demonstrates:

✅ **Full-stack development** (Next.js + Python FastAPI)  
✅ Modern React patterns (Next.js 14 App Router, TypeScript)  
✅ **RESTful API design** (FastAPI with Pydantic validation)  
✅ 3D data visualization and graphics programming  
✅ Complex state management and filtering  
✅ **Microservices architecture** ready for containerization  
✅ Production-ready code structure  
✅ Climate tech domain knowledge  

**Aligns perfectly with your RBC experience:**
- Python FastAPI backend (like your ML/data services)
- TypeScript React frontend (like your meeting intelligence platform)
- REST API architecture (like your encryption service APIs)
- Microservice-ready structure (Docker/Kubernetes compatible)

### Enhancement Ideas

- Connect real-time APIs for live data (NASA FIRMS, Global Forest Watch)
- Add time-series animation (show data over years)
- Implement WebSocket for real-time updates
- Add data export functionality (CSV, JSON)
- Create comparison views (present vs. future projections)
- Build admin dashboard for data management
- Add user authentication (JWT tokens, like your RBC work)
- Deploy with Docker + Kubernetes
- Add Redis caching layer
- Implement Kafka for event streaming

## 📁 Project Structure

```
climate-globe/
├── frontend (Next.js)
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── ClimateGlobe.tsx # Main globe component
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts    # Backend API client
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── data.ts          # Fallback data (if backend down)
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── backend/ (Python FastAPI)
│   ├── main.py              # FastAPI application & routes
│   ├── models.py            # Pydantic data models
│   ├── services.py          # Business logic & data service
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment configuration
│   └── README.md            # Backend documentation
└── README.md                # This file
```

## 🔧 Development

### Building for Production

```bash
npm run build
npm start
```

