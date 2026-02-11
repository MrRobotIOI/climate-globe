export interface ClimateDataPoint {
  lat: number;
  lng: number;
  value: number;
  type: 'threat' | 'defense';
  category: string;
  label: string;
  description: string;
}

export interface ThreatData extends ClimateDataPoint {
  type: 'threat';
  category: 'emissions' | 'temperature' | 'deforestation' | 'sea-level' | 'ocean-heat';
  intensity: 'high' | 'medium' | 'low';
  sector?: string; // Climate TRACE sector (e.g. power, oil-and-gas-production)
}

export interface DefenseData extends ClimateDataPoint {
  type: 'defense';
  category: 'renewable' | 'reforestation' | 'conservation' | 'carbon-capture';
  capacity: number; // MW for energy, hectares for land
}

export type DataLayer = 'all' | 'threats' | 'defense' | 'emissions' | 'temperature' | 'renewable' | 'reforestation';
