import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

const SPLASH_MIN_MS = 2200;

function AppContent() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </>
  );
}

const FADEOUT_MS = 400;

function AppWithSplash() {
  const { loading } = useAuth();
  const [phase, setPhase] = useState('splash'); // 'splash' | 'fadeout' | 'app'

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setPhase('fadeout'), SPLASH_MIN_MS);
      return () => clearTimeout(t);
    } else {
      setPhase('splash');
    }
  }, [loading]);

  useEffect(() => {
    if (phase !== 'fadeout') return;
    const t = setTimeout(() => setPhase('app'), FADEOUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'app') return <AppContent />;
  return <SplashScreen fading={phase === 'fadeout'} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppWithSplash />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
