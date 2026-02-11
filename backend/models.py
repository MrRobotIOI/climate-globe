from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from enum import Enum


class ThreatCategory(str, Enum):
    EMISSIONS = "emissions"
    TEMPERATURE = "temperature"
    DEFORESTATION = "deforestation"
    SEA_LEVEL = "sea-level"
    OCEAN_HEAT = "ocean-heat"


class DefenseCategory(str, Enum):
    RENEWABLE = "renewable"
    REFORESTATION = "reforestation"
    CONSERVATION = "conservation"
    CARBON_CAPTURE = "carbon-capture"


class Intensity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ThreatData(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    value: float = Field(..., description="Threat intensity value")
    type: Literal["threat"] = "threat"
    category: ThreatCategory
    intensity: Intensity
    label: str = Field(..., description="Display label for the threat")
    description: str = Field(..., description="Detailed description")
    sector: Optional[str] = Field(None, description="Climate TRACE sector (e.g. power, oil-and-gas-production)")


class DefenseData(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    value: float = Field(..., description="Defense capacity value")
    type: Literal["defense"] = "defense"
    category: DefenseCategory
    capacity: float = Field(..., description="Capacity in MW or hectares")
    label: str = Field(..., description="Display label for the solution")
    description: str = Field(..., description="Detailed description")


class ClimateStats(BaseModel):
    global_temperature: str = Field(..., description="Global temperature anomaly")
    co2_concentration: str = Field(..., description="Atmospheric CO2 level")
    renewable_percentage: str = Field(..., description="Renewable energy share")
    emissions_avoided: str = Field(..., description="Emissions avoided by clean energy")


class ClimateDataResponse(BaseModel):
    threats: List[ThreatData]
    defense: List[DefenseData]
    stats: ClimateStats
    total_threats: int
    total_defense: int
