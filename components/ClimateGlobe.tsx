'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';

// Dynamic import for globe.gl to avoid SSR issues
let Globe: any = null;

const YEARS = [2024, 2023, 2022, 2021];
const GAS_OPTIONS = [{ id: 'co2e', label: 'CO2e' }];
const TIMEFRAME_OPTIONS = [{ id: 100, label: '100 YR' }, { id: 20, label: '20 YR' }];

// Map raw API sectors to a small set of consolidated groups (no duplicate labels)
const SECTOR_TO_GROUP: Record<string, string> = {
  power: 'power',
  'oil-and-gas-production': 'oil-and-gas',
  'oil-and-gas': 'oil-and-gas',
  'fossil-fuel-operations': 'oil-and-gas',
  'road-transportation': 'transport',
  shipping: 'transport',
  aviation: 'transport',
  'rail-transportation': 'transport',
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
const GROUP_ORDER = ['power', 'oil-and-gas', 'transport', 'forest-and-land', 'agriculture', 'manufacturing', 'buildings', 'waste', 'mining', 'fluorinated-gases', 'other'];

function getSectorGroup(sector: string | undefined): string {
  const s = (sector || 'other').toString().toLowerCase().trim();
  return SECTOR_TO_GROUP[s] ?? 'other';
}

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

export default function ClimateGlobe() {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showThreats, setShowThreats] = useState(true);
  const [year, setYear] = useState(2024);
  const [gas, setGas] = useState('co2e');
  const [timeframe, setTimeframe] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [globeReady, setGlobeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data from backend (loaded all at once)
  const [threatData, setThreatData] = useState<any[]>([]);
  const [defenseData, setDefenseData] = useState<any[]>([]);
  const [climateStats, setClimateStats] = useState<any>(null);

  useEffect(() => {
    // Dynamic import of globe.gl
    import('globe.gl').then((module) => {
      Globe = module.default;
      setGlobeReady(true);
    });
  }, []);

  // Load Climate TRACE data all at once (1/3 of original: ~33k sources)
  useEffect(() => {
    const total = 16_500;
    setLoading(true);
    setError(null);
    apiClient.getTraceData(total).then(
      (data) => {
        setThreatData(data.threats);
        setDefenseData(data.defense || []);
        setClimateStats(data.stats);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Failed to load emissions data:', err);
        setError(
          process.env.NEXT_PUBLIC_API_URL
            ? `Failed to load emissions data. Is the backend running at ${process.env.NEXT_PUBLIC_API_URL}?`
            : 'Failed to load emissions data. Is the backend running on port 8000?'
        );
        setLoading(false);
      }
    );
  }, []);

  // Consolidated sector options: one entry per group, only groups that have data, fixed order
  const sectorOptions = useMemo(() => {
    const seen = new Set<string>();
    threatData.forEach((d: any) => seen.add(getSectorGroup(d.sector)));
    const list = [{ value: 'all', label: 'All Sectors' }];
    GROUP_ORDER.filter((g) => seen.has(g)).forEach((value) => list.push({ value, label: GROUP_LABELS[value] ?? value }));
    return list;
  }, [threatData]);

  // Build display data: filter by selected sector group and search
  const displayData = useMemo(() => {
    let data = showThreats ? threatData : [];
    if (sectorFilter && sectorFilter !== 'all') {
      data = data.filter((d: any) => getSectorGroup(d.sector) === sectorFilter);
    }
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (d: any) =>
        (d.label && d.label.toLowerCase().includes(q)) ||
        (d.description && String(d.description).toLowerCase().includes(q))
    );
  }, [sectorFilter, showThreats, threatData, searchQuery]);

  const emissionsSummary = useMemo(() => {
    const sources = displayData.filter((d: any) => d.type === 'threat');
    const totalValue = sources.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
    return { totalValue, sourceCount: displayData.length };
  }, [displayData]);

  useEffect(() => {
    if (!globeReady || !containerRef.current || !Globe) return;

    // Initialize Globe — minimal: dark, subtle atmosphere, no bump
    const globe = Globe()(containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundColor('rgba(10, 14, 26, 1)')
      .atmosphereColor('rgba(80, 120, 180, 0.25)')
      .atmosphereAltitude(0.12);

    globeEl.current = globe;

    // No auto-rotate; user can drag to explore
    globe.controls().autoRotate = false;

    // Set initial camera position
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    return () => {
      if (globeEl.current) {
        globeEl.current._destructor();
      }
    };
  }, [globeReady]);

  useEffect(() => {
    if (!globeEl.current) return;

    const colorForGroup = (group: string) => GROUP_COLORS[group] ?? GROUP_COLORS.other;

    globeEl.current
      .hexBinPointsData(displayData)
      .hexBinPointWeight('value')
      .hexBinPointLat('lat')
      .hexBinPointLng('lng')
      .hexBinResolution(4)
      .hexMargin(0.45)
      .hexAltitude((d: { sumWeight: number }) => {
        const s = d.sumWeight;
        const h = 0.02 + 0.045 * Math.sqrt(s);
        return Math.min(h * 0.4, 0.25);
      })
      .hexTopColor((d: any) => {
        const group = getSectorGroup(d.points[0]?.sector);
        return colorForGroup(group);
      })
      .hexSideColor((d: any) => {
        const group = getSectorGroup(d.points[0]?.sector);
        const hex = colorForGroup(group);
        // Slightly darker for side
        const n = parseInt(hex.slice(1), 16);
        const r = Math.max(0, ((n >> 16) & 0xff) - 30);
        const g = Math.max(0, ((n >> 8) & 0xff) - 30);
        const b = Math.max(0, (n & 0xff) - 30);
        return `rgb(${r},${g},${b})`;
      })
      .hexLabel((d: any) => {
        const point = d.points[0];
        return `
          <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; max-width: 250px;">
            <div style="color: #ff6644; font-weight: bold; margin-bottom: 6px; font-size: 14px;">
              ${point.label}
            </div>
            <div style="color: #ffffff; font-size: 12px; line-height: 1.4;">
              ${point.description}
            </div>
            <div style="color: #999; font-size: 11px; margin-top: 6px;">
              ${GROUP_LABELS[getSectorGroup(point.sector)] ?? (point.sector || 'Other').replace(/-/g, ' ')}
            </div>
          </div>
        `;
      });

  }, [displayData]);

  // Format emissions for display; Monthly = annual total / 12 (monthly average)
  const emissionsDisplay = useMemo(() => {
    const annual = emissionsSummary.totalValue;
    const v = viewMode === 'monthly' ? annual / 12 : annual;
    if (v >= 1) return `${v.toFixed(1)} Gt`;
    if (v >= 0.001) return `${(v * 1000).toFixed(0)} Mt`;
    return `${(v * 1e6).toFixed(0)} t`;
  }, [emissionsSummary.totalValue, viewMode]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0e1a]">
      {/* Globe — full bleed */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Minimal header */}
      <header className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-4 pt-4">
          <h1 className="text-white font-medium text-sm tracking-tight">
            Greenhouse gas emissions · Climate TRACE
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {loading ? 'Loading…' : `${threatData.length.toLocaleString()} sources`}
          </p>
        </div>
      </header>

      {/* Compact top bar */}
      <div className="absolute top-14 left-0 right-0 z-10 flex flex-wrap items-center gap-1.5 px-3 py-1.5">
        <input
          type="text"
          placeholder="Search area or owner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[160px] max-w-[200px] px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white placeholder-gray-500 text-xs focus:outline-none focus:border-white/30"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white text-xs focus:outline-none"
        >
          {sectorOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-2.5 py-1.5 bg-white/5 border border-white/15 rounded text-white text-xs focus:outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-gray-900">{y}</option>
          ))}
        </select>
        <div className="flex rounded overflow-hidden border border-white/15">
          {TIMEFRAME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-2 py-1.5 text-xs ${timeframe === t.id ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400 hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Single summary panel */}
      <aside className="absolute top-28 right-3 z-10 w-56">
        <div className="bg-black/70 backdrop-blur rounded border border-white/10 p-3">
          <h2 className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Emissions</h2>
          <p className="text-2xl font-semibold text-white tabular-nums">
            {loading ? '—' : emissionsDisplay}
          </p>
          <p className="text-gray-500 text-xs">
            CO2e {timeframe}yr {viewMode === 'monthly' ? '(avg/mo)' : ''}
          </p>
          <p className="text-gray-600 text-[10px] mt-1">{emissionsSummary.sourceCount.toLocaleString()} sources</p>
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setViewMode('monthly')}
              className={`text-[10px] px-1.5 py-0.5 rounded ${viewMode === 'monthly' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Monthly
            </button>
            <button
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

      {!globeReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-xl">Loading Globe...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md">
            <div className="text-red-400 text-xl mb-2">⚠️ Backend Connection Error</div>
            <div className="text-white text-sm mb-4">{error}</div>
            <div className="text-gray-400 text-xs">
              <p className="mb-2">To start the backend:</p>
              <code className="block bg-black/50 p-2 rounded">
                cd backend<br/>
                pip install -r requirements.txt<br/>
                python main.py
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
