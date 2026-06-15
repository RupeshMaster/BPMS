import { createSlice } from '@reduxjs/toolkit';

const getInitialSession = () => {
  const localUser = localStorage.getItem('bp_user');
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch {
      localStorage.removeItem('bp_user');
      localStorage.removeItem('bp_token');
    }
  }
  return null;
};

const initialState = {
  currentSession: getInitialSession(),
  token: localStorage.getItem('bp_token') || null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    loginSession(state, action) {
      const { user, token } = action.payload;
      state.currentSession = user;
      state.token = token;
      
      localStorage.setItem('bp_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('bp_token', token);
      }
    },
    logoutSession(state) {
      state.currentSession = null;
      state.token = null;
      localStorage.removeItem('bp_user');
      localStorage.removeItem('bp_token');
    }
  }
});

export const { loginSession, logoutSession } = sessionSlice.actions;
export default sessionSlice.reducer;
