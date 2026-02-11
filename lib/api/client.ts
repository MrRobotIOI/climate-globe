/**
 * API Client for Climate Globe Backend
 * Connects Next.js frontend to FastAPI Python backend
 */

import { ThreatData, DefenseData } from '../types';

// Use same-origin proxy in dev to avoid browser "local network access" prompts; production uses explicit backend URL.
const API_BASE_URL =
  typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_API_URL || /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_API_URL))
    ? '/api/proxy'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ClimateApiResponse {
  threats: ThreatData[];
  defense: DefenseData[];
  stats: {
    global_temperature: string;
    co2_concentration: string;
    renewable_percentage: string;
    emissions_avoided: string;
  };
  total_threats: number;
  total_defense: number;
}

export class ClimateApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all climate data from backend.
   * @param dense If true, returns a dense global grid of points for a fuller-looking globe
   */
  async getAllClimateData(dense = false): Promise<ClimateApiResponse> {
    const url = dense ? `${this.baseUrl}/api/climate/all?dense=true` : `${this.baseUrl}/api/climate/all`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch climate data: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch emissions data from Climate TRACE (millions of real sources).
   * First load may take a minute; backend caches for 1 hour.
   */
  async getTraceData(maxPoints = 16_500): Promise<ClimateApiResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/climate/trace?max_points=${Math.min(100_000, Math.max(1000, maxPoints))}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch Climate TRACE data: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Stream emissions data from Climate TRACE; call onChunk for each chunk and onComplete when done.
   * Progress can be shown as (accumulated count / maxPoints).
   */
  async streamTraceData(
    maxPoints: number,
    onChunk: (sources: ThreatData[]) => void,
    onComplete: () => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const url = `${this.baseUrl}/api/climate/trace/stream?max_points=${Math.min(100_000, Math.max(5000, maxPoints))}`;
    const response = await fetch(url);
    if (!response.ok) {
      onError(new Error(`Failed to stream: ${response.statusText}`));
      return;
    }
    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('No response body'));
      return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as ThreatData[];
            if (Array.isArray(chunk) && chunk.length) onChunk(chunk);
          } catch {
            // skip malformed line
          }
        }
      }
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer) as ThreatData[];
          if (Array.isArray(chunk) && chunk.length) onChunk(chunk);
        } catch {
          // skip
        }
      }
      onComplete();
    } catch (e) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  /**
   * Fetch only threat data, optionally filtered by category
   */
  async getThreats(category?: string): Promise<ThreatData[]> {
    const url = category 
      ? `${this.baseUrl}/api/climate/threats?category=${category}`
      : `${this.baseUrl}/api/climate/threats`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch threat data: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch only defense data, optionally filtered by category
   */
  async getDefense(category?: string): Promise<DefenseData[]> {
    const url = category
      ? `${this.baseUrl}/api/climate/defense?category=${category}`
      : `${this.baseUrl}/api/climate/defense`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch defense data: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch climate statistics
   */
  async getClimateStats() {
    const response = await fetch(`${this.baseUrl}/api/climate/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch climate stats: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get data summary
   */
  async getDataSummary() {
    const response = await fetch(`${this.baseUrl}/api/climate/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Check backend health
   */
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }
}

// Singleton instance
export const apiClient = new ClimateApiClient();
