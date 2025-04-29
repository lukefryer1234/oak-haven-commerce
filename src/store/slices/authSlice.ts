import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signUpWithEmail, 
  loginWithEmail, 
  loginWithGoogle, 
  loginWithApple, 
  logoutUser, 
  sendPasswordReset,
  auth
} from '../../services/firebase';
import { User, AuthState, UserRole } from '../../types';
import { onAuthStateChanged } from 'firebase/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signUpWithEmail(email, password, displayName);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        role: UserRole.CUSTOMER,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await loginWithEmail(email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogleAuth = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await loginWithGoogle();
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithAppleAuth = createAsyncThunk(
  'auth/loginWithApple',
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await loginWithApple();
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordReset(email);
      return email;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkUserAuth = createAsyncThunk(
  'auth/checkUserAuth',
  async (_, { dispatch }) => {
    return new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          });
        } else {
          resolve(null);
        }
      });
    });
  }
);

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload as User;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload as User;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Google Login
    builder.addCase(loginWithGoogleAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginWithGoogleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload as User;
    });
    builder.addCase(loginWithGoogleAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Apple Login
    builder.addCase(loginWithAppleAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginWithAppleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload as User;
    });
    builder.addCase(loginWithAppleAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check Auth
    builder.addCase(checkUserAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkUserAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(checkUserAuth.rejected, (state) => {
      state.loading = false;
      state.user = null;
    });
  },
});

// Export actions and reducer
export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

