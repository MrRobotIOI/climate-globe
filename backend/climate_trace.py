"""
Climate TRACE API client (v7).
Fetches ranked emissions sources from https://api.climatetrace.org
Data: CC BY 4.0, https://climatetrace.org/data
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, AsyncIterator, Optional

import httpx

from models import ClimateStats


TRACE_API_BASE = "https://api.climatetrace.org/v7"
DEFAULT_MAX_POINTS = 10_000
PAGE_SIZE = 1_000
MAX_CONCURRENCY = 4
CACHE_TTL_SEC = 3600
USER_AGENT = "climate-globe/1.0 (https://github.com/climatetrace)"

# (max_points, year, gwp_years) -> {points, ts}
_cache: dict[tuple, dict[str, Any]] = {}
_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(45.0, connect=10.0),
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            },
        )
    return _client


def _cache_get(key: tuple) -> Optional[list[dict]]:
    entry = _cache.get(key)
    if entry is None:
        return None
    if (time.time() - entry["ts"]) >= CACHE_TTL_SEC:
        _cache.pop(key, None)
        return None
    return entry["points"]


def _cache_set(key: tuple, points: list[dict]) -> None:
    _cache[key] = {"points": points, "ts": time.time()}
    if len(_cache) > 12:
        oldest = min(_cache, key=lambda k: _cache[k]["ts"])
        _cache.pop(oldest, None)


def _source_to_point(src: dict, gwp_years: int) -> Optional[dict]:
    """Map a v7 source to a compact globe point. value is tonnes CO2e."""
    centroid = src.get("centroid") or {}
    lat, lng = centroid.get("latitude"), centroid.get("longitude")
    if lat is None or lng is None:
        return None
    try:
        tonnes = float(src.get("emissionsQuantity") or 0)
        lat_f, lng_f = float(lat), float(lng)
    except (TypeError, ValueError):
        return None
    if tonnes <= 0:
        return None
    sector = (src.get("subsector") or src.get("sector") or "other").strip() or "other"
    name = (src.get("name") or "Source").strip() or "Source"
    country = (src.get("country") or "").strip()
    return {
        "lat": round(lat_f, 4),
        "lng": round(lng_f, 4),
        "value": round(tonnes, 1),
        "type": "threat",
        "category": "emissions",
        "intensity": "high" if tonnes >= 1e7 else ("medium" if tonnes >= 1e5 else "low"),
        "label": name[:160],
        "description": f"{sector.replace('-', ' ')} • {country}" if country else sector.replace("-", " "),
        "sector": sector,
        "country": country,
        "gwp_years": gwp_years,
    }


async def _fetch_page(
    *,
    limit: int,
    offset: int,
    year: Optional[int],
    gas: str,
) -> list[dict]:
    params: dict[str, Any] = {"limit": limit, "offset": offset, "gas": gas}
    if year is not None:
        params["year"] = year

    client = _get_client()
    last_error: Optional[Exception] = None
    for attempt in range(3):
        try:
            r = await client.get(f"{TRACE_API_BASE}/sources", params=params)
            if r.status_code in (429, 500, 502, 503, 504) and attempt < 2:
                await asyncio.sleep(0.6 * (attempt + 1))
                continue
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else (data.get("sources") or [])
        except (httpx.TimeoutException, httpx.TransportError) as e:
            last_error = e
            if attempt < 2:
                await asyncio.sleep(0.6 * (attempt + 1))
                continue
            raise
    if last_error:
        raise last_error
    return []


async def stream_trace_chunks(
    max_points: int = DEFAULT_MAX_POINTS,
    year: Optional[int] = None,
    gwp_years: int = 100,
) -> AsyncIterator[list[dict]]:
    """Yield compact source dicts as Climate TRACE pages arrive (progressive load)."""
    gas = "co2e_20yr" if gwp_years == 20 else "co2e_100yr"
    cache_key = (max_points, year, gwp_years)
    cached = _cache_get(cache_key)
    if cached is not None:
        for i in range(0, len(cached), PAGE_SIZE):
            yield cached[i : i + PAGE_SIZE]
        return

    collected: list[dict] = []
    offsets = list(range(0, max_points, PAGE_SIZE))
    if not offsets:
        return

    first_limit = min(PAGE_SIZE, max_points)
    first_page = await _fetch_page(limit=first_limit, offset=0, year=year, gas=gas)
    if not first_page:
        raise RuntimeError("Climate TRACE returned no sources for this year")
    first_chunk = []
    for src in first_page:
        point = _source_to_point(src, gwp_years)
        if point:
            first_chunk.append(point)
    if first_chunk:
        collected.extend(first_chunk)
        yield first_chunk
    if len(first_page) < first_limit:
        _cache_set(cache_key, collected)
        return

    remaining = offsets[1:]
    sem = asyncio.Semaphore(MAX_CONCURRENCY)

    async def fetch_offset(offset: int) -> list[dict]:
        limit = min(PAGE_SIZE, max_points - offset)
        async with sem:
            return await _fetch_page(limit=limit, offset=offset, year=year, gas=gas)

    tasks = [asyncio.create_task(fetch_offset(off)) for off in remaining]
    finished_ok = False
    try:
        for task in asyncio.as_completed(tasks):
            page = await task
            chunk = []
            for src in page:
                point = _source_to_point(src, gwp_years)
                if point:
                    chunk.append(point)
                    if len(collected) + len(chunk) >= max_points:
                        break
            if chunk:
                collected.extend(chunk)
                yield chunk
            if len(collected) >= max_points:
                break
        finished_ok = True
    except asyncio.CancelledError:
        raise
    finally:
        for t in tasks:
            if not t.done():
                t.cancel()

    if finished_ok:
        _cache_set(cache_key, collected[:max_points])


async def get_trace_threats(
    max_points: int = DEFAULT_MAX_POINTS,
    year: Optional[int] = None,
    gwp_years: int = 100,
) -> list[dict]:
    """Fetch up to max_points ranked sources. Uses in-memory cache for CACHE_TTL_SEC."""
    cache_key = (max_points, year, gwp_years)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached[:max_points]

    threats: list[dict] = []
    async for chunk in stream_trace_chunks(max_points=max_points, year=year, gwp_years=gwp_years):
        threats.extend(chunk)
        if len(threats) >= max_points:
            break
    return threats[:max_points]


def get_climate_stats_placeholder() -> ClimateStats:
    """Headline stats are not returned by the sources list endpoint."""
    return ClimateStats(
        global_temperature="+1.24°C above pre-industrial",
        co2_concentration="422.5 ppm",
        renewable_percentage="34.3% of electricity",
        emissions_avoided="2.6 Gt CO₂/year",
    )
