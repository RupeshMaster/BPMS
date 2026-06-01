import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import dataReducer from './dataSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    data: dataReducer,
  },
});
