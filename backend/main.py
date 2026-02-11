"""
Climate Globe FastAPI Backend
Provides RESTful API endpoints for climate data visualization
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional, List
import json
import os
import uvicorn

from models import (
    ClimateDataResponse, ThreatData, DefenseData, ClimateStats,
    ThreatCategory, DefenseCategory
)
from services import climate_service
from climate_trace import get_trace_threats, get_climate_stats_placeholder, stream_trace_chunks


# Initialize FastAPI app
app = FastAPI(
    title="Climate Globe API",
    description="REST API for global greenhouse gas emissions data (Climate TRACE)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access (local + production URL from env)
_cors_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Climate Globe API",
        "version": "1.0.0"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "data_loaded": True,
        "threat_count": len(climate_service.threat_data),
        "defense_count": len(climate_service.defense_data)
    }


@app.get("/api/climate/all", response_model=ClimateDataResponse, tags=["Climate Data"])
async def get_all_climate_data(
    dense: bool = Query(False, description="If true, return a dense global grid of points for a fuller globe")
):
    """
    Get climate data (emissions and statistics). Primary data source is /api/climate/trace for greenhouse gas emissions.
    
    Use ?dense=true for a dense grid of sample points that populate the whole globe.
    """
    try:
        data = climate_service.get_all_data(dense=dense)
        return ClimateDataResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch climate data: {str(e)}")


@app.get("/api/climate/trace", response_model=ClimateDataResponse, tags=["Climate Data"])
async def get_climate_trace(
    max_points: int = Query(16_500, ge=1_000, le=100_000, description="Emissions sources to fetch from Climate TRACE (2.7M+ available)"),
    year: Optional[int] = Query(2024, ge=2015, le=2024, description="Emissions year (2015-2024)"),
    gwp_years: int = Query(100, description="GWP horizon: 100 or 20 years for CO2e"),
):
    """
    Get emissions data from Climate TRACE (millions of real sources).
    Data: https://climatetrace.org/data (CC BY 4.0). First call may take a minute; result is cached 1 hour.
    """
    if gwp_years not in (20, 100):
        gwp_years = 100
    try:
        threats = get_trace_threats(max_points=max_points, year=year, gwp_years=gwp_years)
        stats = get_climate_stats_placeholder()
        return ClimateDataResponse(
            threats=threats,
            defense=[],  # Climate TRACE is emissions only; use /api/climate/all for defense layers
            stats=stats,
            total_threats=len(threats),
            total_defense=0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Climate TRACE data: {str(e)}")


@app.get("/api/climate/trace/stream", tags=["Climate Data"])
async def stream_climate_trace(
    max_points: int = Query(16_500, ge=5_000, le=100_000, description="Total sources to stream"),
    year: Optional[int] = Query(2024, ge=2015, le=2024, description="Emissions year"),
    gwp_years: int = Query(100, description="GWP horizon: 100 or 20 years"),
):
    """
    Stream emissions data from Climate TRACE in chunks so the globe can load progressively.
    Returns NDJSON: one JSON array of source objects per line.
    """
    if gwp_years not in (20, 100):
        gwp_years = 100

    def gen():
        for chunk in stream_trace_chunks(max_points=max_points, year=year, gwp_years=gwp_years):
            line = json.dumps([p.model_dump() for p in chunk], default=str) + "\n"
            yield line.encode("utf-8")

    return StreamingResponse(
        gen(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/climate/threats", response_model=List[ThreatData], tags=["Climate Data"])
async def get_threats(
    category: Optional[ThreatCategory] = Query(
        None, 
        description="Filter threats by category (emissions, temperature, deforestation, sea-level, ocean-heat)"
    )
):
    """
    Get climate threat data
    
    Optional filtering by category:
    - emissions: CO2 emission hotspots
    - temperature: Temperature anomalies
    - deforestation: Forest loss zones
    - sea-level: Coastal vulnerability
    - ocean-heat: Ocean warming areas
    """
    try:
        threats = climate_service.get_threats(category)
        return threats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch threat data: {str(e)}")


@app.get("/api/climate/defense", response_model=List[DefenseData], tags=["Climate Data"])
async def get_defense(
    category: Optional[DefenseCategory] = Query(
        None,
        description="Filter by category"
    )
):
    """
    Legacy endpoint (project focuses on emissions via /api/climate/trace).
    
    Optional filtering by category:
    - renewable: Solar and wind energy projects
    - reforestation: Tree planting initiatives
    - conservation: Protected forest areas
    - carbon-capture: Direct air capture facilities
    """
    try:
        defense = climate_service.get_defense(category)
        return defense
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch defense data: {str(e)}")


@app.get("/api/climate/stats", response_model=ClimateStats, tags=["Climate Data"])
async def get_climate_stats():
    """
    Get current global climate statistics
    
    Returns key indicators:
    - Global temperature anomaly
    - Atmospheric CO2 concentration
    - Renewable energy percentage
    - Emissions avoided by clean energy
    """
    try:
        return climate_service._get_climate_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch climate stats: {str(e)}")


@app.get("/api/climate/summary", tags=["Climate Data"])
async def get_data_summary():
    """
    Get summary statistics about available data
    
    Useful for understanding dataset composition
    """
    threats = climate_service.threat_data
    defense = climate_service.defense_data
    
    threat_by_category = {}
    for threat in threats:
        category = threat.category.value
        threat_by_category[category] = threat_by_category.get(category, 0) + 1
    
    defense_by_category = {}
    for def_item in defense:
        category = def_item.category.value
        defense_by_category[category] = defense_by_category.get(category, 0) + 1
    
    return {
        "total_threats": len(threats),
        "total_defense": len(defense),
        "threats_by_category": threat_by_category,
        "defense_by_category": defense_by_category,
        "coverage": {
            "continents": ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"],
            "countries": 20
        }
    }


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
