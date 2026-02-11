import { ThreatData, DefenseData } from './types';

// THREAT DATA - Based on IPCC priority indicators
export const threatData: ThreatData[] = [
  // CO2 Emissions Hotspots
  {
    lat: 39.9042,
    lng: 116.4074,
    value: 10.0,
    type: 'threat',
    category: 'emissions',
    intensity: 'high',
    label: 'Beijing Industrial Zone',
    description: 'Major CO2 emissions from coal power and industry - 10 Gt CO2/year'
  },
  {
    lat: 31.2304,
    lng: 121.4737,
    value: 8.5,
    type: 'threat',
    category: 'emissions',
    intensity: 'high',
    label: 'Shanghai Manufacturing',
    description: 'Industrial emissions hotspot - 8.5 Gt CO2/year'
  },
  {
    lat: 40.7128,
    lng: -74.0060,
    value: 6.2,
    type: 'threat',
    category: 'emissions',
    intensity: 'medium',
    label: 'New York Metro',
    description: 'Urban emissions from transport and energy - 6.2 Gt CO2/year'
  },
  {
    lat: 28.7041,
    lng: 77.1025,
    value: 7.8,
    type: 'threat',
    category: 'emissions',
    intensity: 'high',
    label: 'Delhi NCR',
    description: 'Rapidly growing emissions from development - 7.8 Gt CO2/year'
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    value: 4.5,
    type: 'threat',
    category: 'emissions',
    intensity: 'medium',
    label: 'London',
    description: 'Urban center emissions - 4.5 Gt CO2/year'
  },

  // Temperature Anomalies
  {
    lat: 33.4484,
    lng: -112.0740,
    value: 2.1,
    type: 'threat',
    category: 'temperature',
    intensity: 'high',
    label: 'Phoenix Heat Zone',
    description: '+2.1°C above baseline - record heatwaves'
  },
  {
    lat: -23.5505,
    lng: -46.6333,
    value: 1.8,
    type: 'threat',
    category: 'temperature',
    intensity: 'high',
    label: 'São Paulo',
    description: '+1.8°C temperature anomaly affecting 770M people'
  },
  {
    lat: 25.2048,
    lng: 55.2708,
    value: 2.4,
    type: 'threat',
    category: 'temperature',
    intensity: 'high',
    label: 'Dubai',
    description: '+2.4°C extreme heat anomaly'
  },

  // Deforestation Zones
  {
    lat: -3.4653,
    lng: -62.2159,
    value: 9.5,
    type: 'threat',
    category: 'deforestation',
    intensity: 'high',
    label: 'Amazon Basin',
    description: 'Critical deforestation zone - 9.5M hectares lost'
  },
  {
    lat: -1.8312,
    lng: 109.9758,
    value: 6.8,
    type: 'threat',
    category: 'deforestation',
    intensity: 'high',
    label: 'Borneo Rainforest',
    description: 'Palm oil deforestation - 6.8M hectares affected'
  },
  {
    lat: -0.7893,
    lng: 113.9213,
    value: 5.2,
    type: 'threat',
    category: 'deforestation',
    intensity: 'medium',
    label: 'Indonesian Islands',
    description: 'Ongoing deforestation - 5.2M hectares'
  },
  {
    lat: -2.6,
    lng: 23.6,
    value: 7.1,
    type: 'threat',
    category: 'deforestation',
    intensity: 'high',
    label: 'Congo Basin',
    description: 'Secondary rainforest loss - 7.1M hectares'
  },

  // Sea Level Rise Vulnerability
  {
    lat: 23.8103,
    lng: 90.4125,
    value: 1.5,
    type: 'threat',
    category: 'sea-level',
    intensity: 'high',
    label: 'Dhaka Bangladesh',
    description: 'Critical sea level rise vulnerability - 1.5m projected'
  },
  {
    lat: 25.7617,
    lng: -80.1918,
    value: 1.2,
    type: 'threat',
    category: 'sea-level',
    intensity: 'high',
    label: 'Miami',
    description: 'Coastal flooding risk - 1.2m rise projected'
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    value: 0.9,
    type: 'threat',
    category: 'sea-level',
    intensity: 'medium',
    label: 'Singapore',
    description: 'Island nation at risk - 0.9m sea level rise'
  },

  // Ocean Heat Content
  {
    lat: 8.7832,
    lng: -79.5199,
    value: 8.9,
    type: 'threat',
    category: 'ocean-heat',
    intensity: 'high',
    label: 'Panama Pacific',
    description: 'Record ocean heat - 9 consecutive years of records'
  },
  {
    lat: -18.2871,
    lng: 147.6992,
    value: 9.2,
    type: 'threat',
    category: 'ocean-heat',
    intensity: 'high',
    label: 'Great Barrier Reef',
    description: 'Coral bleaching from ocean heat - critical'
  },
];

// DEFENSE DATA - Based on validated climate solutions
export const defenseData: DefenseData[] = [
  // Renewable Energy - Solar
  {
    lat: 27.1767,
    lng: 78.0081,
    value: 15000,
    type: 'defense',
    category: 'renewable',
    capacity: 15000,
    label: 'Bhadla Solar Park, India',
    description: 'World\'s largest solar park - 15,000 MW capacity'
  },
  {
    lat: 37.0902,
    lng: -95.7129,
    value: 12500,
    type: 'defense',
    category: 'renewable',
    capacity: 12500,
    label: 'US Solar Belt',
    description: 'Combined solar capacity - 12,500 MW avoiding 2.6 Gt CO2/year'
  },
  {
    lat: 39.9139,
    lng: 116.3917,
    value: 18000,
    type: 'defense',
    category: 'renewable',
    capacity: 18000,
    label: 'China Solar Array',
    description: 'Leading solar deployment - 18,000 MW'
  },

  // Renewable Energy - Wind
  {
    lat: 54.5260,
    lng: 15.2551,
    value: 8500,
    type: 'defense',
    category: 'renewable',
    capacity: 8500,
    label: 'Baltic Sea Wind Farm',
    description: 'Offshore wind power - 8,500 MW, EU renewable leader'
  },
  {
    lat: 51.1657,
    lng: 10.4515,
    value: 9200,
    type: 'defense',
    category: 'renewable',
    capacity: 9200,
    label: 'German Wind Network',
    description: 'Combined wind capacity - 9,200 MW'
  },
  {
    lat: 41.8781,
    lng: -87.6298,
    value: 7800,
    type: 'defense',
    category: 'renewable',
    capacity: 7800,
    label: 'US Midwest Wind',
    description: 'Central plains wind farms - 7,800 MW'
  },

  // Reforestation Projects
  {
    lat: -3.4653,
    lng: -62.2159,
    value: 50000,
    type: 'defense',
    category: 'reforestation',
    capacity: 50000,
    label: 'Amazon Restoration Initiative',
    description: '50,000 hectares reforestation - sequestering 2B tons CO2 annually'
  },
  {
    lat: 40.1824,
    lng: 94.5965,
    value: 66000,
    type: 'defense',
    category: 'reforestation',
    capacity: 66000,
    label: 'China Great Green Wall',
    description: 'Massive reforestation - 66,000 hectares, 31.4B tons CO2 potential'
  },
  {
    lat: 12.8797,
    lng: 121.7740,
    value: 25000,
    type: 'defense',
    category: 'reforestation',
    capacity: 25000,
    label: 'Philippines Forest Recovery',
    description: '25,000 hectares restoration project'
  },
  {
    lat: 9.1450,
    lng: 40.4897,
    value: 35000,
    type: 'defense',
    category: 'reforestation',
    capacity: 35000,
    label: 'Ethiopian Green Legacy',
    description: '35,000 hectares planted - carbon sequestration project'
  },

  // Conservation Zones
  {
    lat: -2.6,
    lng: 23.6,
    value: 80000,
    type: 'defense',
    category: 'conservation',
    capacity: 80000,
    label: 'Congo Rainforest Reserve',
    description: '80,000 hectares protected - critical carbon sink'
  },
  {
    lat: -14.2350,
    lng: -51.9253,
    value: 120000,
    type: 'defense',
    category: 'conservation',
    capacity: 120000,
    label: 'Brazil Protected Areas',
    description: '120,000 hectares conservation zone'
  },
  {
    lat: 61.5240,
    lng: 105.3188,
    value: 95000,
    type: 'defense',
    category: 'conservation',
    capacity: 95000,
    label: 'Siberian Forest Protection',
    description: '95,000 hectares preserved boreal forest'
  },

  // Carbon Capture Projects
  {
    lat: 64.9631,
    lng: -19.0208,
    value: 4000,
    type: 'defense',
    category: 'carbon-capture',
    capacity: 4000,
    label: 'Iceland Carbfix',
    description: 'Direct air capture - 4,000 tons CO2/year'
  },
  {
    lat: 59.3293,
    lng: 18.0686,
    value: 36000,
    type: 'defense',
    category: 'carbon-capture',
    capacity: 36000,
    label: 'Nordic Carbon Storage',
    description: 'Underground CO2 storage - 36,000 tons/year'
  },
];
