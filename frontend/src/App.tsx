import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';
import { StartupAnimation } from './components/startup/StartupAnimation';

export function App() {
  const [showStartup, setShowStartup] = useState<boolean>(() => {
    // Check if animation has already played in this browser session
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('intro') || params.has('replay')) {
        return true;
      }
      // Re-trigger if user reloaded the landing page
      const navEntry = window.performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
      if (navEntry?.type === 'reload' && (window.location.pathname === '/' || window.location.pathname === '/home')) {
        return true;
      }
    }
    const hasPlayed = sessionStorage.getItem('agrivision_intro_played');
    return !hasPlayed;
  });

  const handleStartupComplete = () => {
    sessionStorage.setItem('agrivision_intro_played', 'true');
    setShowStartup(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          {/* Startup Intro Splash Animation */}
          {showStartup && (
            <StartupAnimation onComplete={handleStartupComplete} durationMs={3200} />
          )}

          {/* Main AgriVision Platform Application */}
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
