import { configureStore } from '@reduxjs/toolkit';
import { compareCitiesReducer, COMPARE_STORAGE_KEY } from './compareCitiesSlice.js';
import { uiReducer } from './uiSlice.js';

export const store = configureStore({
  reducer: {
    compareCities: compareCitiesReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production' || true, // Enable DevTools for viva demonstration
});

// Subscribe to store updates to persist compareCities to localStorage
store.subscribe(() => {
  try {
    const state = store.getState();
    const cities = state.compareCities.cities;
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(cities));
  } catch (err) {
    console.warn('Could not persist compare cities to localStorage:', err);
  }
});
