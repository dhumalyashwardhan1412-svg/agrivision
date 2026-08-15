import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { StartupAnimation } from './components/startup/StartupAnimation';

export function App() {
  const [showStartup, setShowStartup] = useState<boolean>(() => {
    // Check if animation has already played in this browser session
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
        {/* Startup Intro Splash Animation */}
        {showStartup && (
          <StartupAnimation onComplete={handleStartupComplete} durationMs={3200} />
        )}

        {/* Main AgriVision Platform Application */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
