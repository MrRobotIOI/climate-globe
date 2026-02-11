"""
Climate TRACE API client.
Fetches millions of emissions sources from https://api.climatetrace.org
Data: CC BY 4.0, https://climatetrace.org/data
"""

import time
from typing import List, Any, Optional
import httpx
from models import ThreatData, ThreatCategory, Intensity, ClimateStats


TRACE_API_BASE = "https://api.climatetrace.org/v6"
# Max assets to fetch (API is paginated; 2.7M+ total available)
DEFAULT_MAX_POINTS = 16_500
PAGE_SIZE = 5000
CACHE_TTL_SEC = 3600  # 1 hour


_cache: Optional[dict] = None


def _parse_emissions_quantity(asset: dict, year: int = 2024) -> float:
    """Get CO2e 100yr emissions in tonnes from EmissionsSummary."""
    for summary in asset.get("EmissionsSummary") or []:
        if summary.get("Gas") == "co2e_100yr":
            q = summary.get("EmissionsQuantity")
            return float(q) if q is not None else 0.0
    return 0.0


def _asset_to_threat(asset: dict) -> ThreatData:
    """Map Climate TRACE asset to our ThreatData (emissions threat)."""
    geom = (asset.get("Centroid") or {}).get("Geometry") or [0, 0]
    lng, lat = float(geom[0]), float(geom[1])
    value = _parse_emissions_quantity(asset)
    # Convert tonnes to Gt for display consistency (optional: keep in t for big numbers)
    value_gt = value / 1e9 if value >= 1e9 else value / 1e6  # Gt or Mt
    sector = (asset.get("Sector") or "other").replace("-", " ")
    name = (asset.get("Name") or "Asset").strip() or f"Source ({sector})"
    intensity = Intensity.HIGH if value_gt >= 1 else (Intensity.MEDIUM if value_gt >= 0.01 else Intensity.LOW)
    return ThreatData(
        lat=lat,
        lng=lng,
        value=value_gt,
        type="threat",
        category=ThreatCategory.EMISSIONS,
        intensity=intensity,
        label=name[:200],
        description=f"{sector} • {value:,.0f} t CO2e 100yr",
        sector=asset.get("Sector") or "other",
    )


def fetch_trace_assets(limit: int = PAGE_SIZE, offset: int = 0) -> dict:
    """One page of assets from Climate TRACE API."""
    with httpx.Client(timeout=30.0) as client:
        r = client.get(f"{TRACE_API_BASE}/assets", params={"limit": limit, "offset": offset})
        r.raise_for_status()
        return r.json()


def stream_trace_chunks(max_points: int = 16_500, chunk_size: int = PAGE_SIZE):
    """Yield chunks of ThreatData as we fetch from Climate TRACE API (for progressive loading)."""
    offset = 0
    while offset < max_points:
        try:
            data = fetch_trace_assets(limit=chunk_size, offset=offset)
            assets = data.get("assets") or []
            if not assets:
                break
            chunk: List[ThreatData] = []
            for asset in assets:
                try:
                    centroid = (asset.get("Centroid") or {}).get("Geometry")
                    if not centroid or len(centroid) < 2:
                        continue
                    chunk.append(_asset_to_threat(asset))
                except Exception:
                    continue
            if chunk:
                yield chunk
            if len(assets) < chunk_size:
                break
            offset += chunk_size
            time.sleep(0.15)
        except Exception:
            break


def get_trace_threats(max_points: int = DEFAULT_MAX_POINTS) -> List[ThreatData]:
    """
    Fetch up to max_points emissions sources from Climate TRACE and return as ThreatData.
    Uses in-memory cache for CACHE_TTL_SEC to avoid hammering the API.
    """
    global _cache
    now = time.time()
    if _cache is not None and (now - _cache["ts"]) < CACHE_TTL_SEC and _cache["max_points"] >= max_points:
        return _cache["threats"][:max_points]

    threats: List[ThreatData] = []
    offset = 0
    while len(threats) < max_points:
        try:
            data = fetch_trace_assets(limit=PAGE_SIZE, offset=offset)
            assets = data.get("assets") or []
            if not assets:
                break
            for asset in assets:
                try:
                    centroid = (asset.get("Centroid") or {}).get("Geometry")
                    if not centroid or len(centroid) < 2:
                        continue
                    t = _asset_to_threat(asset)
                    threats.append(t)
                    if len(threats) >= max_points:
                        break
                except Exception:
                    continue
            if len(assets) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
            time.sleep(0.2)  # be nice to the API
        except Exception:
            break

    _cache = {"threats": threats, "ts": now, "max_points": max_points}
    return threats


def get_climate_stats_placeholder() -> ClimateStats:
    """Stats when using Climate TRACE (we don't have global stats from API here)."""
    return ClimateStats(
        global_temperature="+1.24°C above pre-industrial",
        co2_concentration="422.5 ppm",
        renewable_percentage="34.3% of electricity",
        emissions_avoided="2.6 Gt CO₂/year",
    )
