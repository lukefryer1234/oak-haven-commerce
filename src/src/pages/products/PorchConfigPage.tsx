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
interface PorchStyleOption { value: string; label: string; /* Base price now fetched */ }
interface PorchRoofOption { value: string; label: string; priceModifierFactor: number; } // Price multiplier
interface PorchPostOption { value: string; label: string; priceModifierPerPost: number; }
interface PorchTrussOption { value: string; label: string; priceModifier: number; }

// TODO: Fetch these from Firestore or product options
const availableStyles: PorchStyleOption[] = [
    { value: 'wall_lean', label: 'Wall Mounted Lean-To (2m x 1.5m)' },
    { value: 'wall_apex', label: 'Wall Mounted Apex (2m x 1.5m)' },
    { value: 'free_apex', label: 'Free Standing Apex (2m x 1.5m)' },
];
// Note: Roof options might be tied to Style options in reality
const availableRoofs: PorchRoofOption[] = [
    { value: 'standard_pitch', label: 'Standard Pitch', priceModifierFactor: 1.0 },
    { value: 'low_pitch', label: 'Low Pitch', priceModifierFactor: 1.0 }, // Example factor
];
const availablePosts: PorchPostOption[] = [
    { value: 'standard_150', label: 'Standard 150mm Posts', priceModifierPerPost: 0 },
    { value: 'chamfer_150', label: 'Chamfered 150mm Posts', priceModifierPerPost: 25 },
    { value: 'curved_150', label: 'Curved 150mm Posts', priceModifierPerPost: 60 },
];
const availableTrusses: PorchTrussOption[] = [
    { value: 'standard', label: 'Standard Truss', priceModifier: 0 },
    { value: 'curved_brace', label: 'Curved Brace Truss', priceModifier: 120 },
    { value: 'king_post', label: 'King Post Truss', priceModifier: 180 },
];
const NUMBER_OF_POSTS = 2; // Common for porches

// --- Component ---
const PorchConfigPage: React.FC = () => {
  const location = useLocation(); // Optional
  const dispatch = useDispatch();
  const [baseProduct, setBaseProduct] = useState<ProductData | null>(null); // Store fetched product
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedRoof, setSelectedRoof] = useState<string>(''); // May depend on style
  const [selectedPosts, setSelectedPosts] = useState<string>('');
  const [selectedTruss, setSelectedTruss] = useState<string>('');
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
  const calculatePorchPrice = (
      basePrice: number | undefined | null,
      styleValue: string,
      roofValue: string,
      postsValue: string,
      trussValue: string
  ): number | null => {
    
     // Validate base price first
     if (typeof basePrice !== 'number' || basePrice <= 0) {
        return null; 
     }

     // Find selected options
     const styleOption = availableStyles.find(s => s.value === styleValue);
     const roofOption = availableRoofs.find(r => r.value === roofValue);
     const postOption = availablePosts.find(p => p.value === postsValue);
     const trussOption = availableTrusses.find(t => t.value === trussValue);

     // Check if all selections are valid and options found
     if (!styleOption || !roofOption || !postOption || !trussOption) {
         console.error("Selected option not found during price calculation");
         return null; 
     }

     // Use the validated basePrice argument
     const roofAdjustedPrice = basePrice * roofOption.priceModifierFactor; // Apply roof factor
     const postCost = postOption.priceModifierPerPost * NUMBER_OF_POSTS;
     const trussCost = trussOption.priceModifier;
     
     const totalPrice = roofAdjustedPrice + postCost + trussCost;

     return totalPrice;
  };
   // Recalculate price whenever a relevant option or base product changes
   useEffect(() => {
       // Only calculate if all options are selected
       if (selectedStyle && selectedRoof && selectedPosts && selectedTruss) {
           const price = calculatePorchPrice(
               baseProduct?.options?.basePrice,
               selectedStyle,
               selectedRoof,
               selectedPosts,
               selectedTruss
           );
           setCurrentPrice(price);
       } else {
           setCurrentPrice(null); // Options incomplete
       }
  }, [baseProduct, selectedStyle, selectedRoof, selectedPosts, selectedTruss]);

   // --- Handlers ---
   const handleStyleChange = (event: SelectChangeEvent<string>) => {
    setSelectedStyle(event.target.value);
    // TODO: Potentially reset/filter dependent options like roof type if needed
    // setSelectedRoof(''); 
  };
   const handleRoofChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoof(event.target.value);
  };
   const handlePostsChange = (event: SelectChangeEvent<string>) => {
    setSelectedPosts(event.target.value);
  };
   const handleTrussChange = (event: SelectChangeEvent<string>) => {
    setSelectedTruss(event.target.value);
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
    if (!selectedStyle || !selectedRoof || !selectedPosts || !selectedTruss) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select all options."); setSnackbarOpen(true); return; }
    // Check calculated price
    if (currentPrice === null) { 
        setSnackbarSeverity('error'); 
        setSnackbarMessage("Could not calculate price. Check selections and base product data."); 
        setSnackbarOpen(true); 
        return; 
    }

    setIsAddingToCart(true);
     const configuredOptions = {
        style: selectedStyle,
        roof: selectedRoof,
        posts: selectedPosts,
        truss: selectedTruss,
    };

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: baseProduct?.id || 'porch-generic',
      name: baseProduct?.name || 'Custom Oak Porch',
      category: 'porch',
      quantity: 1, 
      unitPrice: currentPrice, 
      options: configuredOptions,
      // image: baseProduct?.images?.[0], 
    };

    dispatch(addItem(cartItem));
    console.log('Added porch to cart:', cartItem);

    // Show success feedback via Snackbar
    setSnackbarSeverity('success');
    setSnackbarMessage(`Porch added to cart! Price: £${currentPrice.toFixed(2)}`);
    setSnackbarOpen(true);

    setIsAddingToCart(false);
     // TODO: Optionally clear form or navigate
   };

   const requiredOptionsSelected = !!selectedStyle && !!selectedRoof && !!selectedPosts && !!selectedTruss;

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
        Configure Your {baseProduct.name || 'Porch'}
      </Typography>
       <Paper sx={{ p: 3 }}>
          {/* Display base price info if needed */}
          {baseProduct.options?.basePrice && <Typography sx={{mb:2}}>Base Price: £{baseProduct.options.basePrice.toFixed(2)}</Typography>}

         <Grid container spacing={3}>
             {/* Style Selector */}
            <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required error={!selectedStyle}>
                    <InputLabel id="style-select-label">Style & Size</InputLabel>
                    <Select
                        labelId="style-select-label"
                        id="style-select"
                        name="style"
                        value={selectedStyle}
                        label="Style & Size"
                        onChange={handleStyleChange}
                    >
                        <MenuItem value=""><em>Select Style...</em></MenuItem>
                        {availableStyles.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} {/* Base price removed */}
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
             {/* Roof Selector */}
             <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!selectedRoof}>
                    <InputLabel id="roof-select-label">Roof Type</InputLabel>
                    <Select
                        labelId="roof-select-label"
                        id="roof-select"
                        name="roof"
                        value={selectedRoof}
                        label="Roof Type"
                        onChange={handleRoofChange}
                        // Disable if style dictates roof type?
                    >
                       <MenuItem value=""><em>Select Roof...</em></MenuItem>
                        {availableRoofs.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} {/* Modifier applied in calc */}
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
             </Grid>
              {/* Post Selector */}
              <Grid item xs={12} sm={6}>
                   <FormControl fullWidth required error={!selectedPosts}>
                    <InputLabel id="posts-select-label">Post Style</InputLabel>
                    <Select
                        labelId="posts-select-label"
                        id="posts-select"
                        name="posts"
                        value={selectedPosts}
                        label="Post Style"
                        onChange={handlePostsChange}
                    >
                       <MenuItem value=""><em>Select Posts...</em></MenuItem>
                        {availablePosts.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} (+£{opt.priceModifierPerPost * NUMBER_OF_POSTS})
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
              </Grid>
               {/* Truss Selector */}
              <Grid item xs={12} sm={6}>
                   <FormControl fullWidth required error={!selectedTruss}>
                    <InputLabel id="truss-select-label">Truss Style</InputLabel>
                    <Select
                        labelId="truss-select-label"
                        id="truss-select"
                        name="truss"
                        value={selectedTruss}
                        label="Truss Style"
                        onChange={handleTrussChange}
                    >
                       <MenuItem value=""><em>Select Truss...</em></MenuItem>
                        {availableTrusses.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} (+£{opt.priceModifier})
                           </MenuItem>
                        )}
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

export default PorchConfigPage;
