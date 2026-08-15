import { useState, useEffect, useCallback } from 'react';

export type StoryStepKey =
  | 'LAND'
  | 'SOIL'
  | 'ROOTS'
  | 'WATER'
  | 'AI_SCAN'
  | 'GROWTH'
  | 'DRONE'
  | 'HARVEST'
  | 'MARKET'
  | 'PROFIT';

export type WeatherType = 'SUNNY' | 'PARTLY_CLOUDY' | 'OVERCAST' | 'RAIN' | 'STORM';

export type CameraMode = 'CINEMATIC' | 'FREE_ORBIT' | 'UNDERGROUND' | 'TOP_DOWN' | 'FOLLOW_DRONE' | 'FOLLOW_TRACTOR';

export type POIType =
  | 'CROP_FIELD'
  | 'SOIL'
  | 'IRRIGATION'
  | 'TRACTOR'
  | 'DRONE'
  | 'WEATHER_STATION'
  | 'FARMHOUSE'
  | 'GREENHOUSE'
  | 'SOLAR_PANELS'
  | 'WATER_TANK';

export interface StoryStepInfo {
  key: StoryStepKey;
  stepNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  suggestedWeather: WeatherType;
  soilVisible: boolean;
  irrigationFlow: boolean;
  droneScanning: boolean;
  harvestProgress: number; // 0 to 1
  growthProgress: number;  // 0 to 1
  tractorActive: boolean;
  marketActive: boolean;
  profitActive: boolean;
}

export const STORY_STEPS: StoryStepInfo[] = [
  {
    key: 'LAND',
    stepNumber: 1,
    title: '1. Land Landscape',
    subtitle: 'The Agricultural Ecosystem',
    badge: 'EXPANSIVE FARM TERRAIN',
    description: '3.5 Acres of fertile agricultural land in the Indo-Gangetic plains, equipped with solar power, weather station, greenhouse, and tilled plots.',
    cameraPos: [28, 22, 34],
    cameraTarget: [0, 2, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: false,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 0.2,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'SOIL',
    stepNumber: 2,
    title: '2. Underground Soil Strata',
    subtitle: 'Cutaway Horizon Architecture',
    badge: 'GEOLOGICAL SOIL LAYERS',
    description: 'Camera transitions below the surface revealing Topsoil, Nutrient Rich Zone, Moisture Capillary Layer, and Deep Bedrock clay.',
    cameraPos: [6, -4, 10],
    cameraTarget: [0, -4, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: true,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 0.25,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'ROOTS',
    stepNumber: 3,
    title: '3. Root Zone & Biology',
    subtitle: 'Rhizosphere Nutrient Assimilation',
    badge: 'MICROBIAL ASSIMILATION',
    description: 'Branching root structures absorb NPK nutrients (Nitrogen, Phosphorus, Potassium) and organic matter particles through microscopic root hairs.',
    cameraPos: [2, -3.2, 5],
    cameraTarget: [0, -3.5, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: true,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 0.35,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'WATER',
    stepNumber: 4,
    title: '4. Smart Drip Irrigation',
    subtitle: 'Capillary Moisture Delivery',
    badge: 'AUTOMATED MICRO-IRRIGATION',
    description: 'Automated pressure pump draws water from storage tank through translucent pipelines into micro-drip emitters, delivering precise droplets to roots.',
    cameraPos: [-4, 6, 12],
    cameraTarget: [-4, 0, 2],
    suggestedWeather: 'SUNNY',
    soilVisible: true,
    irrigationFlow: true,
    droneScanning: false,
    growthProgress: 0.45,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'AI_SCAN',
    stepNumber: 5,
    title: '5. AI Soil & Land Scanning',
    subtitle: 'Diagnostic LiDAR & Spectral Telemetry',
    badge: 'PRECISION BIO-TELEMETRY',
    description: 'Laser-cyan holographic scanning grid sweeps across fields and soil horizons. Real-time metrics compute pH 6.8, Nitrogen 245 kg/ha, Moisture 68%, Organic Carbon 0.78%.',
    cameraPos: [10, 14, 18],
    cameraTarget: [0, 0, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: true,
    irrigationFlow: true,
    droneScanning: false,
    growthProgress: 0.5,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'GROWTH',
    stepNumber: 6,
    title: '6. Crop Lifecycle Growth',
    subtitle: 'Germination to Full Maturity',
    badge: 'CHRONOLOGICAL PHENOLOGY',
    description: 'Witness the seamless time-lapse transition from sprouting seedling through lush vegetative foliage and golden flowering to heavy ripe fruit clusters.',
    cameraPos: [6, 4, 8],
    cameraTarget: [4, 1, 0],
    suggestedWeather: 'PARTLY_CLOUDY',
    soilVisible: false,
    irrigationFlow: true,
    droneScanning: false,
    growthProgress: 0.85,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'DRONE',
    stepNumber: 7,
    title: '7. Autonomous Drone Patrol',
    subtitle: 'Multispectral Foliar Health Index',
    badge: 'AUTONOMOUS CROP DOCTOR',
    description: 'Hexacopter agricultural drone hovers along pre-programmed GPS waypoints, projecting conical LiDAR scanner beams to map NDVI health: 🟢 Healthy (94%), 🟡 Attention (6%).',
    cameraPos: [-8, 16, 14],
    cameraTarget: [-4, 5, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: false,
    irrigationFlow: false,
    droneScanning: true,
    growthProgress: 0.95,
    harvestProgress: 0,
    tractorActive: false,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'HARVEST',
    stepNumber: 8,
    title: '8. Precision Harvesting',
    subtitle: 'Mechanized Field Collection',
    badge: 'GRADE-A PRODUCE COLLECTION',
    description: 'Mahindra 45HP tractor and harvester traverse crop furrows, gathering ripe produce into ventilated crates and loading onto the transport trailer.',
    cameraPos: [14, 8, 16],
    cameraTarget: [6, 1.5, -2],
    suggestedWeather: 'SUNNY',
    soilVisible: false,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 1.0,
    harvestProgress: 1.0,
    tractorActive: true,
    marketActive: false,
    profitActive: false,
  },
  {
    key: 'MARKET',
    stepNumber: 9,
    title: '9. Farm-to-Market Route',
    subtitle: 'Direct Logistics & APMC Mandi',
    badge: '0% COMMISSION DIRECT COMMERCE',
    description: 'Holographic logistics path connects farm gate directly across regional highways to the APMC wholesale mandi and direct urban consumer hubs.',
    cameraPos: [0, 24, 28],
    cameraTarget: [0, 0, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: false,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 1.0,
    harvestProgress: 1.0,
    tractorActive: false,
    marketActive: true,
    profitActive: false,
  },
  {
    key: 'PROFIT',
    stepNumber: 10,
    title: '10. Economic Profit & ROI',
    subtitle: 'Data-Driven Prosperity',
    badge: 'FINANCIAL VISUALIZATION',
    description: 'Futuristic 3D financial pillars materialize: Investment ₹65,000 → Gross Revenue ₹2,10,000 → Net Profit ₹1,45,000 (+123% ROI) with celebratory golden particles.',
    cameraPos: [0, 16, 22],
    cameraTarget: [0, 3, 0],
    suggestedWeather: 'SUNNY',
    soilVisible: false,
    irrigationFlow: false,
    droneScanning: false,
    growthProgress: 1.0,
    harvestProgress: 1.0,
    tractorActive: false,
    marketActive: true,
    profitActive: true,
  },
];
