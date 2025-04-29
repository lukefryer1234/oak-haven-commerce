import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDocument, updateDocument, UserData, Address } from '../../services/firebase'; // Adjust path if needed
import { RootState } from '../../store'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider,
  FormControlLabel,
  Checkbox // Using Checkbox instead of Radio for default toggle
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit'; // Placeholder
import DeleteIcon from '@mui/icons-material/Delete'; // Placeholder
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Define an empty address structure for the form
const emptyAddress: Omit<Address, 'id' | 'isDefault'> = {
  line1: '',
  line2: '',
  city: '',
  county: '',
  postcode: ''
};

// Helper to format address
const formatAddress = (address: Address | Omit<Address, 'id' | 'isDefault'>): string => {
  let parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts = [...parts, address.city, address.county, address.postcode];
  return parts.filter(Boolean).join(', ');
};


const AddressesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false); // For add/update operations

  const [newAddressData, setNewAddressData] = useState(emptyAddress);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // State for tracking edit mode

  // --- Fetch User Data ---
  const fetchUserData = async (userId: string) => {
      setLoadingUser(true);
      setError(null);
      try {
          const data = await getDocument<UserData>('users', userId);
          setUserData(data);
      } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data.");
      } finally {
          setLoadingUser(false);
      }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchUserData(user.uid);
    } else {
       setIsLoading(false);
       // setError("User not logged in."); // ProtectedRoute should handle this
    }
  }, [user?.uid]);

  // --- Form Handling ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewAddressData(prev => ({ ...prev, [name]: value }));
  };

  // Renamed from handleAddNewAddress to handle both Add and Update
  const handleSaveAddress = async (event: React.FormEvent) => { 
    event.preventDefault();
    if (!user?.uid || !userData) return;

    // Basic validation
    const { line1, city, postcode, county } = newAddressData;
    if (!line1 || !city || !postcode || !county) {
      setError("Please fill in all required address fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const currentAddresses = userData.addresses || [];

    try {
      let updatedAddresses: Address[];

      if (editingAddressId) {
        // --- Update existing address ---
        const addressIndex = currentAddresses.findIndex(addr => addr.id === editingAddressId);
        if (addressIndex === -1) {
          throw new Error("Address to edit not found."); // Should not happen
        }
        // Merge existing id and isDefault with new form data
        const updatedAddress: Address = {
          ...currentAddresses[addressIndex], // Keep original id and isDefault
          ...newAddressData // Overwrite with form data
        };
        updatedAddresses = [...currentAddresses]; // Create a copy
        updatedAddresses[addressIndex] = updatedAddress; // Replace the item at the index

      } else {
         // --- Add new address ---
        const isFirstAddress = currentAddresses.length === 0;
        const newAddress: Address = {
          id: uuidv4(),
          ...newAddressData,
          isDefault: isFirstAddress, 
        };
         updatedAddresses = [...currentAddresses, newAddress];
         // If adding the first address, ensure any potential existing default flags are cleared (shouldn't be needed if logic is correct, but safe)
         if (isFirstAddress && updatedAddresses.length > 1) {
             updatedAddresses = updatedAddresses.map(addr => ({...addr, isDefault: addr.id === newAddress.id}));
         }
      }

      // Save updated array to Firestore
      await updateDocument('users', user.uid, { addresses: updatedAddresses });
      setUserData(prev => prev ? { ...prev, addresses: updatedAddresses } : null); // Update local state

      // Reset form and state
      setNewAddressData(emptyAddress); 
      setShowAddForm(false); 
      setEditingAddressId(null);

    } catch (err) {
      console.error(`Error ${editingAddressId ? 'updating' : 'adding'} address:`, err);
      setError(`Failed to ${editingAddressId ? 'update' : 'save'} address. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
      setShowAddForm(false);
      setNewAddressData(emptyAddress);
    setError(null); // Clear validation errors
    setEditingAddressId(null); // Ensure edit mode is exited
  };
  // --- Set Default Address ---
   const handleSetDefault = async (addressId: string) => {
    if (!user?.uid || !userData?.addresses) return;

    setIsSaving(true); // Use isSaving for this operation too
    setError(null);

    const updatedAddresses = userData.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    try {
      await updateDocument('users', user.uid, { addresses: updatedAddresses });
       setUserData(prev => prev ? { ...prev, addresses: updatedAddresses } : null); // Update local state
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to update default address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // --- Delete Address ---
  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.uid || !userData?.addresses) return;

    const addressToDelete = userData.addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) return; // Should not happen

    if (addressToDelete.isDefault) {
      setError("Cannot delete the default address. Please set another address as default first.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete this address?\n${formatAddress(addressToDelete)}`)) {
      setIsSaving(true); // Use general saving state
      setError(null);

      const updatedAddresses = userData.addresses.filter(addr => addr.id !== addressId);

      try {
        await updateDocument('users', user.uid, { addresses: updatedAddresses });
        setUserData(prev => prev ? { ...prev, addresses: updatedAddresses } : null); // Update local state
      } catch (err) {
        console.error("Error deleting address:", err);
        setError("Failed to delete address. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // --- Edit Address ---
  const handleEditClick = (address: Address) => {
    setEditingAddressId(address.id);
    // Populate form data, ensuring line2 is handled if undefined
    setNewAddressData({
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        county: address.county,
        postcode: address.postcode,
    });
    setShowAddForm(true);
    setError(null); // Clear any previous errors
  };

  // --- Render Logic ---
  if (loadingUser) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Note: Error state here primarily covers fetching user data initially.
  // Saving errors are shown near the relevant forms/buttons.

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Addresses</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 3 }}>
        {!showAddForm && (
           <Button 
             variant="contained" 
             startIcon={<AddCircleOutlineIcon />}
             onClick={() => { 
                setEditingAddressId(null); // Ensure not in edit mode
                setNewAddressData(emptyAddress); // Clear form
                setShowAddForm(true); 
                setError(null); 
             }}
             disabled={isSaving || showAddForm} // Disable if form already shown or saving
           >
             Add New Address
           </Button>
        )}
      </Box>

      {/* Add New Address Form */}
      {showAddForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
           <Typography variant="h6" gutterBottom>
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
           </Typography>
           <Box component="form" onSubmit={handleSaveAddress} noValidate sx={{ mt: 1 }}> {/* Use handleSaveAddress */}
             <Grid container spacing={2}>
                 <Grid item xs={12}>
                     <TextField required fullWidth name="line1" label="Address Line 1" value={newAddressData.line1} onChange={handleInputChange} disabled={isSaving} />
                 </Grid>
                 <Grid item xs={12}>
                     <TextField fullWidth name="line2" label="Address Line 2" value={newAddressData.line2} onChange={handleInputChange} disabled={isSaving} />
                 </Grid>
                 <Grid item xs={12} sm={6}>
                     <TextField required fullWidth name="city" label="City" value={newAddressData.city} onChange={handleInputChange} disabled={isSaving} />
                 </Grid>
                 <Grid item xs={12} sm={6}>
                     <TextField required fullWidth name="county" label="County" value={newAddressData.county} onChange={handleInputChange} disabled={isSaving} />
                 </Grid>
                 <Grid item xs={12} sm={6}>
                     <TextField required fullWidth name="postcode" label="Postcode" value={newAddressData.postcode} onChange={handleInputChange} disabled={isSaving} />
                 </Grid>
             </Grid>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                 <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={isSaving} 
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                 >
                    {editingAddressId ? 'Save Changes' : 'Save Address'}
                 </Button>
                 <Button 
                    variant="outlined" 
                    onClick={handleCancelAdd} 
                    disabled={isSaving}
                    startIcon={<CancelIcon />}
                 >
                    Cancel
                 </Button>
              </Box>
           </Box>
        </Paper>
      )}

      {/* Address List */}
      <Typography variant="h6" gutterBottom>Saved Addresses</Typography>
      {(!userData?.addresses || userData.addresses.length === 0) && !loadingUser ? (
         <Typography sx={{ mt: 2 }}>You have no saved addresses.</Typography>
      ) : (
        <List>
          {userData?.addresses?.map((address) => (
            <Paper key={address.id} sx={{ mb: 2, p: 2 }} variant="outlined">
              <ListItem 
                secondaryAction={
                  <Box>
                     <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        disabled={isSaving || showAddForm} // Disable if already adding/editing or saving
                        onClick={() => handleEditClick(address)} // Add onClick handler
                        sx={{ mr: 1}}
                      > 
                       <EditIcon />
                     </IconButton>
                     <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        disabled={isSaving || address.isDefault} // Can't delete default
                        onClick={() => handleDeleteAddress(address.id)} // Add onClick handler
                      >
                       <DeleteIcon />
                     </IconButton>
                  </Box>
                }
                disablePadding
              >
                 <FormControlLabel 
                    control={
                       <Checkbox 
                         checked={address.isDefault} 
                         onChange={() => handleSetDefault(address.id)} 
                         disabled={address.isDefault || isSaving} 
                         name="setDefaultRadio" 
                       />
                    }
                    label={address.isDefault ? "Default Address" : "Set as Default"}
                    sx={{ mr: 2 }} // Add margin
                  />
                 <ListItemText 
                    primary={formatAddress(address)} 
                 />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default AddressesPage;

