import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FastForward } from 'lucide-react';
import { STORY_STEPS, StoryStepInfo } from '../state/useFarm3DStore';

interface StoryTimelineBarProps {
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const StoryTimelineBar: React.FC<StoryTimelineBarProps> = ({
  currentStepIndex,
  onSelectStep,
  isPlaying,
  onTogglePlay,
  playSpeed,
  onChangeSpeed,
}) => {
  const currentStep = STORY_STEPS[currentStepIndex];

  const handlePrev = () => {
    const nextIdx = (currentStepIndex - 1 + STORY_STEPS.length) % STORY_STEPS.length;
    onSelectStep(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentStepIndex + 1) % STORY_STEPS.length;
    onSelectStep(nextIdx);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-30 flex flex-col gap-3">
      {/* Active Step Caption Pill */}
      <div className="mx-auto bg-slate-950/85 backdrop-blur-xl border border-white/15 px-5 py-2.5 rounded-2xl shadow-2xl text-center flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
        <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
          {currentStep.badge}
        </span>
        <div className="text-left">
          <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            {currentStep.title}: <span className="text-slate-300 font-medium">{currentStep.subtitle}</span>
          </h4>
          <p className="text-[11px] text-slate-400 max-w-xl line-clamp-1 mt-0.5">
            {currentStep.description}
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Scrubber Bar */}
      <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition"
            title={isPlaying ? 'Pause Story' : 'Play Story'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
          </button>

          <button
            onClick={handleNext}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => onChangeSpeed(playSpeed === 1.0 ? 2.0 : playSpeed === 2.0 ? 0.5 : 1.0)}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-300 bg-white/10 hover:bg-white/20 rounded-xl transition"
            title="Playback Speed"
          >
            {playSpeed}x
          </button>
        </div>

        {/* 10-Step Interactive Node Timeline */}
        <div className="flex-1 flex items-center justify-between gap-1 overflow-x-auto px-2">
          {STORY_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex;

            return (
              <button
                key={step.key}
                onClick={() => onSelectStep(idx)}
                className={`group flex-1 flex flex-col items-center gap-1.5 py-1 px-1 rounded-xl transition-all duration-300 relative min-w-[55px] ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-extrabold scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Connecting track line */}
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm shadow-emerald-400/50'
                      : isPassed
                      ? 'bg-emerald-600/70'
                      : 'bg-slate-800'
                  }`}
                />

                <span className="text-[10px] tracking-tight uppercase truncate">
                  {step.title.split(' ')[1] || step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
