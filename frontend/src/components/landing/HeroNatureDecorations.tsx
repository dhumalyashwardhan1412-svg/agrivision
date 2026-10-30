import React, { useState, useEffect } from 'react';

/**
 * HeroNatureDecorations
 *
 * "From Seed to Smart Agriculture"
 *
 * Premium, nature-inspired visual decorations around the AGRIVISION title:
 * 1. Living Grass Growth: Blades begin at ground level and visibly sprout upward
 *    with staggered spring delays, followed by continuous living breeze sway.
 * 2. Golden Wheat Stalks: Rich ears of golden wheat rising in the right cluster,
 *    symbolizing harvest and agricultural prosperity.
 * 3. Delicate Sprouting Leaves: Organic leaflets expanding from the stems.
 * 4. Floating Seeds & Leaves: Natural gossamer seeds and green leaves drifting
 *    with continuous bobbing motion and reacting to scroll progress.
 * 5. Grounding Loam & Soft Mist: Organic grounding at the roots connecting grass
 *    seamlessly with the terraced landscape below.
 */
export const HeroNatureDecorations: React.FC = () => {
  const [grown, setGrown] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGrown(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      data-agri-nature-stage
      data-agri-persistent
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
      }}
    >
      <style>{`
        /* Coordinate anchors calculated dynamically by GlyphPortal */
        [data-agri-nature-stage] {
          --stage-left: var(--gp-word-left, calc(50% - min(41vw, 450px)));
          --stage-right: var(--gp-word-right, calc(50% + min(41vw, 450px)));
          --stage-top: var(--gp-word-top, 35%);
          --stage-bottom: var(--gp-word-bottom, 50%);
          will-change: opacity;
        }

        /* ========================================================
           1. LIVING GRASS (LEFT CLUSTER)
           ======================================================== */
        [data-agri-left-grass] {
          position: absolute;
          left: calc(var(--stage-left) - clamp(52px, 5.8vw, 84px));
          top: calc(var(--stage-bottom) - clamp(75px, 8.2vw, 115px));
          width: clamp(120px, 13.5vw, 180px);
          height: clamp(110px, 12.5vw, 165px);
          transform-origin: 52% 96%;
          transform: rotate(calc(var(--gp-progress, 0) * -18deg)) scaleY(calc(1 - var(--gp-progress, 0) * 0.12));
          will-change: transform;
          z-index: 5;
        }

        .agri-left-grass-sway {
          width: 100%;
          height: 100%;
          transform-origin: 52% 96%;
          animation: agriLeftGrassWind 3.6s ease-in-out infinite alternate;
        }

        @keyframes agriLeftGrassWind {
          0% {
            transform: rotate(-6.0deg) skewX(-1.5deg);
          }
          45% {
            transform: rotate(1.0deg) skewX(0.4deg);
          }
          75% {
            transform: rotate(4.5deg) skewX(1.2deg);
          }
          100% {
            transform: rotate(6.5deg) skewX(1.8deg);
          }
        }

        /* Blade Growth Animations */
        .blade-growing {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: agriBladeSproutUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .blade-idle-hidden {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          transform: scaleY(0.01) scaleX(0.6);
          opacity: 0;
        }

        @keyframes agriBladeSproutUp {
          0% {
            transform: scaleY(0.01) scaleX(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          75% {
            transform: scaleY(1.06) scaleX(1.02);
          }
          100% {
            transform: scaleY(1) scaleX(1);
            opacity: 1;
          }
        }

        /* Staggered Delays for Left Blades */
        .blade-left-1 { animation-delay: 0.10s; }
        .blade-left-2 { animation-delay: 0.20s; }
        .blade-left-3 { animation-delay: 0.30s; }
        .blade-left-4 { animation-delay: 0.40s; }
        .blade-left-5 { animation-delay: 0.50s; }
        .blade-left-6 { animation-delay: 0.60s; }
        .blade-left-7 { animation-delay: 0.70s; }
        .blade-left-back { animation-delay: 0.25s; }

        /* ========================================================
           2. LIVING GRASS & WHEAT (RIGHT CLUSTER)
           ======================================================== */
        [data-agri-right-grass] {
          position: absolute;
          left: calc(var(--stage-right) - clamp(28px, 3.2vw, 48px));
          top: calc(var(--stage-bottom) - clamp(95px, 10.5vw, 145px));
          width: clamp(135px, 15vw, 200px);
          height: clamp(130px, 14vw, 190px);
          transform-origin: 32% 96%;
          transform: rotate(calc(var(--gp-progress, 0) * 20deg)) scaleY(calc(1 - var(--gp-progress, 0) * 0.12));
          will-change: transform;
          z-index: 5;
        }

        .agri-right-grass-sway {
          width: 100%;
          height: 100%;
          transform-origin: 32% 96%;
          animation: agriRightGrassWind 3.8s ease-in-out 0.4s infinite alternate;
        }

        @keyframes agriRightGrassWind {
          0% {
            transform: rotate(-5.0deg) skewX(-1.2deg);
          }
          40% {
            transform: rotate(1.2deg) skewX(0.5deg);
          }
          80% {
            transform: rotate(5.8deg) skewX(1.5deg);
          }
          100% {
            transform: rotate(7.5deg) skewX(2.0deg);
          }
        }

        /* Wheat Stalk Delays */
        .wheat-stalk-1 { animation-delay: 0.35s; }
        .wheat-stalk-2 { animation-delay: 0.48s; }
        .wheat-stalk-3 { animation-delay: 0.60s; }

        .stem-right-main { animation-delay: 0.40s; }
        .stem-right-back { animation-delay: 0.30s; }
        .blade-right-base1 { animation-delay: 0.52s; }
        .blade-right-base2 { animation-delay: 0.65s; }

        /* Leaves Unfurling */
        .leaf-unfurling {
          transform-box: fill-box;
          transform-origin: 0% 100%;
          animation: agriLeafUnfurl 1.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .leaf-idle-hidden {
          transform-box: fill-box;
          transform-origin: 0% 100%;
          transform: scale(0.01) rotate(-35deg);
          opacity: 0;
        }

        @keyframes agriLeafUnfurl {
          0% {
            transform: scale(0.01) rotate(-35deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .leaf-right-1 { animation-delay: 0.65s; }
        .leaf-right-2 { animation-delay: 0.78s; }
        .leaf-right-3 { animation-delay: 0.50s; }

        /* Subtle Leaf Flutter in Wind */
        .leaf-flutter-1 {
          animation: leafFlutterA 2.9s ease-in-out 0.8s infinite alternate;
          transform-origin: 20% 80%;
        }
        .leaf-flutter-2 {
          animation: leafFlutterB 3.3s ease-in-out 1.1s infinite alternate;
          transform-origin: 15% 85%;
        }

        @keyframes leafFlutterA {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(5.5deg) scale(1.02); }
        }
        @keyframes leafFlutterB {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(-6deg) scale(0.98); }
        }

        /* ========================================================
           3. FLOATING SEEDS & LEAVES ANIMATIONS
           ======================================================== */
        .agri-floating-seed-inner-1 {
          width: clamp(14px, 1.8vw, 22px);
          height: clamp(18px, 2.3vw, 28px);
          animation: seedDriftA 6.8s ease-in-out infinite alternate;
          filter: drop-shadow(0 4px 6px rgba(11, 59, 42, 0.25));
        }

        @keyframes seedDriftA {
          0% {
            transform: translateY(0) translateX(0) rotate(-4deg);
          }
          50% {
            transform: translateY(-16px) translateX(12px) rotate(8deg);
          }
          100% {
            transform: translateY(-30px) translateX(-6px) rotate(-8deg);
          }
        }

        .agri-floating-leaf-inner-2 {
          width: clamp(20px, 2.4vw, 32px);
          height: clamp(22px, 2.6vw, 36px);
          animation: leafDriftB 7.5s ease-in-out 0.8s infinite alternate;
          filter: drop-shadow(0 6px 10px rgba(7, 31, 22, 0.3));
        }

        @keyframes leafDriftB {
          0% {
            transform: translateY(0) translateX(0) rotate(12deg);
          }
          50% {
            transform: translateY(-22px) translateX(-14px) rotate(-10deg);
          }
          100% {
            transform: translateY(-38px) translateX(8px) rotate(18deg);
          }
        }

        .agri-floating-seed-inner-3 {
          width: clamp(14px, 1.6vw, 20px);
          height: clamp(15px, 1.7vw, 22px);
          animation: seedDriftC 8.2s ease-in-out 1.5s infinite alternate;
          filter: drop-shadow(0 3px 6px rgba(11, 59, 42, 0.2));
        }

        @keyframes seedDriftC {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) translateX(16px) rotate(14deg);
          }
          100% {
            transform: translateY(-32px) translateX(4px) rotate(-10deg);
          }
        }

        .agri-floating-leaf-inner-4 {
          width: clamp(18px, 2.2vw, 28px);
          height: clamp(20px, 2.4vw, 32px);
          animation: leafDriftD 7.0s ease-in-out 2.0s infinite alternate;
          filter: drop-shadow(0 5px 8px rgba(7, 31, 22, 0.25));
        }

        @keyframes leafDriftD {
          0% {
            transform: translateY(0) translateX(0) rotate(-15deg);
          }
          50% {
            transform: translateY(-20px) translateX(15px) rotate(5deg);
          }
          100% {
            transform: translateY(-35px) translateX(-10px) rotate(-22deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agri-left-grass-sway,
          .agri-right-grass-sway,
          .blade-growing,
          .leaf-unfurling,
          .leaf-flutter-1,
          .leaf-flutter-2,
          .agri-floating-seed-inner-1,
          .agri-floating-leaf-inner-2,
          .agri-floating-seed-inner-3,
          .agri-floating-leaf-inner-4 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ========================================================
          1. ENHANCED LIVING GRASS (LEFT CLUSTER)
          ======================================================== */}
      <div data-agri-left-grass>
        <div className="agri-left-grass-sway">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="blade-left-grad-1" x1="45" y1="92" x2="16" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0b3b2a" />
                <stop offset="35%" stopColor="#15803d" />
                <stop offset="80%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
              <linearGradient id="blade-left-grad-2" x1="48" y1="92" x2="30" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#071f16" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="blade-left-grad-3" x1="44" y1="92" x2="10" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0b3b2a" />
                <stop offset="55%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="blade-left-grad-4" x1="50" y1="92" x2="68" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14573f" />
                <stop offset="55%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
              <linearGradient id="blade-left-grad-5" x1="47" y1="92" x2="42" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14573f" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="blade-left-grad-6" x1="46" y1="92" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#093520" />
                <stop offset="60%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
              <linearGradient id="blade-left-grad-7" x1="52" y1="92" x2="78" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d4528" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="blade-left-grad-back" x1="46" y1="92" x2="12" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#041a10" />
                <stop offset="60%" stopColor="#0b3b2a" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>

            {/* Soft grounding mist & loam */}
            <ellipse cx="48" cy="93" rx="28" ry="6" fill="rgba(254, 254, 254, 0.45)" filter="blur(3px)" />
            <ellipse cx="48" cy="93" rx="22" ry="4" fill="rgba(7, 31, 22, 0.22)" />
            <ellipse cx="48" cy="92.5" rx="14" ry="2.5" fill="rgba(7, 31, 22, 0.45)" />

            {/* Back blade: Deep shadow silhouette */}
            <g className={grown ? 'blade-growing blade-left-back' : 'blade-idle-hidden'}>
              <path
                d="M45 92 C38 68 24 38 12 18 C11 16.5 11.5 17 12.2 18 C17 27 30 60 48 92 Z"
                fill="url(#blade-left-grad-back)"
                opacity="0.85"
              />
            </g>

            {/* Blade 6: Tall back blade arching left */}
            <g className={grown ? 'blade-growing blade-left-6' : 'blade-idle-hidden'}>
              <path
                d="M44 92 C36 65 26 35 15 15 C14 13.5 14.5 14 15.2 15 C22 28 35 62 47 92 Z"
                fill="url(#blade-left-grad-6)"
                opacity="0.9"
              />
            </g>

            {/* Blade 3: Low curved left blade */}
            <g className={grown ? 'blade-growing blade-left-3' : 'blade-idle-hidden'}>
              <path
                d="M43 92 C32 86 18 74 8 55 C6.5 52 6 50 6.5 51 C8 54 22 76 46 92 Z"
                fill="url(#blade-left-grad-3)"
              />
            </g>

            {/* Blade 1: Tallest graceful curving blade */}
            <g className={grown ? 'blade-growing blade-left-1' : 'blade-idle-hidden'}>
              <path
                d="M45 92 C41 68 28 35 16 11 C15 9.5 14.8 9.8 15.5 10.5 C19 16 34 56 49 92 Z"
                fill="url(#blade-left-grad-1)"
              />
            </g>

            {/* Blade 2: Medium inner curved blade */}
            <g className={grown ? 'blade-growing blade-left-2' : 'blade-idle-hidden'}>
              <path
                d="M46 92 C43 70 36 48 28 28 C27.2 26 27 26.5 27.8 27.5 C31 33 40 62 50 92 Z"
                fill="url(#blade-left-grad-2)"
              />
            </g>

            {/* Blade 4: Fresh right-leaning blade */}
            <g className={grown ? 'blade-growing blade-left-4' : 'blade-idle-hidden'}>
              <path
                d="M48 92 C51 72 58 56 67 40 C68 38.5 67.5 39 66.8 40 C61 54 54 72 51 92 Z"
                fill="url(#blade-left-grad-4)"
              />
            </g>

            {/* Blade 7: Lower right arching shoot */}
            <g className={grown ? 'blade-growing blade-left-7' : 'blade-idle-hidden'}>
              <path
                d="M50 92 C56 80 66 68 76 52 C77 50.5 76.5 51 75.8 52 C68 64 58 78 52 92 Z"
                fill="url(#blade-left-grad-7)"
              />
            </g>

            {/* Blade 5: Tiny young center shoot */}
            <g className={grown ? 'blade-growing blade-left-5' : 'blade-idle-hidden'}>
              <path
                d="M47 92 C46 80 44 70 42 61 C41.7 60 42 60.3 42.5 61.2 C45 66 48 78 49 92 Z"
                fill="url(#blade-left-grad-5)"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* ========================================================
          2. ENHANCED LIVING GRASS & WHEAT (RIGHT CLUSTER)
          ======================================================== */}
      <div data-agri-right-grass>
        <div className="agri-right-grass-sway">
          <svg
            viewBox="0 0 110 115"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="wheat-gold-1" x1="42" y1="60" x2="72" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id="wheat-gold-2" x1="50" y1="70" x2="88" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="stem-right-grad-main" x1="32" y1="105" x2="65" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0b3b2a" />
                <stop offset="45%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="stem-right-grad-back" x1="30" y1="105" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#071f16" />
                <stop offset="100%" stopColor="#14573f" />
              </linearGradient>
              <linearGradient id="leaf-grad-1" x1="44" y1="68" x2="88" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="55%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="leaf-grad-2" x1="52" y1="42" x2="82" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="65%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
              <linearGradient id="blade-right-grad-base1" x1="30" y1="105" x2="12" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14573f" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="blade-right-grad-base2" x1="35" y1="105" x2="56" y2="76" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>

            {/* Soft grounding mist & shadow */}
            <ellipse cx="36" cy="106" rx="30" ry="7" fill="rgba(254, 254, 254, 0.45)" filter="blur(3.5px)" />
            <ellipse cx="36" cy="106" rx="24" ry="4.5" fill="rgba(7, 31, 22, 0.22)" />
            <ellipse cx="36" cy="105.5" rx="14" ry="2.8" fill="rgba(7, 31, 22, 0.45)" />

            {/* Base blade 1: Arching leftward away from letters */}
            <g className={grown ? 'blade-growing blade-right-base1' : 'blade-idle-hidden'}>
              <path
                d="M32 105 C28 88 20 74 12 58 C11.2 56.5 11.8 57 12.5 58 C18 68 28 88 34 105 Z"
                fill="url(#blade-right-grad-base1)"
              />
            </g>

            {/* Base blade 2: Low arch to right */}
            <g className={grown ? 'blade-growing blade-right-base2' : 'blade-idle-hidden'}>
              <path
                d="M34 105 C40 92 50 82 62 72 C63 71 62.5 71.8 61.5 72.8 C52 82 42 94 36 105 Z"
                fill="url(#blade-right-grad-base2)"
              />
            </g>

            {/* Back stem: Depth shadow */}
            <g className={grown ? 'blade-growing stem-right-back' : 'blade-idle-hidden'}>
              <path
                d="M30 105 C33 78 44 48 58 24 C58.8 23 58.5 23.5 58 24.5 C46 48 37 78 33 105 Z"
                fill="url(#stem-right-grad-back)"
                opacity="0.75"
              />
            </g>

            {/* Main Central Stem */}
            <g className={grown ? 'blade-growing stem-right-main' : 'blade-idle-hidden'}>
              <path
                d="M32 105 C36 76 48 44 68 15 C68.8 13.8 68.4 14.2 67.8 15.2 C52 44 40 76 35 105 Z"
                fill="url(#stem-right-grad-main)"
              />
            </g>

            {/* Leaf 3: Low sprout leaflet */}
            <g className={grown ? 'leaf-unfurling leaf-right-3' : 'leaf-idle-hidden'}>
              <path
                d="M40 85 C46 80 54 78 60 76 C61 75.5 60.5 76.2 59.5 77 C53 80 47 83 42 86 Z"
                fill="#22c55e"
                opacity="0.9"
              />
            </g>

            {/* Leaf 1: Mid-stem delicate leaf expanding right */}
            <g className={grown ? 'leaf-unfurling leaf-right-1' : 'leaf-idle-hidden'}>
              <g className="leaf-flutter-1">
                <path
                  d="M46 66 C56 58 72 54 90 52 C91 51.8 90.2 53 88.5 54.5 C74 65 60 67 48 68 Z"
                  fill="url(#leaf-grad-1)"
                />
                <path
                  d="M47 66.5 C60 60 74 56 87 53"
                  stroke="#14573f"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </g>
            </g>

            {/* Leaf 2: Higher delicate leaf arching outward */}
            <g className={grown ? 'leaf-unfurling leaf-right-2' : 'leaf-idle-hidden'}>
              <g className="leaf-flutter-2">
                <path
                  d="M54 42 C62 33 73 28 85 24 C86 23.6 85.5 24.4 84 25.8 C71 34 64 39 56 44 Z"
                  fill="url(#leaf-grad-2)"
                />
                <path
                  d="M55 42.5 C65 35 74 30 82 25.5"
                  stroke="#14573f"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </g>
            </g>

            {/* =====================================================
                GOLDEN WHEAT STALKS (SIGNATURE AGRICULTURAL MOTIF)
                ===================================================== */}
            {/* Wheat Stalk 1: Primary tall golden ear */}
            <g className={grown ? 'blade-growing wheat-stalk-1' : 'blade-idle-hidden'}>
              {/* Golden Wheat Stem */}
              <path
                d="M34 105 C38 82 52 52 68 22"
                stroke="#ca8a04"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Alternating Golden Wheat Spikelets / Grains */}
              <g>
                <ellipse cx="64" cy="36" rx="3.5" ry="7" transform="rotate(24 64 36)" fill="url(#wheat-gold-1)" />
                <ellipse cx="69" cy="32" rx="3.5" ry="7" transform="rotate(-18 69 32)" fill="url(#wheat-gold-1)" />
                <ellipse cx="67" cy="26" rx="3.2" ry="6.5" transform="rotate(22 67 26)" fill="url(#wheat-gold-1)" />
                <ellipse cx="72" cy="22" rx="3.2" ry="6.5" transform="rotate(-16 72 22)" fill="url(#wheat-gold-1)" />
                <ellipse cx="70" cy="16" rx="2.8" ry="6" transform="rotate(20 70 16)" fill="url(#wheat-gold-1)" />
                <ellipse cx="74" cy="12" rx="2.8" ry="6" transform="rotate(-15 74 12)" fill="url(#wheat-gold-1)" />
                <ellipse cx="73" cy="7" rx="2.4" ry="5.5" transform="rotate(10 73 7)" fill="url(#wheat-gold-1)" />
                {/* Golden Whisker Awns */}
                <line x1="64" y1="31" x2="56" y2="20" stroke="#eab308" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="69" y1="27" x2="78" y2="16" stroke="#eab308" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="67" y1="21" x2="60" y2="10" stroke="#facc15" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="72" y1="17" x2="82" y2="7" stroke="#facc15" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="73" y1="5" x2="76" y2="-4" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
              </g>
            </g>

            {/* Wheat Stalk 2: Secondary golden stalk leaning right */}
            <g className={grown ? 'blade-growing wheat-stalk-2' : 'blade-idle-hidden'}>
              <path
                d="M36 105 C42 88 58 64 78 38"
                stroke="#b45309"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <g>
                <ellipse cx="73" cy="50" rx="3" ry="6" transform="rotate(32 73 50)" fill="url(#wheat-gold-2)" />
                <ellipse cx="78" cy="46" rx="3" ry="6" transform="rotate(-12 78 46)" fill="url(#wheat-gold-2)" />
                <ellipse cx="77" cy="40" rx="2.8" ry="5.5" transform="rotate(30 77 40)" fill="url(#wheat-gold-2)" />
                <ellipse cx="82" cy="36" rx="2.8" ry="5.5" transform="rotate(-10 82 36)" fill="url(#wheat-gold-2)" />
                <ellipse cx="81" cy="30" rx="2.5" ry="5" transform="rotate(25 81 30)" fill="url(#wheat-gold-2)" />
                <ellipse cx="84" cy="25" rx="2.2" ry="4.5" transform="rotate(12 84 25)" fill="url(#wheat-gold-2)" />
                {/* Awns */}
                <line x1="73" y1="46" x2="66" y2="36" stroke="#eab308" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="78" y1="42" x2="87" y2="33" stroke="#eab308" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="84" y1="23" x2="90" y2="14" stroke="#fde047" strokeWidth="0.8" strokeLinecap="round" />
              </g>
            </g>

            {/* Wheat Stalk 3: Graceful golden stalk behind */}
            <g className={grown ? 'blade-growing wheat-stalk-3' : 'blade-idle-hidden'}>
              <path
                d="M35 105 C38 85 48 62 60 40"
                stroke="#ca8a04"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.85"
              />
              <g opacity="0.85">
                <ellipse cx="57" cy="52" rx="2.6" ry="5" transform="rotate(18 57 52)" fill="url(#wheat-gold-1)" />
                <ellipse cx="61" cy="48" rx="2.6" ry="5" transform="rotate(-15 61 48)" fill="url(#wheat-gold-1)" />
                <ellipse cx="59" cy="42" rx="2.4" ry="4.5" transform="rotate(16 59 42)" fill="url(#wheat-gold-1)" />
                <ellipse cx="63" cy="38" rx="2.2" ry="4" transform="rotate(8 63 38)" fill="url(#wheat-gold-1)" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ========================================================
          3. FLOATING SEEDS & LEAVES (PARALLAX + FLOAT)
          ======================================================== */}
      {/* Seed 1: Gossamer winged seed (Rising from left grass) */}
      <div
        data-agri-seed-wrapper-1
        style={{
          position: 'absolute',
          left: 'calc(var(--stage-left) - clamp(20px, 3.0vw, 48px))',
          top: 'calc(var(--stage-top) - clamp(24px, 3.6vw, 48px))',
          transform: 'translateY(calc(var(--gp-progress, 0) * -280px)) translateX(calc(var(--gp-progress, 0) * -35px))',
          willChange: 'transform',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <div className="agri-floating-seed-inner-1">
          <svg viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="9" cy="18" rx="1.8" ry="3" fill="#14573f" />
            <ellipse cx="9" cy="18" rx="1" ry="2" fill="#22c55e" opacity="0.8" />
            <line x1="9" y1="15" x2="9" y2="7" stroke="#16a34a" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M9 7 C6 4 3 2 1 1" stroke="#4ade80" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
            <path d="M9 7 C9 3 9 1 9 0" stroke="#86efac" strokeWidth="0.7" strokeLinecap="round" opacity="0.9" />
            <path d="M9 7 C12 4 15 2 17 1" stroke="#4ade80" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* Leaf 2: Floating young emerald leaf (Drifting upper right) */}
      <div
        data-agri-seed-wrapper-2
        style={{
          position: 'absolute',
          left: 'calc(var(--stage-right) + clamp(10px, 1.8vw, 28px))',
          top: 'calc(var(--stage-top) - clamp(32px, 4.2vw, 58px))',
          transform: 'translateY(calc(var(--gp-progress, 0) * -310px)) translateX(calc(var(--gp-progress, 0) * 40px))',
          willChange: 'transform',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <div className="agri-floating-leaf-inner-2">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="leaf2-grad" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
            </defs>
            <path
              d="M4 20 C4 11 10 4 20 4 C18 12 12 20 4 20 Z"
              fill="url(#leaf2-grad)"
            />
            <path
              d="M5 19 C10 13 15 8 19 5"
              stroke="#0b3b2a"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Seed 3: Floating twin samara / seed pod */}
      <div
        data-agri-seed-wrapper-3
        style={{
          position: 'absolute',
          left: 'calc(var(--stage-right) + clamp(35px, 4.5vw, 68px))',
          top: 'calc(var(--stage-top) + clamp(15px, 2.2vw, 34px))',
          transform: 'translateY(calc(var(--gp-progress, 0) * -290px)) rotate(calc(var(--gp-progress, 0) * 50deg))',
          willChange: 'transform',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <div className="agri-floating-seed-inner-3">
          <svg viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="samara-grad" x1="8" y1="14" x2="14" y2="2" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>
            </defs>
            <circle cx="8" cy="13.5" r="1.9" fill="#14573f" />
            <circle cx="8" cy="13.5" r="1.2" fill="#4ade80" />
            <path
              d="M8 12 C8.5 7.5 11 3.5 14.5 2 C14 6.5 11.5 11 8 12 Z"
              fill="url(#samara-grad)"
              opacity="0.85"
            />
            <path
              d="M8 12 C7.5 7.5 5 3.5 1.5 2 C2 6.5 4.5 11 8 12 Z"
              fill="url(#samara-grad)"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>

      {/* Leaf 4: Floating fresh leaf on far left */}
      <div
        data-agri-seed-wrapper-4
        style={{
          position: 'absolute',
          left: 'calc(var(--stage-left) - clamp(50px, 6.5vw, 95px))',
          top: 'calc(var(--stage-top) + clamp(8px, 1.4vw, 20px))',
          transform: 'translateY(calc(var(--gp-progress, 0) * -260px)) translateX(calc(var(--gp-progress, 0) * -25px))',
          willChange: 'transform',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <div className="agri-floating-leaf-inner-4">
          <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="leaf4-grad" x1="3" y1="19" x2="19" y2="3" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="60%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#bbf7d0" />
              </linearGradient>
            </defs>
            <path
              d="M3 19 C3 11 9 4 19 3 C17 11 11 19 3 19 Z"
              fill="url(#leaf4-grad)"
            />
            <path
              d="M4 18 C9 12 14 8 18 4"
              stroke="#0b3b2a"
              strokeWidth="0.7"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroNatureDecorations;
