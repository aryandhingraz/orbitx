import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    showToast: (state, action) => {
      const payload = action.payload;
      const toast = typeof payload === 'string'
        ? { id: Date.now() + Math.random(), message: payload, type: 'info', duration: 3500 }
        : {
            id: payload.id || Date.now() + Math.random(),
            message: payload.message || '',
            type: payload.type || 'info', // 'success' | 'sale' | 'info'
            duration: payload.duration || 3500,
          };
      // Keep max 5 toasts visible at any time
      state.toasts = [...state.toasts.slice(-4), toast];
    },
    dismissToast: (state, action) => {
      const targetId = action.payload;
      state.toasts = state.toasts.filter((t) => t.id !== targetId);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { showToast, dismissToast, clearAllToasts } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
