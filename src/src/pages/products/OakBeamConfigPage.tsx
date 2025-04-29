import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { getDocument, ProductData } from '../../services/firebase'; // Adjust path if needed
import { addItem, CartItem } from '../../store/slices/cartSlice'; // Adjust path if needed
import { 
  Container,
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  CircularProgress,
  SelectChangeEvent,
  TextField,
  Grid,
  Paper,
  Alert,
  Snackbar // Add Snackbar import
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// --- Option Interfaces & Data ---
interface BeamDimensionOption { value: number; label: string; } // Dimensions in mm
interface BeamFinishOption { value: string; label: string; priceModifierPerMeter: number; }
interface BeamProfileOption { value: string; label: string; priceModifier: number; } // Flat fee for profiling

// TODO: Fetch dimension/finish/profile options from Firestore or product options eventually

const availableWidths: BeamDimensionOption[] = [
    { value: 100, label: '100mm' }, { value: 125, label: '125mm' }, { value: 150, label: '150mm' }, 
    { value: 175, label: '175mm' }, { value: 200, label: '200mm' }, { value: 225, label: '225mm' }, 
    { value: 175, label: '175mm' }, { value: 200, label: '200mm' }, { value: 225, label: '225mm' }, 
    { value: 250, label: '250mm' }
];
const availableThicknesses: BeamDimensionOption[] = [
    { value: 50, label: '50mm' }, { value: 75, label: '75mm' }, { value: 100, label: '100mm' },
    { value: 125, label: '125mm' }, { value: 150, label: '150mm' }, { value: 200, label: '200mm' }
];
const availableFinishes: BeamFinishOption[] = [
    { value: 'sawn', label: 'Sawn Finish', priceModifierPerMeter: 0 },
    { value: 'planed', label: 'Planed All Round (PAR)', priceModifierPerMeter: 5 }, // Example price per meter
];
const availableProfiles: BeamProfileOption[] = [
    { value: 'square', label: 'Square Edges', priceModifier: 0 },
    { value: 'chamfer', label: 'Chamfered Edges', priceModifier: 15 }, // Example flat fee
];

// --- Component ---
const OakBeamConfigPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [baseProduct, setBaseProduct] = useState<ProductData | null>(null); // Store fetched product data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [selectedLength, setSelectedLength] = useState<string>(''); // Length in meters (string for TextField)
  const [selectedWidth, setSelectedWidth] = useState<string>(''); // Width in mm (string for Select)
  const [selectedThickness, setSelectedThickness] = useState<string>(''); // Thickness in mm (string for Select)
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // State for Snackbar feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  // --- Fetch Base Product (Optional) ---
   useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    const fetchProductData = async () => {
        const params = new URLSearchParams(location.search);
        const productId = params.get('productId');
        if (!productId) {
            setError("Product ID not found in URL.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setBaseProduct(null);
        try {
            const data = await getDocument<ProductData>('products', productId);
            if (data) {
                setBaseProduct(data);
                // Validate base price on fetch
                if (typeof data.options?.basePricePerCubicMeter !== 'number' || data.options.basePricePerCubicMeter <= 0) {
                     console.warn(`Product ${productId} has missing or invalid basePricePerCubicMeter.`);
                     // Keep error state null for now, but handle price calculation later
                }
            } else {
                setError(`Product with ID "${productId}" not found.`);
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product information.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchProductData();
  }, [location.search]);

  // --- Price Calculation ---
  const calculateBeamPrice = (
    basePricePerM3: number | undefined | null,
    lengthM: number,
    widthMM: number,
    thicknessMM: number,
    finishValue: string,
    profileValue: string
  ): number | null => {
    
    // Validate base price and dimensions
    if (typeof basePricePerM3 !== 'number' || basePricePerM3 <= 0) {
      return null; // Cannot calculate without valid base price
    }
    if (isNaN(lengthM) || lengthM <= 0 || isNaN(widthMM) || isNaN(thicknessMM)) {
      return null; // Invalid dimensions
    }

    const widthM = widthMM / 1000;
    const thicknessM = thicknessMM / 1000;
    const volumeM3 = lengthM * widthM * thicknessM;

    let price = volumeM3 * basePricePerM3;

    const finishOption = availableFinishes.find(f => f.value === finishValue);
    if (finishOption) {
      price += finishOption.priceModifierPerMeter * lengthM;
    }

    const profileOption = availableProfiles.find(p => p.value === profileValue);
    if (profileOption) {
        price += finishOption.priceModifierPerMeter * lengthM;
    }

    const profileOption = availableProfiles.find(p => p.value === selectedProfile);
    if (profileOption) {
        price += profileOption.priceModifier;
    }

    return price;
  };

  // Recalculate price whenever a relevant option or base product changes
  useEffect(() => {
    const lengthM = parseFloat(selectedLength);
    const widthMM = parseInt(selectedWidth, 10);
    const thicknessMM = parseInt(selectedThickness, 10);

    // Only calculate if all inputs are valid selections (not empty strings)
    if (selectedLength && selectedWidth && selectedThickness && selectedFinish && selectedProfile) {
        const price = calculateBeamPrice(
            baseProduct?.options?.basePricePerCubicMeter, 
            lengthM, 
            widthMM, 
            thicknessMM, 
            selectedFinish, 
            selectedProfile
        );
        setCurrentPrice(price);
    } else {
         // If options are incomplete, set price to null
         setCurrentPrice(null);
    }
  }, [baseProduct, selectedLength, selectedWidth, selectedThickness, selectedFinish, selectedProfile]);

  // --- Handlers ---
  const handleDimensionChange = (event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
     if (name === 'length') setSelectedLength(value);
     else if (name === 'width') setSelectedWidth(value);
     else if (name === 'thickness') setSelectedThickness(value);
  };
   const handleFinishChange = (event: SelectChangeEvent<string>) => {
    setSelectedFinish(event.target.value);
  };
   const handleProfileChange = (event: SelectChangeEvent<string>) => {
    setSelectedProfile(event.target.value);
  };

  const handleAddToCart = () => {
    setError(null); // Clear previous errors
    // Validation
    // Check base price first
    if (!baseProduct?.options?.basePricePerCubicMeter || baseProduct.options.basePricePerCubicMeter <= 0) {
        setSnackbarSeverity('error');
        setSnackbarMessage("Cannot add to cart: Base price information missing or invalid.");
        setSnackbarOpen(true);
        return;
    }
    // Check selections
    const lengthM = parseFloat(selectedLength);
    if (isNaN(lengthM) || lengthM <= 0) { setSnackbarSeverity('warning'); setSnackbarMessage("Please enter a valid length in meters."); setSnackbarOpen(true); return; }
    if (!selectedWidth) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a width."); setSnackbarOpen(true); return; }
    if (!selectedThickness) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a thickness."); setSnackbarOpen(true); return; }
    if (!selectedFinish) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a finish."); setSnackbarOpen(true); return; }
    if (!selectedProfile) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a profile."); setSnackbarOpen(true); return; }
    // Check calculated price (should be valid if base price and selections are valid, but good failsafe)
    if (currentPrice === null) { 
        setSnackbarSeverity('error'); 
        setSnackbarMessage("Could not calculate price. Check selections and base product data."); 
        setSnackbarOpen(true); 
        return; 
    }

    setIsAddingToCart(true);
    const configuredOptions = {
        length: `${lengthM}m`, // Store length with unit
        width: `${selectedWidth}mm`,
        thickness: `${selectedThickness}mm`,
        finish: selectedFinish,
        profile: selectedProfile,
    };

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: baseProduct?.id || 'oak-beam-generic', // Use generic ID if no base product fetched
      name: baseProduct?.name || 'Custom Oak Beam',
      category: 'beam', // Hardcode category
      quantity: 1,
      unitPrice: currentPrice, // Calculated price is the unit price
      options: configuredOptions,
      // image: baseProduct?.images?.[0], // Optional base product image
    };

    dispatch(addItem(cartItem));
    console.log('Added beam to cart:', cartItem);
    
    // Show success feedback via Snackbar
    setSnackbarSeverity('success');
    setSnackbarMessage(`Oak Beam added to cart! Price: £${currentPrice.toFixed(2)}`);
    setSnackbarOpen(true);

    setIsAddingToCart(false);
    // TODO: Optionally clear form or navigate to cart
  };

  const requiredOptionsSelected = !!selectedLength && !!selectedWidth && !!selectedThickness && !!selectedFinish && !!selectedProfile;

  // --- Render ---
  if (isLoading) {
    return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /><Typography>Loading product details...</Typography></Container>;
  }
  
  // Show fetch error if loading base product failed
  if (error) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!baseProduct) {
     return <Container sx={{ mt: 5 }}><Alert severity="warning">Could not load product data.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Configure Your {baseProduct.name || 'Oak Beam'}
      </Typography>
      <Paper sx={{ p: 3 }}>
         {/* Display base price info if needed */}
         {/* {baseProduct.options?.basePricePerCubicMeter && <Typography>Base Price: £{baseProduct.options.basePricePerCubicMeter}/m³</Typography>} */}

        <Grid container spacing={3}>
            {/* Length Input */}
            <Grid item xs={12} sm={6} md={3}>
                 <TextField
                    required
                    fullWidth
                    id="length"
                    label="Length (meters)"
                    name="length"
                    type="number"
                    InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                    value={selectedLength}
                    onChange={handleDimensionChange}
                    error={!selectedLength} // Highlight if empty
                 />
            </Grid>
            {/* Width Selector */}
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required error={!selectedWidth}>
                    <InputLabel id="width-select-label">Width</InputLabel>
                    <Select
                        labelId="width-select-label"
                        id="width-select"
                        name="width"
                        value={selectedWidth}
                        label="Width"
                        onChange={handleDimensionChange}
                    >
                        <MenuItem value=""><em>Select Width...</em></MenuItem>
                        {availableWidths.map(opt => <MenuItem key={opt.value} value={opt.value.toString()}>{opt.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
             {/* Thickness Selector */}
            <Grid item xs={12} sm={6} md={3}>
                 <FormControl fullWidth required error={!selectedThickness}>
                    <InputLabel id="thickness-select-label">Thickness</InputLabel>
                    <Select
                        labelId="thickness-select-label"
                        id="thickness-select"
                        name="thickness"
                        value={selectedThickness}
                        label="Thickness"
                        onChange={handleDimensionChange}
                    >
                        <MenuItem value=""><em>Select Thickness...</em></MenuItem>
                         {availableThicknesses.map(opt => <MenuItem key={opt.value} value={opt.value.toString()}>{opt.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
             <Grid item xs={12} sm={6} md={3}></Grid> {/* Spacer */}

            {/* Finish Selector */}
            <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required error={!selectedFinish}>
                    <InputLabel id="finish-select-label">Finish</InputLabel>
                    <Select
                        labelId="finish-select-label"
                        id="finish-select"
                        name="finish"
                        value={selectedFinish}
                        label="Finish"
                        onChange={handleFinishChange}
                    >
                        <MenuItem value=""><em>Select Finish...</em></MenuItem>
                        {availableFinishes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label} (+£{opt.priceModifierPerMeter}/m)</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
             {/* Profile Selector */}
             <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!selectedProfile}>
                    <InputLabel id="profile-select-label">Edge Profile</InputLabel>
                    <Select
                        labelId="profile-select-label"
                        id="profile-select"
                        name="profile"
                        value={selectedProfile}
                        label="Edge Profile"
                        onChange={handleProfileChange}
                    >
                       <MenuItem value=""><em>Select Profile...</em></MenuItem>
                        {availableProfiles.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label} (+£{opt.priceModifier})</MenuItem>)}
                    </Select>
                </FormControl>
             </Grid>

            {/* Summary Section */}
             <Grid item xs={12}>
                 <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>Summary</Typography>
                     {currentPrice !== null ? (
                         <Typography variant="h5" gutterBottom>
                             Estimated Price: £{currentPrice.toFixed(2)}
                         </Typography>
                     ) : (
                         <Typography color="text.secondary">Select all options to see price.</Typography>
                     )}
                     <Button
                        variant="contained"
                        color="primary"
                        startIcon={isAddingToCart ? <CircularProgress size={20} color="inherit" /> : <AddShoppingCartIcon />}
                        disabled={
                            !requiredOptionsSelected || 
                            currentPrice === null || 
                            isAddingToCart || 
                            !baseProduct?.options?.basePricePerCubicMeter || // Disable if base price missing
                            baseProduct.options.basePricePerCubicMeter <= 0
                        }
                        onClick={handleAddToCart}
                        sx={{ mt: 2 }}
                    >
                        Add to Cart
                    </Button>
                 </Box>
            </Grid>
        </Grid>
      </Paper>
      
      {/* Snackbar for feedback */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OakBeamConfigPage;

