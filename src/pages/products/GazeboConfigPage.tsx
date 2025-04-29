import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Optional: if using productId
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { ProductData } from '../../services/firebase'; // Adjust path if needed
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
  Grid,
  Paper,
  Alert, 
  Snackbar // Add Snackbar import
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// --- Option Interfaces & Data ---
interface GazeboSizeOption { value: string; label: string; /* Base price now fetched */ }
interface GazeboRoofOption { value: string; label: string; priceModifierFactor: number; } // Price multiplier
interface GazeboPanelOption { value: string; label: string; priceModifierPerSide: number; }
// TODO: Fetch these from Firestore or product options
const availableSizes: GazeboSizeOption[] = [
    { value: '3x3', label: '3m x 3m' },
    { value: '4x3', label: '4m x 3m' },
    { value: '4x4', label: '4m x 4m' },
];
const availableRoofs: GazeboRoofOption[] = [
    { value: 'hip', label: 'Hip Roof', priceModifierFactor: 1.0 },
    { value: 'pyramid', label: 'Pyramid Roof', priceModifierFactor: 1.15 }, // Example: 15% more expensive
];
const availablePanels: GazeboPanelOption[] = [
    { value: 'none', label: 'No Side Panels', priceModifierPerSide: 0 },
    { value: 'half', label: 'Half-Height Panels (x4)', priceModifierPerSide: 120 }, // Price per side
    { value: 'full', label: 'Full-Height Panels (x4)', priceModifierPerSide: 200 }, // Price per side
];
const NUMBER_OF_SIDES = 4; // Assuming square/rectangular gazebo

// --- Component ---
const GazeboConfigPage: React.FC = () => {
  const location = useLocation(); // Optional
  const dispatch = useDispatch();
  const [baseProduct, setBaseProduct] = useState<ProductData | null>(null); // Store fetched product
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedRoof, setSelectedRoof] = useState<string>('');
  const [selectedPanels, setSelectedPanels] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // State for Snackbar feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

   // --- Fetch Base Product ---
   useEffect(() => {
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
            // Assume getDocument is imported and configured
            const data = await getDocument<ProductData>('products', productId); 
            if (data) {
                setBaseProduct(data);
                // Validate base price on fetch
                if (typeof data.options?.basePrice !== 'number' || data.options.basePrice <= 0) {
                     console.warn(`Product ${productId} has missing or invalid basePrice.`);
                     // Price calculation will handle this later
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
  const calculateGazeboPrice = (
      basePrice: number | undefined | null,
      sizeValue: string,
      roofValue: string,
      panelsValue: string
  ): number | null => {
    
     // Validate base price
     if (typeof basePrice !== 'number' || basePrice <= 0) {
        return null; // Cannot calculate without valid base price
     }

     // Find selected options (ensure they exist for modifier lookup)
     const sizeOption = availableSizes.find(s => s.value === sizeValue);
     const roofOption = availableRoofs.find(r => r.value === roofValue);
     const panelOption = availablePanels.find(p => p.value === panelsValue);

     // Check if all selections are valid and found
     if (!sizeOption || !roofOption || !panelOption) {
         console.error("Selected option not found in available options during calculation");
         return null; 
     }

     // Use the validated basePrice argument
     const roofAdjustedPrice = basePrice * roofOption.priceModifierFactor;
     const panelCost = panelOption.priceModifierPerSide * NUMBER_OF_SIDES;
     const totalPrice = roofAdjustedPrice + panelCost;

     return totalPrice;
  };

   // Recalculate price whenever a relevant option or base product changes
   useEffect(() => {
    // Only calculate if all inputs are valid selections
    if (selectedSize && selectedRoof && selectedPanels) {
        const price = calculateGazeboPrice(
            baseProduct?.options?.basePrice,
            selectedSize,
            selectedRoof,
            selectedPanels
        );
        setCurrentPrice(price);
    } else {
        setCurrentPrice(null); // Options incomplete
    }
  }, [baseProduct, selectedSize, selectedRoof, selectedPanels]);

   // --- Handlers ---
   const handleSizeChange = (event: SelectChangeEvent<string>) => {
    setSelectedSize(event.target.value);
  };
   const handleRoofChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoof(event.target.value);
  };
   const handlePanelsChange = (event: SelectChangeEvent<string>) => {
    setSelectedPanels(event.target.value);
  };

   const handleAddToCart = () => {
    setError(null); // Clear general errors
     // Use Snackbar for validation feedback
     // Check base price first
     if (!baseProduct?.options?.basePrice || baseProduct.options.basePrice <= 0) {
        setSnackbarSeverity('error');
        setSnackbarMessage("Cannot add to cart: Base price information missing or invalid.");
        setSnackbarOpen(true);
        return;
     }
      // Check selections
    if (!selectedSize || !selectedRoof || !selectedPanels) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select all options."); setSnackbarOpen(true); return; }
    // Check calculated price
    if (currentPrice === null) { 
        setSnackbarSeverity('error'); 
        setSnackbarMessage("Could not calculate price. Check selections and base product data."); 
        setSnackbarOpen(true); 
        return; 
    }

    setIsAddingToCart(true);
     const configuredOptions = {
        size: selectedSize,
        roof: selectedRoof,
        panels: selectedPanels,
    };

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: baseProduct?.id || 'gazebo-generic',
      name: baseProduct?.name || 'Custom Gazebo',
      category: 'gazebo',
      quantity: 1, 
      unitPrice: currentPrice, 
      options: configuredOptions,
      // image: baseProduct?.images?.[0], 
    };

    dispatch(addItem(cartItem));
    console.log('Added gazebo to cart:', cartItem);

    // Show success feedback via Snackbar
    setSnackbarSeverity('success');
    setSnackbarMessage(`Gazebo added to cart! Price: £${currentPrice.toFixed(2)}`);
    setSnackbarOpen(true);

    setIsAddingToCart(false);
     // TODO: Optionally clear form or navigate
   };

   const requiredOptionsSelected = !!selectedSize && !!selectedRoof && !!selectedPanels;

  // --- Render ---
   if (isLoading) {
    return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /><Typography>Loading product details...</Typography></Container>;
  }

  if (error) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!baseProduct) {
     return <Container sx={{ mt: 5 }}><Alert severity="warning">Could not load product data.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Configure Your {baseProduct.name || 'Gazebo'}
      </Typography>
       <Paper sx={{ p: 3 }}>
          {/* Display base price info if needed */}
          {baseProduct.options?.basePrice && <Typography sx={{mb:2}}>Base Price: £{baseProduct.options.basePrice.toFixed(2)}</Typography>}

         <Grid container spacing={3}>
             {/* Size Selector */}
            <Grid item xs={12} sm={4}>
                 <FormControl fullWidth required error={!selectedSize}>
                    <InputLabel id="size-select-label">Size</InputLabel>
                    <Select
                        labelId="size-select-label"
                        id="size-select"
                        name="size"
                        value={selectedSize}
                        label="Size"
                        onChange={handleSizeChange}
                    >
                        <MenuItem value=""><em>Select Size...</em></MenuItem>
                        {availableSizes.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} {/* Base price removed */}
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
             {/* Roof Selector */}
             <Grid item xs={12} sm={4}>
                  <FormControl fullWidth required error={!selectedRoof}>
                    <InputLabel id="roof-select-label">Roof Style</InputLabel>
                    <Select
                        labelId="roof-select-label"
                        id="roof-select"
                        name="roof"
                        value={selectedRoof}
                        label="Roof Style"
                        onChange={handleRoofChange}
                    >
                       <MenuItem value=""><em>Select Roof...</em></MenuItem>
                        {availableRoofs.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} (x{opt.priceModifierFactor})
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
             </Grid>
              {/* Panel Selector */}
              <Grid item xs={12} sm={4}>
                   <FormControl fullWidth required error={!selectedPanels}>
                    <InputLabel id="panels-select-label">Side Panels</InputLabel>
                    <Select
                        labelId="panels-select-label"
                        id="panels-select"
                        name="panels"
                        value={selectedPanels}
                        label="Side Panels"
                        onChange={handlePanelsChange}
                    >
                       <MenuItem value=""><em>Select Panels...</em></MenuItem>
                        {availablePanels.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} (+£{opt.priceModifierPerSide * NUMBER_OF_SIDES})
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
              </Grid>

            {/* TODO: Visualiser Placeholder */}
             <Grid item xs={12}>
                 <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', textAlign: 'center', minHeight: '150px' }}>
                    <Typography color="text.secondary">Visualiser Placeholder</Typography>
                 </Box>
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
                            !baseProduct?.options?.basePrice || // Disable if base price missing
                            baseProduct.options.basePrice <= 0
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

export default GazeboConfigPage;
