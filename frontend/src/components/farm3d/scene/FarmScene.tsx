import React from 'react';
import { EnvironmentSky } from './EnvironmentSky';
import { TerrainAndFields } from './TerrainAndFields';
import { UndergroundSoil } from './UndergroundSoil';
import { CropFields } from './CropFields';
import { SmartInfrastructure } from './SmartInfrastructure';
import { MachineryAndTractor } from './MachineryAndTractor';
import { SmartIrrigationSystem } from './SmartIrrigationSystem';
import { AutonomousDrone } from './AutonomousDrone';
import { AIScanningEffects } from './AIScanningEffects';
import { WeatherEffects } from './WeatherEffects';
import { LogisticsAndMarket } from './LogisticsAndMarket';
import { ProfitVisualizer3D } from './ProfitVisualizer3D';
import { CameraController } from './CameraController';
import { StoryStepInfo, WeatherType, CameraMode, POIType } from '../state/useFarm3DStore';

interface FarmSceneProps {
  currentStepInfo: StoryStepInfo;
  weather: WeatherType;
  cameraMode: CameraMode;
  growthProgress: number;
  onSelectPOI: (poi: POIType) => void;
  freeOrbit: boolean;
}

export const FarmScene: React.FC<FarmSceneProps> = ({
  currentStepInfo,
  weather,
  cameraMode,
  growthProgress,
  onSelectPOI,
  freeOrbit,
}) => {
  return (
    <>
      {/* 1. Atmospheric Sky & Sun Environment */}
      <EnvironmentSky weather={weather} />

      {/* 2. Primary Terrain, Fields, Roads, Trees, and Canals */}
      <TerrainAndFields
        onSelectPOI={onSelectPOI}
        soilCutawayOpen={currentStepInfo.soilVisible}
      />

      {/* 3. Underground Geological Strata & Root Zone */}
      <UndergroundSoil
        visible={currentStepInfo.soilVisible}
        activeScan={currentStepInfo.key === 'AI_SCAN'}
        irrigationFlow={currentStepInfo.irrigationFlow}
        growthProgress={growthProgress}
      />

      {/* 4. Instanced Multi-Zone Crop Fields with Growth & Wind */}
      <CropFields
        growthProgress={growthProgress}
        harvestProgress={currentStepInfo.harvestProgress}
        droneScanning={currentStepInfo.droneScanning}
      />

      {/* 5. Smart Infrastructure (Farmhouse, Greenhouse, Solar, Water Tank, Wind Turbines, Weather Station) */}
      <SmartInfrastructure onSelectPOI={onSelectPOI} />

      {/* 6. Farm Machinery & Mahindra Tractor */}
      <MachineryAndTractor
        tractorActive={currentStepInfo.tractorActive}
        onSelectPOI={onSelectPOI}
      />

      {/* 7. Automated Smart Drip Irrigation System */}
      <SmartIrrigationSystem
        active={currentStepInfo.irrigationFlow}
        onSelectPOI={onSelectPOI}
      />

      {/* 8. Autonomous Agriculture Hexacopter Drone */}
      <AutonomousDrone
        scanning={currentStepInfo.droneScanning}
        onSelectPOI={onSelectPOI}
      />

      {/* 9. Holographic AI Intelligence Core & Scan Laser Sweep */}
      <AIScanningEffects activeScan={currentStepInfo.key === 'AI_SCAN'} />

      {/* 10. Dynamic Rain & Thunderstorm Particle Simulation */}
      <WeatherEffects weather={weather} />

      {/* 11. 3D Supply Chain & Market Route */}
      <LogisticsAndMarket active={currentStepInfo.marketActive} />

      {/* 12. 3D Financial Profit Pillars & Gold Coin Particles */}
      <ProfitVisualizer3D active={currentStepInfo.profitActive} />

      {/* 13. Camera Controller with Smooth Lerping */}
      <CameraController
        targetPos={currentStepInfo.cameraPos}
        lookAtTarget={currentStepInfo.cameraTarget}
        cameraMode={cameraMode}
        freeOrbitEnabled={freeOrbit}
      />
    </>
  );
};
