'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import type { ThreatData } from '@/lib/types';

let Globe: any = null;

const SOURCE_LIMIT = 10_000;
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];
const TIMEFRAME_OPTIONS = [
  { id: 100, label: '100 YR' },
  { id: 20, label: '20 YR' },
];

const SECTOR_TO_GROUP: Record<string, string> = {
  power: 'power',
  'oil-and-gas-production': 'oil-and-gas',
  'oil-and-gas': 'oil-and-gas',
  'fossil-fuel-operations': 'oil-and-gas',
  'coal-mining': 'oil-and-gas',
  'road-transportation': 'transport',
  shipping: 'transport',
  aviation: 'transport',
  'rail-transportation': 'transport',
  transportation: 'transport',
  'forest-land-fires': 'forest-and-land',
  'forestry-and-land-use': 'forest-and-land',
  agriculture: 'agriculture',
  manufacturing: 'manufacturing',
  buildings: 'buildings',
  waste: 'waste',
  mining: 'mining',
  'mineral-extraction': 'mining',
  'fluorinated-gases': 'fluorinated-gases',
};

const GROUP_LABELS: Record<string, string> = {
  all: 'All Sectors',
  power: 'Power',
  'oil-and-gas': 'Oil & gas',
  transport: 'Transport',
  'forest-and-land': 'Forest & land',
  agriculture: 'Agriculture',
  manufacturing: 'Manufacturing',
  buildings: 'Buildings',
  waste: 'Waste',
  mining: 'Mining',
  'fluorinated-gases': 'Fluorinated gases',
  other: 'Other',
};

const GROUP_ORDER = [
  'power',
  'oil-and-gas',
  'transport',
  'forest-and-land',
  'agriculture',
  'manufacturing',
  'buildings',
  'waste',
  'mining',
  'fluorinated-gases',
  'other',
];

const GROUP_COLORS: Record<string, string> = {
  power: '#f59e0b',
  'oil-and-gas': '#ef4444',
  transport: '#8b5cf6',
  'forest-and-land': '#22c55e',
  agriculture: '#eab308',
  manufacturing: '#ec4899',
  buildings: '#06b6d4',
  waste: '#78716c',
  mining: '#f97316',
  'fluorinated-gases': '#6366f1',
  other: '#64748b',
};

function getSectorGroup(sector: string | undefined): string {
  const s = (sector || 'other').toString().toLowerCase().trim();
  return SECTOR_TO_GROUP[s] ?? 'other';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format tonnes of CO2e for display. */
function formatTonnes(tonnes: number): string {
  const v = Math.abs(tonnes);
  if (v >= 1e9) return `${(tonnes / 1e9).toFixed(2)} Gt`;
  if (v >= 1e6) return `${(tonnes / 1e6).toFixed(1)} Mt`;
  if (v >= 1e3) return `${(tonnes / 1e3).toFixed(0)} kt`;
  return `${tonnes.toFixed(0)} t`;
}

function darkenHex(hex: string, amount = 30): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function dominantGroup(points: ThreatData[]): string {
  const weights = new Map<string, number>();
  for (const p of points) {
    const g = getSectorGroup(p.sector);
    weights.set(g, (weights.get(g) || 0) + (Number(p.value) || 0));
  }
  let best = 'other';
  let bestV = -1;
  weights.forEach((v, k) => {
    if (v > bestV) {
      bestV = v;
      best = k;
    }
  });
  return best;
}

export default function ClimateGlobe() {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [year, setYear] = useState(2025);
  const [timeframe, setTimeframe] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [globeReady, setGlobeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threatData, setThreatData] = useState<ThreatData[]>([]);

  useEffect(() => {
    import('globe.gl').then((module) => {
      Globe = module.default;
      setGlobeReady(true);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setThreatData([]);

    const fail = (err: Error) => {
      if (controller.signal.aborted) return;
      console.error('Failed to load emissions data:', err);
      setError(
        process.env.NEXT_PUBLIC_API_URL
          ? `Failed to load emissions data. Is the backend running at ${process.env.NEXT_PUBLIC_API_URL}?`
          : 'Failed to load emissions data. Is the backend running on port 8000?'
      );
      setLoading(false);
    };

    apiClient.streamTraceData({
      maxPoints: SOURCE_LIMIT,
      year,
      gwpYears: timeframe,
      signal: controller.signal,
      onChunk: (chunk) => {
        if (controller.signal.aborted) return;
        setThreatData((prev) => (prev.length ? prev.concat(chunk) : chunk));
      },
      onComplete: () => {
        if (!controller.signal.aborted) setLoading(false);
      },
      onError: (err) => {
        if (controller.signal.aborted) return;
        apiClient
          .getTraceData(SOURCE_LIMIT, year, timeframe, controller.signal)
          .then((data) => {
            if (controller.signal.aborted) return;
            setThreatData(data.threats || []);
            setLoading(false);
          })
          .catch(() => fail(err));
      },
    });

    return () => controller.abort();
  }, [year, timeframe]);

  const sectorOptions = useMemo(() => {
    const seen = new Set<string>();
    threatData.forEach((d) => seen.add(getSectorGroup(d.sector)));
    const list = [{ value: 'all', label: 'All Sectors' }];
    GROUP_ORDER.filter((g) => seen.has(g)).forEach((value) =>
      list.push({ value, label: GROUP_LABELS[value] ?? value })
    );
    return list;
  }, [threatData]);

  useEffect(() => {
    if (sectorFilter !== 'all' && !sectorOptions.some((o) => o.value === sectorFilter)) {
      setSectorFilter('all');
    }
  }, [sectorOptions, sectorFilter]);

  const displayData = useMemo(() => {
    let data: ThreatData[] = threatData;
    if (sectorFilter && sectorFilter !== 'all') {
      data = data.filter((d) => getSectorGroup(d.sector) === sectorFilter);
    }
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (d) =>
        (d.label && d.label.toLowerCase().includes(q)) ||
        (d.country && d.country.toLowerCase().includes(q)) ||
        (d.description && String(d.description).toLowerCase().includes(q)) ||
        (d.sector && d.sector.toLowerCase().includes(q))
    );
  }, [sectorFilter, threatData, searchQuery]);

  const emissionsSummary = useMemo(() => {
    const totalTonnes = displayData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    return { totalTonnes, sourceCount: displayData.length };
  }, [displayData]);

  useEffect(() => {
    if (!globeReady || !containerRef.current || !Globe) return;

    const el = containerRef.current;
    const globe = Globe()(el)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundColor('rgba(10, 14, 26, 1)')
      .atmosphereColor('rgba(80, 120, 180, 0.25)')
      .atmosphereAltitude(0.12)
      .width(el.clientWidth)
      .height(el.clientHeight);

    globeEl.current = globe;
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    const ro = new ResizeObserver(() => {
      if (!globeEl.current) return;
      globeEl.current.width(el.clientWidth).height(el.clientHeight);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (globeEl.current) {
        globeEl.current._destructor();
        globeEl.current = undefined;
      }
    };
  }, [globeReady]);

  useEffect(() => {
    if (!globeEl.current) return;

    globeEl.current
      .hexBinPointsData(displayData)
      .hexBinPointWeight('value')
      .hexBinPointLat('lat')
      .hexBinPointLng('lng')
      .hexBinResolution(4)
      .hexMargin(0.45)
      .hexAltitude((d: { sumWeight: number }) => {
        const h = 0.012 + 0.055 * Math.log10(1 + d.sumWeight / 1e6);
        return Math.min(h, 0.28);
      })
      .hexTopColor((d: { points: ThreatData[] }) => GROUP_COLORS[dominantGroup(d.points)] ?? GROUP_COLORS.other)
      .hexSideColor((d: { points: ThreatData[] }) => {
        const hex = GROUP_COLORS[dominantGroup(d.points)] ?? GROUP_COLORS.other;
        return darkenHex(hex);
      })
      .hexLabel((d: { points: ThreatData[]; sumWeight: number }) => {
        const points = d.points || [];
        const top = [...points].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))[0];
        if (!top) return '';
        const group = GROUP_LABELS[dominantGroup(points)] ?? 'Other';
        const extra = points.length > 1 ? `<div style="color:#999;font-size:11px;margin-top:6px;">${points.length} sources in this cell</div>` : '';
        return `
          <div style="background:rgba(0,0,0,0.9);padding:12px;border-radius:8px;max-width:260px;">
            <div style="color:#ff6644;font-weight:bold;margin-bottom:6px;font-size:14px;">
              ${escapeHtml(top.label || 'Source')}
            </div>
            <div style="color:#fff;font-size:12px;line-height:1.4;">
              ${escapeHtml(formatTonnes(d.sumWeight))} CO2e · ${escapeHtml(group)}
              ${top.country ? ` · ${escapeHtml(top.country)}` : ''}
            </div>
            ${extra}
          </div>
        `;
      });
  }, [displayData, globeReady]);

  const emissionsDisplay = useMemo(() => {
    const annual = emissionsSummary.totalTonnes;
    const v = viewMode === 'monthly' ? annual / 12 : annual;
    return formatTonnes(v);
  }, [emissionsSummary.totalTonnes, viewMode]);

  const showFatalError = Boolean(error && threatData.length === 0);

  return (
    <div className="relative w-screen h-screen bg-[#0a0e1a]">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      <header className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-4 pt-4">
          <h1 className="text-white font-medium text-sm tracking-tight">
            Global greenhouse gas emissions · Climate TRACE
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {loading
              ? `Loading ${threatData.length.toLocaleString()} of ${SOURCE_LIMIT.toLocaleString()} top sources…`
              : `${threatData.length.toLocaleString()} top-ranked sources`}
          </p>
        </div>
        {loading && (
          <div className="mt-2 h-0.5 w-full bg-white/5">
            <div
              className="h-full bg-sky-400/80 transition-[width] duration-300"
              style={{ width: `${Math.min(100, (threatData.length / SOURCE_LIMIT) * 100)}%` }}
            />
          </div>
        )}
      </header>

      <div className="absolute top-14 left-0 right-0 z-10 flex flex-wrap items-center gap-1.5 px-3 py-1.5 pointer-events-none">
        <input
          type="search"
          placeholder="Search name, country, or sector"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search sources"
          className="pointer-events-auto min-w-[180px] max-w-[240px] px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white placeholder-gray-500 text-xs focus:outline-none focus:border-white/30"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          aria-label="Filter by sector"
          className="pointer-events-auto px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white text-xs focus:outline-none"
        >
          {sectorOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Emissions year"
          className="pointer-events-auto px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white text-xs focus:outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-gray-900">
              {y}
            </option>
          ))}
        </select>
        <div className="pointer-events-auto flex rounded overflow-hidden border border-white/15">
          {TIMEFRAME_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeframe(t.id)}
              className={`px-2 py-1.5 text-xs ${timeframe === t.id ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400 hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <aside className="absolute top-28 right-3 z-10 w-56 pointer-events-none">
        <div className="pointer-events-auto bg-black/70 backdrop-blur rounded border border-white/10 p-3">
          <h2 className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Shown sources</h2>
          <p className="text-2xl font-semibold text-white tabular-nums">{threatData.length === 0 && loading ? '—' : emissionsDisplay}</p>
          <p className="text-gray-500 text-xs">
            CO2e {timeframe}yr {viewMode === 'monthly' ? '(avg/mo)' : ''}
          </p>
          <p className="text-gray-600 text-[10px] mt-1">
            {emissionsSummary.sourceCount.toLocaleString()} sources · not a global total
          </p>
          {sectorOptions.length > 1 && (
            <ul className="mt-2 space-y-0.5 max-h-28 overflow-y-auto">
              {sectorOptions
                .filter((o) => o.value !== 'all')
                .map((o) => (
                  <li key={o.value} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: GROUP_COLORS[o.value] ?? GROUP_COLORS.other }}
                    />
                    {o.label}
                  </li>
                ))}
            </ul>
          )}
          <div className="flex gap-1 mt-2">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`text-[10px] px-1.5 py-0.5 rounded ${viewMode === 'monthly' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('annual')}
              className={`text-[10px] px-1.5 py-0.5 rounded ${viewMode === 'annual' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Annual
            </button>
          </div>
          <a
            href="https://climatetrace.org/explore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-xs"
          >
            More Details →
          </a>
        </div>
      </aside>

      {error && threatData.length > 0 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded border border-amber-500/40 bg-black/80 px-3 py-2 text-xs text-amber-200">
          {error}
        </div>
      )}

      {!globeReady && !showFatalError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]">
          <div className="text-white text-sm text-gray-300">Loading globe…</div>
        </div>
      )}

      {showFatalError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md">
            <div className="text-red-400 text-xl mb-2">Backend connection error</div>
            <div className="text-white text-sm mb-4">{error}</div>
            <div className="text-gray-400 text-xs">
              <p className="mb-2">To start the backend:</p>
              <code className="block bg-black/50 p-2 rounded">
                cd backend
                <br />
                pip install -r requirements.txt
                <br />
                python main.py
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
