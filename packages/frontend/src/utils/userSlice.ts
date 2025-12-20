import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
}

const initialState: UserState = {
  id: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setId(state, action: PayloadAction<string | null>) {
      state.id = action.payload;
    },
  },
});

export const { setId } = userSlice.actions;
export default userSlice.reducer;
