import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => ({
  user: null,
  isAuthenticated: false,
  token: null, 
  isLoading: false,
  error: null
});

const initialState = getInitialState();

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
     userLoggedOut: (state) => {
      Object.assign(state, getInitialState());
  
    },
  },
});

export const {userLoggedIn, userLoggedOut} = authSlice.actions;
export default authSlice.reducer;
