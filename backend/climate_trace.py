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


def _parse_emissions_quantity(asset: dict, gwp_years: int = 100) -> float:
    """Get CO2e emissions in tonnes from EmissionsSummary. gwp_years: 20 or 100 for GWP horizon."""
    gas_key = "co2e_20yr" if gwp_years == 20 else "co2e_100yr"
    for summary in asset.get("EmissionsSummary") or []:
        if summary.get("Gas") == gas_key:
            q = summary.get("EmissionsQuantity")
            return float(q) if q is not None else 0.0
    # Fallback: try the other GWP if primary missing
    other = "co2e_100yr" if gas_key == "co2e_20yr" else "co2e_20yr"
    for summary in asset.get("EmissionsSummary") or []:
        if summary.get("Gas") == other:
            q = summary.get("EmissionsQuantity")
            return float(q) if q is not None else 0.0
    return 0.0


def _asset_to_threat(asset: dict, gwp_years: int = 100) -> ThreatData:
    """Map Climate TRACE asset to our ThreatData (emissions threat)."""
    geom = (asset.get("Centroid") or {}).get("Geometry") or [0, 0]
    lng, lat = float(geom[0]), float(geom[1])
    value = _parse_emissions_quantity(asset, gwp_years)
    # Convert tonnes to Gt for display consistency (optional: keep in t for big numbers)
    value_gt = value / 1e9 if value >= 1e9 else value / 1e6  # Gt or Mt
    sector = (asset.get("Sector") or "other").replace("-", " ")
    name = (asset.get("Name") or "Asset").strip() or f"Source ({sector})"
    intensity = Intensity.HIGH if value_gt >= 1 else (Intensity.MEDIUM if value_gt >= 0.01 else Intensity.LOW)
    gwp_label = f"{gwp_years}yr"
    return ThreatData(
        lat=lat,
        lng=lng,
        value=value_gt,
        type="threat",
        category=ThreatCategory.EMISSIONS,
        intensity=intensity,
        label=name[:200],
        description=f"{sector} • {value:,.0f} t CO2e {gwp_label}",
        sector=asset.get("Sector") or "other",
    )


def fetch_trace_assets(limit: int = PAGE_SIZE, offset: int = 0, year: Optional[int] = None) -> dict:
    """One page of assets from Climate TRACE API. year: optional filter (e.g. 2021-2024); may be ignored by API."""
    params: dict = {"limit": limit, "offset": offset}
    if year is not None:
        params["year"] = year
    with httpx.Client(timeout=30.0) as client:
        try:
            r = client.get(f"{TRACE_API_BASE}/assets", params=params)
            r.raise_for_status()
            return r.json()
        except Exception:
            if year is not None:
                params.pop("year", None)
                r = client.get(f"{TRACE_API_BASE}/assets", params=params)
                r.raise_for_status()
                return r.json()
            raise


def stream_trace_chunks(
    max_points: int = 16_500,
    chunk_size: int = PAGE_SIZE,
    year: Optional[int] = None,
    gwp_years: int = 100,
):
    """Yield chunks of ThreatData as we fetch from Climate TRACE API (for progressive loading)."""
    offset = 0
    while offset < max_points:
        try:
            data = fetch_trace_assets(limit=chunk_size, offset=offset, year=year)
            assets = data.get("assets") or []
            if not assets:
                break
            chunk: List[ThreatData] = []
            for asset in assets:
                try:
                    centroid = (asset.get("Centroid") or {}).get("Geometry")
                    if not centroid or len(centroid) < 2:
                        continue
                    chunk.append(_asset_to_threat(asset, gwp_years))
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


def get_trace_threats(
    max_points: int = DEFAULT_MAX_POINTS,
    year: Optional[int] = None,
    gwp_years: int = 100,
) -> List[ThreatData]:
    """
    Fetch up to max_points emissions sources from Climate TRACE and return as ThreatData.
    year: optional (e.g. 2021-2024). gwp_years: 20 or 100 for CO2e 20yr/100yr GWP.
    Uses in-memory cache for CACHE_TTL_SEC to avoid hammering the API.
    """
    global _cache
    cache_key = (max_points, year, gwp_years)
    now = time.time()
    if (
        _cache is not None
        and (now - _cache["ts"]) < CACHE_TTL_SEC
        and _cache.get("cache_key") == cache_key
    ):
        return _cache["threats"][:max_points]

    threats: List[ThreatData] = []
    offset = 0
    while len(threats) < max_points:
        try:
            data = fetch_trace_assets(limit=PAGE_SIZE, offset=offset, year=year)
            assets = data.get("assets") or []
            if not assets:
                break
            for asset in assets:
                try:
                    centroid = (asset.get("Centroid") or {}).get("Geometry")
                    if not centroid or len(centroid) < 2:
                        continue
                    t = _asset_to_threat(asset, gwp_years)
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

    _cache = {"threats": threats, "ts": now, "cache_key": cache_key}
    return threats


def get_climate_stats_placeholder() -> ClimateStats:
    """Stats when using Climate TRACE (we don't have global stats from API here)."""
    return ClimateStats(
        global_temperature="+1.24°C above pre-industrial",
        co2_concentration="422.5 ppm",
        renewable_percentage="34.3% of electricity",
        emissions_avoided="2.6 Gt CO₂/year",
    )
