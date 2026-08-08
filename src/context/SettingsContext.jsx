import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'orbitx-settings';

const defaults = {
  units: 'metric',        // "metric" (°C, km/h) | "imperial" (°F, mph)
  theme: 'auto',          // "auto" | "day" | "night"
  refreshRate: 'live',    // "live" | "balanced" | "battery-saver"
  defaultCity: null,      // { name, lat, lon } or null -> default to geolocation
  soundEnabled: true,     // Web Audio synthesizer feedback
};

const SettingsContext = createContext(defaults);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults; // Corrupted localStorage must never crash the app
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save orbitx settings to localStorage', e);
    }
  }, [settings]);

  // Apply data-theme attribute on documentElement
  useEffect(() => {
    let resolvedTheme = settings.theme;
    if (settings.theme === 'auto') {
      const hour = new Date().getHours();
      resolvedTheme = hour >= 6 && hour < 18 ? 'day' : 'night';
    }

    if (resolvedTheme === 'day') {
      document.documentElement.setAttribute('data-theme', 'day');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function resetSettings() {
    setSettings(defaults);
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
