import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase'; // Adjust path if needed
import { RootState, AppDispatch } from '../../store'; // Adjust path if needed
import { fetchCompanySettings } from '../../store/slices/appSlice'; // Import fetch action
import { CompanySettings } from '../../types'; // Assuming type is defined here
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Box, 
  FormControlLabel, 
  Switch,
  Divider 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Define a default empty settings structure matching CompanySettings
const defaultSettings: CompanySettings = {
    name: '',
    address: '',
    phone: '',
    email: '',
    vatNumber: '',
    regNumber: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      pinterest: ''
    },
    temporaryClosureNotice: {
      enabled: false,
      message: ''
    }
};

const AdminSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Select initial data and loading state from app slice
  const initialCompanyInfo = useSelector((state: RootState) => state.app.companyInfo);
  const isLoadingSettings = useSelector((state: RootState) => state.app.loading); // Loading from appSlice

  // Form state initialized with defaults or fetched data
  const [formData, setFormData] = useState<CompanySettings>(initialCompanyInfo || defaultSettings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Update form data if initialCompanyInfo changes (e.g., after initial fetch)
  useEffect(() => {
    if (initialCompanyInfo) {
      setFormData(initialCompanyInfo);
    }
  }, [initialCompanyInfo]);

  // --- Change Handlers ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveSuccess(false); // Clear success message on change
  };

  const handleSocialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target; // name will be 'facebook', 'instagram' etc.
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value,
      },
    }));
     setSaveSuccess(false);
  };

  const handleClosureChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked, type } = event.target;
     setFormData(prev => ({
      ...prev,
      temporaryClosureNotice: {
        ...prev.temporaryClosureNotice,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
     setSaveSuccess(false);
  };
  
   const handleClosureSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const { checked } = event.target;
     setFormData(prev => ({
      ...prev,
      temporaryClosureNotice: {
        ...prev.temporaryClosureNotice,
        enabled: checked,
      },
    }));
     setSaveSuccess(false);
  };


  // --- Save Handler ---
  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const settingsRef = doc(db, 'settings', 'siteConfig');
      // Use setDoc with merge to create or update the document
      await setDoc(settingsRef, formData, { merge: true }); 
      setSaveSuccess(true);
      // Optionally re-fetch settings to confirm update in Redux store
      // dispatch(fetchCompanySettings()); // Consider if needed vs. relying on listeners
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Logic ---
   if (isLoadingSettings && !initialCompanyInfo) { // Show loading only on initial load
      return <Container sx={{textAlign: 'center', mt: 5}}><CircularProgress /></Container>;
   }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Site Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
         {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
         {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully!</Alert>}

        <Box component="form" onSubmit={handleSaveChanges} noValidate>
          <Grid container spacing={3}>
            {/* Basic Company Info */}
            <Grid item xs={12}> <Typography variant="h6">Company Information</Typography> </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isSaving} />
            </Grid>
             <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isSaving} />
            </Grid>
             <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleInputChange} disabled={isSaving} multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isSaving} />
            </Grid>
             <Grid item xs={12} md={6}>
              <TextField fullWidth label="VAT Number" name="vatNumber" value={formData.vatNumber} onChange={handleInputChange} disabled={isSaving} />
            </Grid>
             <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company Registration Number" name="regNumber" value={formData.regNumber} onChange={handleInputChange} disabled={isSaving} />
            </Grid>
            
            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            {/* Social Media */}
             <Grid item xs={12}> <Typography variant="h6">Social Media Links</Typography> </Grid>
              <Grid item xs={12} sm={6} md={3}>
                 <TextField fullWidth label="Facebook URL" name="facebook" value={formData.socialMedia?.facebook || ''} onChange={handleSocialChange} disabled={isSaving} />
              </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <TextField fullWidth label="Instagram URL" name="instagram" value={formData.socialMedia?.instagram || ''} onChange={handleSocialChange} disabled={isSaving} />
              </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <TextField fullWidth label="Twitter URL" name="twitter" value={formData.socialMedia?.twitter || ''} onChange={handleSocialChange} disabled={isSaving} />
              </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <TextField fullWidth label="Pinterest URL" name="pinterest" value={formData.socialMedia?.pinterest || ''} onChange={handleSocialChange} disabled={isSaving} />
              </Grid>
              
             <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            {/* Temporary Closure Notice */}
             <Grid item xs={12}> <Typography variant="h6">Temporary Closure Notice</Typography> </Grid>
             <Grid item xs={12}>
                 <FormControlLabel 
                    control={
                       <Switch 
                          checked={formData.temporaryClosureNotice?.enabled || false} 
                          onChange={handleClosureSwitchChange} 
                          name="enabled" // Matches the key in temporaryClosureNotice
                          disabled={isSaving}
                       />
                    } 
                    label="Enable Temporary Closure Notice Banner" 
                 />
             </Grid>
              <Grid item xs={12}>
                 <TextField 
                    fullWidth 
                    label="Closure Notice Message" 
                    name="message" // Matches the key in temporaryClosureNotice
                    multiline 
                    rows={3} 
                    value={formData.temporaryClosureNotice?.message || ''} 
                    onChange={handleClosureChange} 
                    disabled={isSaving || !formData.temporaryClosureNotice?.enabled} // Disable if switch is off
                 />
             </Grid>

             <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ mt: 2 }}
                >
                  Save Settings
                </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSettingsPage;

