import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  STORY_STEPS,
  StoryStepKey,
  WeatherType,
  CameraMode,
  POIType,
} from './state/useFarm3DStore';
import { FarmScene } from './scene/FarmScene';
import { StoryTimelineBar } from './ui/StoryTimelineBar';
import { CinematicHUD } from './ui/CinematicHUD';
import { WeatherControlPanel } from './ui/WeatherControlPanel';
import { ViewportControls } from './ui/ViewportControls';
import { InteractiveInspectModal } from './ui/InteractiveInspectModal';
import { farmAudio } from './utils/soundEngine';

export const AgriVision3DExperience: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [weather, setWeather] = useState<WeatherType>('SUNNY');
  const [cameraMode, setCameraMode] = useState<CameraMode>('CINEMATIC');
  const [freeOrbit, setFreeOrbit] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedPOI, setSelectedPOI] = useState<POIType | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentStep = STORY_STEPS[currentStepIndex];

  // Auto-play timer for 10-step cinematic journey
  useEffect(() => {
    if (!isPlaying) return;

    // Step duration in seconds (scaled by playSpeed)
    const baseDurationMs = 7500 / playSpeed;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        const nextIdx = (prev + 1) % STORY_STEPS.length;
        // Trigger step-specific audio effects
        if (soundEnabled) {
          if (STORY_STEPS[nextIdx].key === 'WATER') farmAudio.playWaterDroplet();
          if (STORY_STEPS[nextIdx].key === 'AI_SCAN') farmAudio.playScanBeep();
          if (STORY_STEPS[nextIdx].key === 'PROFIT') farmAudio.playChime();
        }
        return nextIdx;
      });
    }, baseDurationMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playSpeed, soundEnabled]);

  // Handle Step Selection
  const handleSelectStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setCameraMode('CINEMATIC');
    setFreeOrbit(false);

    // Audio cue
    if (soundEnabled) {
      if (STORY_STEPS[index].key === 'WATER') farmAudio.playWaterDroplet();
      if (STORY_STEPS[index].key === 'AI_SCAN') farmAudio.playScanBeep();
      if (STORY_STEPS[index].key === 'PROFIT') farmAudio.playChime();
    }
  }, [soundEnabled]);

  // Toggle Sound Ambience
  const handleToggleSound = useCallback(() => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    farmAudio.setEnabled(nextState);
  }, [soundEnabled]);

  // Toggle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Handle POI Selection
  const handleSelectPOI = useCallback((poi: POIType) => {
    setSelectedPOI(poi);
    setIsPlaying(false); // pause auto-play while inspecting
    if (soundEnabled) {
      farmAudio.playScanBeep();
    }
  }, [soundEnabled]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none"
    >
      {/* 1. Master WebGL 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{
          position: currentStep.cameraPos,
          fov: 48,
          near: 0.1,
          far: 250,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <FarmScene
          currentStepInfo={currentStep}
          weather={weather}
          cameraMode={cameraMode}
          growthProgress={currentStep.growthProgress}
          onSelectPOI={handleSelectPOI}
          freeOrbit={freeOrbit}
        />
      </Canvas>

      {/* 2. Top Header Overlay with Weather & Viewport Controls */}
      <header className="absolute top-5 inset-x-0 z-30 px-6 flex items-center justify-between pointer-events-none">
        {/* Left: Weather Simulation Controls */}
        <div className="pointer-events-auto">
          <WeatherControlPanel
            weather={weather}
            onChangeWeather={(w) => setWeather(w)}
          />
        </div>

        {/* Right: Sound, Camera Modes, Orbit, Fullscreen */}
        <div className="pointer-events-auto">
          <ViewportControls
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            cameraMode={cameraMode}
            onChangeCameraMode={(m) => setCameraMode(m)}
            freeOrbit={freeOrbit}
            onToggleFreeOrbit={() => setFreeOrbit((prev) => !prev)}
          />
        </div>
      </header>

      {/* 3. Floating Glassmorphic Telemetry HUD */}
      <CinematicHUD
        currentStep={currentStep}
        weather={weather}
        growthProgress={currentStep.growthProgress}
      />

      {/* 4. Bottom 10-Step Interactive Story Timeline Scrubber */}
      <StoryTimelineBar
        currentStepIndex={currentStepIndex}
        onSelectStep={handleSelectStep}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        playSpeed={playSpeed}
        onChangeSpeed={(s) => setPlaySpeed(s)}
      />

      {/* 5. POI Inspection Detail Modal */}
      <InteractiveInspectModal
        selectedPOI={selectedPOI}
        onClose={() => setSelectedPOI(null)}
      />
    </div>
  );
};
