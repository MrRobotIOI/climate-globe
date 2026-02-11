"""
Data service for climate information.
In production, this would fetch from real APIs like NASA FIRMS, Global Forest Watch, etc.
"""

import random
from typing import List, Optional, Tuple
from models import (
    ThreatData, DefenseData, ClimateStats, 
    ThreatCategory, DefenseCategory, Intensity
)

# Reproducible dense grid
random.seed(42)


class ClimateDataService:
    """Service for fetching and processing climate data"""
    
    def __init__(self):
        # In production, these would be API clients
        self.threat_data = self._load_threat_data()
        self.defense_data = self._load_defense_data()
    
    def _load_threat_data(self) -> List[ThreatData]:
        """Load threat data - would fetch from external APIs in production"""
        return [
            # CO2 Emissions Hotspots
            ThreatData(
                lat=39.9042, lng=116.4074, value=10.0,
                category=ThreatCategory.EMISSIONS, intensity=Intensity.HIGH,
                label="Beijing Industrial Zone",
                description="Major CO2 emissions from coal power and industry - 10 Gt CO2/year"
            ),
            ThreatData(
                lat=31.2304, lng=121.4737, value=8.5,
                category=ThreatCategory.EMISSIONS, intensity=Intensity.HIGH,
                label="Shanghai Manufacturing",
                description="Industrial emissions hotspot - 8.5 Gt CO2/year"
            ),
            ThreatData(
                lat=40.7128, lng=-74.0060, value=6.2,
                category=ThreatCategory.EMISSIONS, intensity=Intensity.MEDIUM,
                label="New York Metro",
                description="Urban emissions from transport and energy - 6.2 Gt CO2/year"
            ),
            ThreatData(
                lat=28.7041, lng=77.1025, value=7.8,
                category=ThreatCategory.EMISSIONS, intensity=Intensity.HIGH,
                label="Delhi NCR",
                description="Rapidly growing emissions from development - 7.8 Gt CO2/year"
            ),
            ThreatData(
                lat=51.5074, lng=-0.1278, value=4.5,
                category=ThreatCategory.EMISSIONS, intensity=Intensity.MEDIUM,
                label="London",
                description="Urban center emissions - 4.5 Gt CO2/year"
            ),
            
            # Temperature Anomalies
            ThreatData(
                lat=33.4484, lng=-112.0740, value=2.1,
                category=ThreatCategory.TEMPERATURE, intensity=Intensity.HIGH,
                label="Phoenix Heat Zone",
                description="+2.1°C above baseline - record heatwaves"
            ),
            ThreatData(
                lat=-23.5505, lng=-46.6333, value=1.8,
                category=ThreatCategory.TEMPERATURE, intensity=Intensity.HIGH,
                label="São Paulo",
                description="+1.8°C temperature anomaly affecting 770M people"
            ),
            ThreatData(
                lat=25.2048, lng=55.2708, value=2.4,
                category=ThreatCategory.TEMPERATURE, intensity=Intensity.HIGH,
                label="Dubai",
                description="+2.4°C extreme heat anomaly"
            ),
            
            # Deforestation Zones
            ThreatData(
                lat=-3.4653, lng=-62.2159, value=9.5,
                category=ThreatCategory.DEFORESTATION, intensity=Intensity.HIGH,
                label="Amazon Basin",
                description="Critical deforestation zone - 9.5M hectares lost"
            ),
            ThreatData(
                lat=-1.8312, lng=109.9758, value=6.8,
                category=ThreatCategory.DEFORESTATION, intensity=Intensity.HIGH,
                label="Borneo Rainforest",
                description="Palm oil deforestation - 6.8M hectares affected"
            ),
            ThreatData(
                lat=-0.7893, lng=113.9213, value=5.2,
                category=ThreatCategory.DEFORESTATION, intensity=Intensity.MEDIUM,
                label="Indonesian Islands",
                description="Ongoing deforestation - 5.2M hectares"
            ),
            ThreatData(
                lat=-2.6, lng=23.6, value=7.1,
                category=ThreatCategory.DEFORESTATION, intensity=Intensity.HIGH,
                label="Congo Basin",
                description="Secondary rainforest loss - 7.1M hectares"
            ),
            
            # Sea Level Rise
            ThreatData(
                lat=23.8103, lng=90.4125, value=1.5,
                category=ThreatCategory.SEA_LEVEL, intensity=Intensity.HIGH,
                label="Dhaka Bangladesh",
                description="Critical sea level rise vulnerability - 1.5m projected"
            ),
            ThreatData(
                lat=25.7617, lng=-80.1918, value=1.2,
                category=ThreatCategory.SEA_LEVEL, intensity=Intensity.HIGH,
                label="Miami",
                description="Coastal flooding risk - 1.2m rise projected"
            ),
            ThreatData(
                lat=1.3521, lng=103.8198, value=0.9,
                category=ThreatCategory.SEA_LEVEL, intensity=Intensity.MEDIUM,
                label="Singapore",
                description="Island nation at risk - 0.9m sea level rise"
            ),
            
            # Ocean Heat
            ThreatData(
                lat=8.7832, lng=-79.5199, value=8.9,
                category=ThreatCategory.OCEAN_HEAT, intensity=Intensity.HIGH,
                label="Panama Pacific",
                description="Record ocean heat - 9 consecutive years of records"
            ),
            ThreatData(
                lat=-18.2871, lng=147.6992, value=9.2,
                category=ThreatCategory.OCEAN_HEAT, intensity=Intensity.HIGH,
                label="Great Barrier Reef",
                description="Coral bleaching from ocean heat - critical"
            ),
        ]
    
    def _load_defense_data(self) -> List[DefenseData]:
        """Load defense data - would fetch from external APIs in production"""
        return [
            # Renewable Energy - Solar
            DefenseData(
                lat=27.1767, lng=78.0081, value=15000, capacity=15000,
                category=DefenseCategory.RENEWABLE,
                label="Bhadla Solar Park, India",
                description="World's largest solar park - 15,000 MW capacity"
            ),
            DefenseData(
                lat=37.0902, lng=-95.7129, value=12500, capacity=12500,
                category=DefenseCategory.RENEWABLE,
                label="US Solar Belt",
                description="Combined solar capacity - 12,500 MW avoiding 2.6 Gt CO2/year"
            ),
            DefenseData(
                lat=39.9139, lng=116.3917, value=18000, capacity=18000,
                category=DefenseCategory.RENEWABLE,
                label="China Solar Array",
                description="Leading solar deployment - 18,000 MW"
            ),
            
            # Renewable Energy - Wind
            DefenseData(
                lat=54.5260, lng=15.2551, value=8500, capacity=8500,
                category=DefenseCategory.RENEWABLE,
                label="Baltic Sea Wind Farm",
                description="Offshore wind power - 8,500 MW, EU renewable leader"
            ),
            DefenseData(
                lat=51.1657, lng=10.4515, value=9200, capacity=9200,
                category=DefenseCategory.RENEWABLE,
                label="German Wind Network",
                description="Combined wind capacity - 9,200 MW"
            ),
            DefenseData(
                lat=41.8781, lng=-87.6298, value=7800, capacity=7800,
                category=DefenseCategory.RENEWABLE,
                label="US Midwest Wind",
                description="Central plains wind farms - 7,800 MW"
            ),
            
            # Reforestation
            DefenseData(
                lat=-3.4653, lng=-62.2159, value=50000, capacity=50000,
                category=DefenseCategory.REFORESTATION,
                label="Amazon Restoration Initiative",
                description="50,000 hectares reforestation - sequestering 2B tons CO2 annually"
            ),
            DefenseData(
                lat=40.1824, lng=94.5965, value=66000, capacity=66000,
                category=DefenseCategory.REFORESTATION,
                label="China Great Green Wall",
                description="Massive reforestation - 66,000 hectares, 31.4B tons CO2 potential"
            ),
            DefenseData(
                lat=12.8797, lng=121.7740, value=25000, capacity=25000,
                category=DefenseCategory.REFORESTATION,
                label="Philippines Forest Recovery",
                description="25,000 hectares restoration project"
            ),
            DefenseData(
                lat=9.1450, lng=40.4897, value=35000, capacity=35000,
                category=DefenseCategory.REFORESTATION,
                label="Ethiopian Green Legacy",
                description="35,000 hectares planted - carbon sequestration project"
            ),
            
            # Conservation
            DefenseData(
                lat=-2.6, lng=23.6, value=80000, capacity=80000,
                category=DefenseCategory.CONSERVATION,
                label="Congo Rainforest Reserve",
                description="80,000 hectares protected - critical carbon sink"
            ),
            DefenseData(
                lat=-14.2350, lng=-51.9253, value=120000, capacity=120000,
                category=DefenseCategory.CONSERVATION,
                label="Brazil Protected Areas",
                description="120,000 hectares conservation zone"
            ),
            DefenseData(
                lat=61.5240, lng=105.3188, value=95000, capacity=95000,
                category=DefenseCategory.CONSERVATION,
                label="Siberian Forest Protection",
                description="95,000 hectares preserved boreal forest"
            ),
            
            # Carbon Capture
            DefenseData(
                lat=64.9631, lng=-19.0208, value=4000, capacity=4000,
                category=DefenseCategory.CARBON_CAPTURE,
                label="Iceland Carbfix",
                description="Direct air capture - 4,000 tons CO2/year"
            ),
            DefenseData(
                lat=59.3293, lng=18.0686, value=36000, capacity=36000,
                category=DefenseCategory.CARBON_CAPTURE,
                label="Nordic Carbon Storage",
                description="Underground CO2 storage - 36,000 tons/year"
            ),
        ]
    
    def _generate_dense_grid(self) -> Tuple[List[ThreatData], List[DefenseData]]:
        """Generate a dense global grid of sample points so the globe looks populated."""
        threat_cats = list(ThreatCategory)
        defense_cats = list(DefenseCategory)
        intensities = list(Intensity)
        threats_out: List[ThreatData] = []
        defense_out: List[DefenseData] = []
        # Fine grid so the globe looks dense (Climate TRACE has millions of sources).
        # 2° lat x 3° lng ≈ 60×120 = 7200 points per layer → 14k+ total, many visible hex bins.
        lat_step, lng_step = 2, 3
        i = 0
        for lat in range(-60, 61, lat_step):
            for lng in range(-180, 181, lng_step):
                # Small jitter so nearby points don't collapse into identical hex bins
                lat_j = lat + random.uniform(-0.4, 0.4)
                lng_j = lng + random.uniform(-0.5, 0.5)
                cat_t = threat_cats[i % len(threat_cats)]
                cat_d = defense_cats[i % len(defense_cats)]
                intensity = intensities[i % len(intensities)]
                # Alternate threat vs defense per cell so both layers are dense
                threats_out.append(ThreatData(
                    lat=lat_j, lng=lng_j, value=round(random.uniform(0.5, 10.0), 1),
                    category=cat_t, intensity=intensity,
                    label=f"Regional {cat_t.value}",
                    description=f"Sample {cat_t.value} indicator at {lat_j:.1f}°, {lng_j:.1f}°"
                ))
                defense_out.append(DefenseData(
                    lat=lat_j + random.uniform(-0.8, 0.8), lng=lng_j + random.uniform(-0.8, 0.8),
                    value=random.randint(1000, 100000), capacity=random.randint(1000, 100000),
                    category=cat_d,
                    label=f"Regional {cat_d.value}",
                    description=f"Sample {cat_d.value} at this region"
                ))
                i += 1
        return threats_out, defense_out

    def get_all_data(self, dense: bool = False) -> dict:
        """Get all climate data. If dense=True, returns a global grid of sample points."""
        if dense:
            threats, defense = self._generate_dense_grid()
            return {
                "threats": threats,
                "defense": defense,
                "stats": self._get_climate_stats(),
                "total_threats": len(threats),
                "total_defense": len(defense),
            }
        return {
            "threats": self.threat_data,
            "defense": self.defense_data,
            "stats": self._get_climate_stats(),
            "total_threats": len(self.threat_data),
            "total_defense": len(self.defense_data)
        }
    
    def get_threats(self, category: Optional[ThreatCategory] = None) -> List[ThreatData]:
        """Get threat data, optionally filtered by category"""
        if category:
            return [t for t in self.threat_data if t.category == category]
        return self.threat_data
    
    def get_defense(self, category: Optional[DefenseCategory] = None) -> List[DefenseData]:
        """Get defense data, optionally filtered by category"""
        if category:
            return [d for d in self.defense_data if d.category == category]
        return self.defense_data
    
    def _get_climate_stats(self) -> ClimateStats:
        """Get current climate statistics"""
        return ClimateStats(
            global_temperature="+1.24°C above pre-industrial",
            co2_concentration="422.5 ppm (50% ↑)",
            renewable_percentage="34.3% of electricity",
            emissions_avoided="2.6 Gt CO₂/year"
        )


# Singleton instance
climate_service = ClimateDataService()
