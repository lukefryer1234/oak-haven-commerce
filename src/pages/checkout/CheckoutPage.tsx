import React, { useState, useEffect } from 'react'; // Import useEffect
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { 
  selectCartItems, 
  selectCartTotals, 
  selectCartItemsCount 
} from '../../store/slices/cartSlice'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Divider, 
  TextField,
  FormControl, // Added form imports
  InputLabel,
  Select,
  MenuItem,
  CircularProgress, // Added loading indicator
  SelectChangeEvent 
} from '@mui/material';
import { RootState } from '../../store'; // Adjust path if needed
import { getDocument, UserData, Address } from '../../services/firebase'; // Import firebase utils and types

// Define an empty address structure for the form
const emptyAddress: Omit<Address, 'id' | 'isDefault'> = {
  line1: '',
  line2: '',
  city: '',
  county: '',
  postcode: ''
};

const CheckoutPage: React.FC = () => {
  const items = useSelector(selectCartItems);
  const itemsCount = useSelector(selectCartItemsCount);
  const { subtotal, vatAmount, shippingCost, total } = useSelector(selectCartTotals);
  const { user } = useSelector((state: RootState) => state.auth); // Get logged in user

  // State for user data and addresses
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(''); // 'new' or address.id or ''
  const [addressFormData, setAddressFormData] = useState(emptyAddress);
  const [isAddressValid, setIsAddressValid] = useState<boolean>(false);

  // Fetch user data (including addresses)
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        setLoadingUser(true);
        try {
          const data = await getDocument<UserData>('users', user.uid);
          setUserData(data);
          // Pre-select default address if available
          const defaultAddress = data?.addresses?.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setAddressFormData({ // Pre-fill form with default address details
                line1: defaultAddress.line1,
                line2: defaultAddress.line2 || '',
                city: defaultAddress.city,
                county: defaultAddress.county,
                postcode: defaultAddress.postcode,
            });
          } else {
             setSelectedAddressId('new'); // Default to new if no addresses or no default
             setAddressFormData(emptyAddress);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Handle error appropriately, maybe set an error state
           setSelectedAddressId('new'); // Fallback to entering new address on error
           setAddressFormData(emptyAddress);
        } finally {
          setLoadingUser(false);
        }
      } else {
        // No user logged in (shouldn't happen due to ProtectedRoute, but handle defensively)
        setLoadingUser(false);
        setSelectedAddressId('new'); // Must enter new address if not logged in? Or handle error.
        setAddressFormData(emptyAddress);
      }
    };
    fetchUserData();
  }, [user?.uid]);

  // Handle selection change from dropdown
  const handleAddressSelectionChange = (event: SelectChangeEvent<string>) => {
    const id = event.target.value;
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddressFormData(emptyAddress); // Clear form for new address entry
    } else if (id) {
      const selected = userData?.addresses?.find(addr => addr.id === id);
      if (selected) {
        setAddressFormData({ // Fill form with selected address details
          line1: selected.line1,
          line2: selected.line2 || '',
          city: selected.city,
          county: selected.county,
          postcode: selected.postcode,
        });
      }
    } else {
        setAddressFormData(emptyAddress); // Clear form if nothing selected
    }
  };

  // Handle changes in the new address form fields
  const handleFormInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     // Only allow editing if 'new' is selected
    if (selectedAddressId === 'new') {
        const { name, value } = event.target;
        setAddressFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate address based on selection or form input
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== 'new') {
      // An existing address is selected
      setIsAddressValid(true);
    } else if (selectedAddressId === 'new') {
      // 'New' is selected, validate form data
      const { line1, city, postcode, county } = addressFormData; // Add county check
      setIsAddressValid(!!line1 && !!city && !!postcode && !!county); // Basic validation: required fields are not empty
    } else {
      // No selection
      setIsAddressValid(false);
    }
  }, [selectedAddressId, addressFormData]);

  // Prepare the state to pass to the payment page
  const getFinalShippingAddress = (): Address | Omit<Address, 'id' | 'isDefault'> | null => {
    if (selectedAddressId === 'new' && isAddressValid) {
      // Use the form data for the new address
      return addressFormData;
    } else if (selectedAddressId && selectedAddressId !== 'new') {
      // Find the selected existing address
      return userData?.addresses?.find(addr => addr.id === selectedAddressId) || null;
    }
    return null; // Should not happen if button is enabled
  };

  const paymentPageState = {
    shippingAddress: getFinalShippingAddress(),
    items: items,
    totals: { subtotal, vatAmount, shippingCost, total },
    // Also pass userData?.uid if needed for creating the order
    userId: user?.uid 
  };

  // Redirect to cart if it's empty
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Grid container spacing={3}>
        {/* Shipping Address Section */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          {loadingUser ? (
            <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
          ) : (
            <Box component="div" sx={{ mt: 1 }}> {/* Changed form to div, submission handled by button */}
              {userData?.addresses && userData.addresses.length > 0 && (
                 <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="address-select-label">Select Existing Address</InputLabel>
                    <Select
                        labelId="address-select-label"
                        id="address-select"
                        value={selectedAddressId}
                        label="Select Existing Address"
                        onChange={handleAddressSelectionChange}
                    >
                        <MenuItem value=""><em>Select an Address...</em></MenuItem>
                        {userData.addresses.map((addr) => (
                        <MenuItem key={addr.id} value={addr.id}>
                            {`${addr.line1}, ${addr.city}, ${addr.postcode}`}
                        </MenuItem>
                        ))}
                        <MenuItem value="new">-- Enter New Address --</MenuItem>
                    </Select>
                 </FormControl>
              )}
              
              {/* Conditionally display/enable form fields */}
              <Grid container spacing={2}>
                  <Grid item xs={12}>
                      <TextField 
                          required 
                          fullWidth 
                          id="line1" 
                          label="Address Line 1" 
                          name="line1" 
                          autoComplete="shipping address-line1" 
                          value={addressFormData.line1}
                          onChange={handleFormInputChange}
                          disabled={selectedAddressId !== 'new'} // Disable if existing selected
                          InputLabelProps={{ shrink: !!addressFormData.line1 || selectedAddressId !== 'new' }} // Keep label floated
                       />
                  </Grid>
                  <Grid item xs={12}>
                      <TextField 
                          fullWidth 
                          id="line2" 
                          label="Address Line 2" 
                          name="line2" 
                          autoComplete="shipping address-line2" 
                          value={addressFormData.line2}
                          onChange={handleFormInputChange}
                          disabled={selectedAddressId !== 'new'}
                          InputLabelProps={{ shrink: !!addressFormData.line2 || selectedAddressId !== 'new' }}
                       />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField 
                          required 
                          fullWidth 
                          id="city" 
                          label="City" 
                          name="city" 
                          autoComplete="shipping address-level2" 
                          value={addressFormData.city}
                          onChange={handleFormInputChange}
                          disabled={selectedAddressId !== 'new'}
                          InputLabelProps={{ shrink: !!addressFormData.city || selectedAddressId !== 'new' }}
                       />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField 
                          required 
                          fullWidth 
                          id="county" 
                          label="County" 
                          name="county" 
                          autoComplete="shipping address-level1" 
                          value={addressFormData.county}
                          onChange={handleFormInputChange}
                          disabled={selectedAddressId !== 'new'}
                          InputLabelProps={{ shrink: !!addressFormData.county || selectedAddressId !== 'new' }}
                         />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField 
                          required 
                          fullWidth 
                          id="postcode" 
                          label="Postcode" 
                          name="postcode" 
                          autoComplete="shipping postal-code" 
                          value={addressFormData.postcode}
                          onChange={handleFormInputChange}
                          disabled={selectedAddressId !== 'new'}
                          InputLabelProps={{ shrink: !!addressFormData.postcode || selectedAddressId !== 'new' }}
                        />
                  </Grid>
                  {/* TODO: Add 'Save address' checkbox only when selectedAddressId === 'new' */}
              </Grid>
            </Box>
          )}
           {/* Placeholder for shipping method */}
           <Typography variant="h6" gutterBottom sx={{mt: 3}}>Shipping Method</Typography>
           <Typography variant="body2">Standard Delivery: £{shippingCost.toFixed(2)}</Typography> 
           {/* TODO: Potentially allow selection if multiple methods exist */}
        </Grid>

        {/* Order Summary Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary ({itemsCount} item{itemsCount !== 1 ? 's' : ''})
            </Typography>
            {/* Optional: Concise list of items */}
            {/* <List dense>
              {items.map(item => (
                <ListItem key={item.id} disableGutters>
                  <ListItemText primary={`${item.name} (x${item.quantity})`} />
                </ListItem>
              ))}
            </List> 
            <Divider sx={{ my: 1 }} /> */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>£{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>VAT (20%)</Typography>
              <Typography>£{vatAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Shipping</Typography>
              <Typography>£{shippingCost.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">£{total.toFixed(2)}</Typography>
            </Box>
            <Button
              component={Link}
              to="/payment"
              state={paymentPageState} // Pass state to payment page
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isAddressValid || loadingUser} // Disable if address invalid or still loading user
              sx={{ mt: 2 }}
            >
              Continue to Payment
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;

