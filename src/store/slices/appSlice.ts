import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryZone, CompanySettings } from '../../types';
import { getDocument } from '../../services/firebase';

// Define types for app state
interface AppState {
  loading: boolean;
  error: string | null;
  showPostcodeCheck: boolean;
  postcodeDeliveryResult: {
    postcode: string;
    isDeliverable: boolean | null;
    message: string;
  } | null;
  deliveryZones: DeliveryZone[];
  companyInfo: CompanySettings;
  temporaryClosureNotice: {
    enabled: boolean;
    message: string;
  };
}

// Initial state
const initialState: AppState = {
  loading: false,
  error: null,
  showPostcodeCheck: false,
  postcodeDeliveryResult: null,
  deliveryZones: [],
  companyInfo: {
    name: 'Oak Haven',
    address: '123 Woodland Way, Oakshire, England, OA1 2BC',
    phone: '01234 567890',
    email: 'info@oakhaven.com',
    vatNumber: 'GB123456789',
    regNumber: '12345678',
    socialMedia: {
      facebook: 'https://facebook.com/oakhaven',
      instagram: 'https://instagram.com/oakhaven',
      twitter: 'https://twitter.com/oakhaven',
      pinterest: 'https://pinterest.com/oakhaven'
    },
    temporaryClosureNotice: {
      enabled: false,
      message: ''
    }
  },
  temporaryClosureNotice: {
    enabled: false,
    message: 'Our workshop is currently closed for the holiday period. We will reopen on January 5th.'
  }
};

// Async thunks
export const fetchDeliveryZones = createAsyncThunk(
  'app/fetchDeliveryZones',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would fetch from Firestore
      // This is a placeholder implementation
      return [
        {
          id: '1',
          name: 'Mainland England',
          postcodes: ['^[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}$'],
          isAvailable: true
        },
        {
          id: '2',
          name: 'Wales',
          postcodes: ['^(CF|LL|NP|SA|SY)[0-9]{1,2} ?[0-9][A-Za-z]{2}$'],
          isAvailable: true
        }
      ] as DeliveryZone[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompanySettings = createAsyncThunk(
  'app/fetchCompanySettings',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would fetch from Firestore
      // This is a placeholder implementation
      return {
        name: 'Oak Haven',
        address: '123 Woodland Way, Oakshire, England, OA1 2BC',
        phone: '01234 567890',
        email: 'info@oakhaven.com',
        vatNumber: 'GB123456789',
        regNumber: '12345678',
        socialMedia: {
          facebook: 'https://facebook.com/oakhaven',
          instagram: 'https://instagram.com/oakhaven',
          twitter: 'https://twitter.com/oakhaven',
          pinterest: 'https://pinterest.com/oakhaven'
        },
        temporaryClosureNotice: {
          enabled: false,
          message: 'Our workshop is currently closed for the holiday period. We will reopen on January 5th.'
        }
      } as CompanySettings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkPostcodeDelivery = createAsyncThunk(
  'app/checkPostcodeDelivery',
  async (postcode: string, { getState, rejectWithValue }) => {
    try {
      // Get delivery zones from state
      const state = getState() as { app: AppState };
      const { deliveryZones } = state.app;
      
      // Clean the postcode (remove spaces, uppercase)
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      
      // Check if postcode matches any delivery zone
      let isDeliverable = false;
      
      for (const zone of deliveryZones) {
        if (!zone.isAvailable) continue;
        
        for (const pattern of zone.postcodes) {
          const regex = new RegExp(pattern);
          if (regex.test(cleanPostcode)) {
            isDeliverable = true;
            break;
          }
        }
        
        if (isDeliverable) break;
      }
      
      return {
        postcode: cleanPostcode,
        isDeliverable,
        message: isDeliverable 
          ? 'Good news! We deliver to your location.' 
          : 'Sorry, we currently do not deliver to your location. Please use our Custom Enquiry form for assistance.'
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    showPostcodeCheckModal: (state) => {
      state.showPostcodeCheck = true;
    },
    hidePostcodeCheckModal: (state) => {
      state.showPostcodeCheck = false;
    },
    clearPostcodeResult: (state) => {
      state.postcodeDeliveryResult = null;
    },
    setTemporaryClosureNotice: (state, action: PayloadAction<{ enabled: boolean; message: string }>) => {
      state.temporaryClosureNotice = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Delivery Zones
    builder.addCase(fetchDeliveryZones.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDeliveryZones.fulfilled, (state, action) => {
      state.loading = false;
      state.deliveryZones = action.payload;
    });
    builder.addCase(fetchDeliveryZones.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch Company Settings
    builder.addCase(fetchCompanySettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCompanySettings.fulfilled, (state, action) => {
      state.loading = false;
      state.companyInfo = action.payload;
      state.temporaryClosureNotice = action.payload.temporaryClosureNotice;
    });
    builder.addCase(fetchCompanySettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Check Postcode Delivery
    builder.addCase(checkPostcodeDelivery.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.postcodeDeliveryResult = null;
    });
    builder.addCase(checkPostcodeDelivery.fulfilled, (state, action) => {
      state.loading = false;
      state.postcodeDeliveryResult = action.payload;
    });
    builder.addCase(checkPostcodeDelivery.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { 
  setLoading, 
  setError, 
  clearError, 
  showPostcodeCheckModal, 
  hidePostcodeCheckModal,
  clearPostcodeResult,
  setTemporaryClosureNotice
} = appSlice.actions;

export default appSlice.reducer;

