# Climate Globe Backend API

FastAPI backend service providing climate threat and solution data.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --port 8000
```

Server runs at: **http://localhost:8000**

### 3. View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /api/health` - Detailed health status

### Climate Data
- `GET /api/climate/all` - Get all data (threats + defense + stats)
- `GET /api/climate/threats?category={category}` - Get threat data
- `GET /api/climate/defense?category={category}` - Get solution data
- `GET /api/climate/stats` - Get climate statistics
- `GET /api/climate/summary` - Get data summary

### Query Parameters

**Threat Categories:**
- `emissions` - CO₂ emission hotspots
- `temperature` - Temperature anomalies
- `deforestation` - Forest loss zones
- `sea-level` - Coastal vulnerability
- `ocean-heat` - Ocean warming areas

**Defense Categories:**
- `renewable` - Solar and wind projects
- `reforestation` - Tree planting initiatives
- `conservation` - Protected areas
- `carbon-capture` - Carbon capture facilities

## 📝 Example Requests

### Get All Data
```bash
curl http://localhost:8000/api/climate/all
```

### Get Only Emissions Threats
```bash
curl http://localhost:8000/api/climate/threats?category=emissions
```

### Get Renewable Energy Projects
```bash
curl http://localhost:8000/api/climate/defense?category=renewable
```

## 🏗️ Architecture

```
backend/
├── main.py           # FastAPI application & routes
├── models.py         # Pydantic data models
├── services.py       # Business logic & data service
├── requirements.txt  # Python dependencies
└── .env.example      # Environment configuration
```

## 🔧 Tech Stack

- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **HTTPX** - Async HTTP client (for future API integration)

## 🌐 CORS Configuration

The API allows requests from:
- `http://localhost:3000` (Next.js default)
- `http://localhost:3001` (Alternate port)

To modify CORS settings, edit the `CORSMiddleware` in `main.py`.

## 🔌 Connecting Real APIs

Currently uses sample data. To integrate real climate data:

### 1. NASA FIRMS (Fire Data)
```python
import httpx

async def fetch_fire_data():
    api_key = os.getenv("NASA_FIRMS_API_KEY")
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{api_key}/VIIRS_SNPP_NRT/world/1"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return parse_fire_data(response.text)
```

### 2. Global Forest Watch
```python
async def fetch_deforestation_data():
    api_key = os.getenv("GFW_API_KEY")
    url = "https://data-api.globalforestwatch.org/dataset/..."
    # Implement GFW API integration
```

### 3. NOAA Climate Data
```python
async def fetch_climate_stats():
    url = "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series"
    # Implement NOAA API integration
```

## 🧪 Testing

### Manual Testing
Use the interactive API docs at http://localhost:8000/docs

### Python Testing
```python
import httpx

async def test_api():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/api/climate/all")
        print(response.json())
```

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and Run
```bash
docker build -t climate-globe-backend .
docker run -p 8000:8000 climate-globe-backend
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📊 Data Models

### ThreatData
```python
{
  "lat": 39.9042,
  "lng": 116.4074,
  "value": 10.0,
  "type": "threat",
  "category": "emissions",
  "intensity": "high",
  "label": "Beijing Industrial Zone",
  "description": "Major CO2 emissions..."
}
```

### DefenseData
```python
{
  "lat": 27.1767,
  "lng": 78.0081,
  "value": 15000,
  "type": "defense",
  "category": "renewable",
  "capacity": 15000,
  "label": "Bhadla Solar Park",
  "description": "World's largest solar park..."
}
```

## 🔐 Security Notes

- Add API key authentication for production
- Implement rate limiting
- Use HTTPS in production
- Validate all input data
- Add logging and monitoring

## 📈 Performance

- Uses async/await for non-blocking operations
- Ready for horizontal scaling
- In-memory data caching
- Future: Add Redis for distributed caching

## 🤝 Contributing

This backend mirrors the architecture you'd use at RBC:
- FastAPI for REST APIs
- Pydantic for data validation
- Microservice-ready structure
- Easy to integrate with Kubernetes/Docker
