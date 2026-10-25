import { createSlice } from '@reduxjs/toolkit';

export const DEFAULT_COMPARE_CITIES = [
  { id: 1, name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { id: 2, name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { id: 3, name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { id: 4, name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
];

export const COMPARE_STORAGE_KEY = 'orbitx-compare-cities';

function loadInitialCities() {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return DEFAULT_COMPARE_CITIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COMPARE_CITIES;
  } catch {
    return DEFAULT_COMPARE_CITIES;
  }
}

const compareCitiesSlice = createSlice({
  name: 'compareCities',
  initialState: {
    cities: loadInitialCities(),
    maxCities: 4,
  },
  reducers: {
    addCity: (state, action) => {
      const city = action.payload;
      if (!city || !city.name) return;
      const exists = state.cities.some(
        (c) => c.name.toLowerCase() === city.name.toLowerCase()
      );
      if (exists) return;
      if (state.cities.length >= state.maxCities) return;

      const newCity = {
        id: city.id || Date.now(),
        name: city.name,
        country: city.country || 'Global Station',
        latitude: Number(city.latitude ?? city.lat ?? 0),
        longitude: Number(city.longitude ?? city.lon ?? 0),
      };
      state.cities.push(newCity);
    },
    removeCity: (state, action) => {
      const targetId = action.payload;
      state.cities = state.cities.filter((c) => c.id !== targetId && c.name !== targetId);
    },
    clearCities: (state) => {
      state.cities = [];
    },
    resetDefaultCities: (state) => {
      state.cities = DEFAULT_COMPARE_CITIES;
    },
  },
});

export const { addCity, removeCity, clearCities, resetDefaultCities } = compareCitiesSlice.actions;
export const compareCitiesReducer = compareCitiesSlice.reducer;
