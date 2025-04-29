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
  TextField,
  Grid,
  Paper,
  Alert,
  InputAdornment,
  Snackbar // Add Snackbar import
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// --- Option Interfaces & Data ---
interface FlooringThicknessOption { value: string; label: string; } // Price now comes from baseProduct
interface FlooringGradeOption { value: string; label: string; priceModifierFactor: number; } // Multiplier
interface FlooringFinishOption { value: string; label: string; priceModifierPerSqM: number; }
// TODO: Fetch these from Firestore or product options
const availableThicknesses: FlooringThicknessOption[] = [
    { value: '14', label: '14mm' },
    { value: '20', label: '20mm' },
    { value: '22', label: '22mm' },
];
const availableGrades: FlooringGradeOption[] = [
    { value: 'character', label: 'Character Grade', priceModifierFactor: 1.0 },
    { value: 'prime', label: 'Prime Grade', priceModifierFactor: 1.25 },
    { value: 'rustic', label: 'Rustic Grade', priceModifierFactor: 0.9 },
];
const availableFinishes: FlooringFinishOption[] = [
    { value: 'unfinished', label: 'Unfinished', priceModifierPerSqM: 0 },
    { value: 'oil', label: 'Natural Oil', priceModifierPerSqM: 8 },
    { value: 'lacquer', label: 'Clear Lacquer', priceModifierPerSqM: 10 },
];

// --- Component ---
const OakFlooringConfigPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [baseProduct, setBaseProduct] = useState<ProductData | null>(null); // Store fetched product
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [selectedArea, setSelectedArea] = useState<string>(''); // Area in m² (string for TextField)
  const [selectedThickness, setSelectedThickness] = useState<string>(''); // Thickness value (string '14', '20' etc.)
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('');
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
                if (typeof data.options?.basePricePerSquareMeter !== 'number' || data.options.basePricePerSquareMeter <= 0) {
                     console.warn(`Product ${productId} has missing or invalid basePricePerSquareMeter.`);
                     // Keep error state null for now, handle price calculation later
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
  const calculateFlooringPrice = (
      basePricePerSqM: number | undefined | null,
      areaSqM: number,
      thicknessValue: string, // Not used for price anymore, but kept for validation consistency
      gradeValue: string,
      finishValue: string
  ): number | null => {
    
     // Validate base price and area
     if (typeof basePricePerSqM !== 'number' || basePricePerSqM <= 0) {
        return null; // Cannot calculate without valid base price
     }
     if (isNaN(areaSqM) || areaSqM <= 0) {
        return null; // Invalid area
     }

     // Find selected options (ensure they exist for modifier lookup)
     const gradeOption = availableGrades.find(g => g.value === gradeValue);
     const finishOption = availableFinishes.find(f => f.value === finishValue);
     const thicknessOption = availableThicknesses.find(t => t.value === thicknessValue); // Still needed to check selection validity

     // Check if all selections are valid and found
     if (!thicknessOption || !gradeOption || !finishOption) {
         console.error("Selected option not found in available options during calculation");
         return null; // Or set an error
     }

    // Calculate price using the validated basePricePerSqM
    const baseCost = areaSqM * basePricePerSqM * gradeOption.priceModifierFactor;
    const finishCost = areaSqM * finishOption.priceModifierPerSqM;
    const totalPrice = baseCost + finishCost;

    return totalPrice;
  };
  // Recalculate price whenever a relevant option changes
  useEffect(() => {
    const areaSqM = parseFloat(selectedArea);
    // Only calculate if all inputs are valid selections
    if (selectedArea && selectedThickness && selectedGrade && selectedFinish) {
      const price = calculateFlooringPrice(
          baseProduct?.options?.basePricePerSquareMeter,
          areaSqM,
          selectedThickness,
          selectedGrade,
          selectedFinish
      );
      setCurrentPrice(price);
    } else {
        setCurrentPrice(null); // Options incomplete
    }
  }, [baseProduct, selectedArea, selectedThickness, selectedGrade, selectedFinish]);


  // --- Handlers ---
   const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedArea(event.target.value);
  };
  const handleThicknessChange = (event: SelectChangeEvent<string>) => {
    setSelectedThickness(event.target.value);
  };
  const handleGradeChange = (event: SelectChangeEvent<string>) => {
    setSelectedGrade(event.target.value);
  };
   const handleFinishChange = (event: SelectChangeEvent<string>) => {
    setSelectedFinish(event.target.value);
  };

  const handleAddToCart = () => {
     setError(null);
     // Use Snackbar for validation feedback
     // Check base price first
     if (!baseProduct?.options?.basePricePerSquareMeter || baseProduct.options.basePricePerSquareMeter <= 0) {
        setSnackbarSeverity('error');
        setSnackbarMessage("Cannot add to cart: Base price information missing or invalid.");
        setSnackbarOpen(true);
        return;
     }
      // Check selections
     const areaSqM = parseFloat(selectedArea);
     if (isNaN(areaSqM) || areaSqM <= 0) { setSnackbarSeverity('warning'); setSnackbarMessage("Please enter a valid area in square meters."); setSnackbarOpen(true); return; }
     if (!selectedThickness) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a thickness."); setSnackbarOpen(true); return; }
     if (!selectedGrade) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a grade."); setSnackbarOpen(true); return; }
     if (!selectedFinish) { setSnackbarSeverity('warning'); setSnackbarMessage("Please select a finish."); setSnackbarOpen(true); return; }
     // Check calculated price
     if (currentPrice === null) { 
         setSnackbarSeverity('error'); 
         setSnackbarMessage("Could not calculate price. Check selections and base product data."); 
         setSnackbarOpen(true); 
         return; 
     }

    setIsAddingToCart(true);
    const configuredOptions = {
        area: `${areaSqM}m²`,
        thickness: `${selectedThickness}mm`, // Store with unit
        grade: selectedGrade,
        finish: selectedFinish,
    };

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: baseProduct?.id || 'oak-flooring-generic',
      name: baseProduct?.name || 'Custom Oak Flooring',
      category: 'flooring',
      quantity: 1, // Typically flooring is sold as one "job lot" based on area? Adjust if needed.
      unitPrice: currentPrice, // Total price for the specified area is the unit price here.
      options: configuredOptions,
      // image: baseProduct?.images?.[0], 
    };

    dispatch(addItem(cartItem));
    console.log('Added flooring to cart:', cartItem);
    
    // Show success feedback via Snackbar
    setSnackbarSeverity('success');
    setSnackbarMessage(`Oak Flooring added to cart! Area: ${areaSqM}m², Price: £${currentPrice.toFixed(2)}`);
    setSnackbarOpen(true);

    setIsAddingToCart(false);
    // TODO: Optionally clear form or navigate
  };

  const requiredOptionsSelected = !!selectedArea && parseFloat(selectedArea) > 0 && !!selectedThickness && !!selectedGrade && !!selectedFinish;

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
        Configure Your {baseProduct.name || 'Oak Flooring'}
      </Typography>
      <Paper sx={{ p: 3 }}>
        {/* Display base price info if needed */}
        {baseProduct.options?.basePricePerSquareMeter && <Typography sx={{mb:2}}>Base Price: £{baseProduct.options.basePricePerSquareMeter.toFixed(2)}/m²</Typography>}

        <Grid container spacing={3}>
            {/* Area Input */}
            <Grid item xs={12} sm={6}>
                 <TextField
                    required
                    fullWidth
                    id="area"
                    label="Area Required"
                    name="area"
                    type="number"
                    InputProps={{ 
                        inputProps: { min: 0.1, step: 0.1 },
                        endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                    }}
                    value={selectedArea}
                    onChange={handleAreaChange}
                    error={!selectedArea || parseFloat(selectedArea) <= 0}
                 />
            </Grid>
            {/* Thickness Selector */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!selectedThickness}>
                    <InputLabel id="thickness-select-label">Thickness</InputLabel>
                    <Select
                        labelId="thickness-select-label"
                        id="thickness-select"
                        name="thickness"
                        value={selectedThickness}
                        label="Thickness"
                        onChange={handleThicknessChange}
                    >
                        <MenuItem value=""><em>Select Thickness...</em></MenuItem>
                        {availableThicknesses.map(opt => 
                           <MenuItem key={opt.value} value={opt.value}>
                               {opt.label} {/* Price now comes from base */}
                           </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
             {/* Grade Selector */}
            <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required error={!selectedGrade}>
                    <InputLabel id="grade-select-label">Grade</InputLabel>
                    <Select
                        labelId="grade-select-label"
                        id="grade-select"
                        name="grade"
                        value={selectedGrade}
                        label="Grade"
                        onChange={handleGradeChange}
                    >
                        <MenuItem value=""><em>Select Grade...</em></MenuItem>
                         {availableGrades.map(opt => 
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label} (x{opt.priceModifierFactor})
                            </MenuItem>
                         )}
                    </Select>
                </FormControl>
            </Grid>
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
                         {availableFinishes.map(opt => 
                             <MenuItem key={opt.value} value={opt.value}>
                                {opt.label} (+£{opt.priceModifierPerSqM}/m²)
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
                             Estimated Price for {selectedArea || '0'}m²: £{currentPrice.toFixed(2)}
                         </Typography>
                     ) : (
                         <Typography color="text.secondary">Enter area and select all options to see price.</Typography>
                     )}
                     <Button
                        variant="contained"
                        color="primary"
                        startIcon={isAddingToCart ? <CircularProgress size={20} color="inherit" /> : <AddShoppingCartIcon />}
                        disabled={
                            !requiredOptionsSelected || 
                            currentPrice === null || 
                            isAddingToCart ||
                            !baseProduct?.options?.basePricePerSquareMeter || // Disable if base price missing
                            baseProduct.options.basePricePerSquareMeter <= 0
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

export default OakFlooringConfigPage;
