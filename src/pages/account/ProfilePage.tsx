import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from 'firebase/auth';
import { auth, updateDocument } from '../../services/firebase'; // Adjust path if needed
import { RootState, AppDispatch } from '../../store'; // Adjust path if needed
import { setUser } from '../../store/slices/authSlice'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Paper,
  Grid 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [displayName, setDisplayName] = useState<string>(user?.displayName || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update local state if user object changes in Redux store
  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value);
    // Clear messages when user starts typing
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!user?.uid || !auth.currentUser) {
      setError("User not found or not authenticated.");
      return;
    }

    if (displayName === user.displayName) {
      setError("Display name hasn't changed.");
      return;
    }
    
    if (!displayName.trim()) {
        setError("Display name cannot be empty.");
        return;
    }

    setIsSaving(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: displayName });
      
      // Update Firestore user document
      await updateDocument('users', user.uid, { displayName: displayName });

      // Update user state in Redux store
      const updatedUser = { ...user, displayName: displayName };
      dispatch(setUser(updatedUser)); // Assuming setUser takes the full user object

      setSuccessMessage("Display name updated successfully!");

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if display name has changed for button disabling
  const hasChanged = displayName !== (user?.displayName || '');

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Details
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                value={user?.email || ''}
                disabled // Email is typically not changed here easily
                variant="filled" // Indicate it's read-only
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="displayName"
                label="Display Name"
                name="displayName"
                value={displayName}
                onChange={handleDisplayNameChange}
                disabled={isSaving}
                error={!!error} // Highlight field if related error occurred (optional)
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {successMessage}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || !hasChanged} // Disable if saving or no changes
            sx={{ mt: 3 }}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            Save Changes
          </Button>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2">
              {/* Placeholder/Link for password change */}
              Need to change your password? Contact support for assistance. {/* Or link to a dedicated page if implemented */}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;

