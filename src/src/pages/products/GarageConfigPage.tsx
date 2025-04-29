import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { getDocument, ProductData } from '../../services/firebase';
import { addItem, CartItem } from '../../store/slices/cartSlice'; // Import cart actions and type
import { 
  Box, 
  Button, // Import Button
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  CircularProgress,
  SelectChangeEvent,
  Snackbar, // Import Snackbar
  Alert // Import Alert
} from '@mui/material';

// Define interfaces for structured options
interface SizeOption {
  value: string;
  label: string;
  priceModifier: number;
}
interface RoofOption {
  value: string;
  label: string;
  priceModifier: number;
}

const GarageConfigPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch(); // Get dispatch function
  const [baseProduct, setBaseProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Example configuration state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedRoof, setSelectedRoof] = useState<string>('');

  // State for Snackbar feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  // --- Fetch Base Product ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');

    if (!productId) {
      setError("Product ID not found in URL.");
      setIsLoading(false);
      return;
    }

    const fetchBaseProduct = async () => {
      setIsLoading(true);
      setError(null);
      setBaseProduct(null);
      try {
        const productData = await getDocument<ProductData>('products', productId);
        if (productData) {
          setBaseProduct(productData);
          // TODO: Fetch specific garage config options based on productData if needed
        } else {
          setError(`Garage base product with ID "${productId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching base product:", err);
        setError("Failed to load base product information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBaseProduct();
  }, [location.search]); // Rerun if query params change

  // --- Structured Options Data ---
  // TODO: These could come from baseProduct.options or a separate config fetch
  const availableSizes: SizeOption[] = [
    { value: '3x4', label: '3m x 4m', priceModifier: 0 },
    { value: '4x5', label: '4m x 5m', priceModifier: 500 },
    { value: '5x6', label: '5m x 6m', priceModifier: 1000 },
  ];
  
  const availableRoofTypes: RoofOption[] = [
    { value: 'apex', label: 'Apex Roof', priceModifier: 0 },
    { value: 'pent', label: 'Pent Roof', priceModifier: 150 },
    { value: 'barn', label: 'Barn End', priceModifier: 300 },
  ];

  // --- Event Handlers ---
  const handleSizeChange = (event: SelectChangeEvent<string>) => {
    setSelectedSize(event.target.value as string);
  };

  const handleRoofChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoof(event.target.value as string);
  };

  // --- Price Calculation based on selected options ---
  const calculatePrice = (
    basePrice: number | undefined | null, // Allow undefined/null
    selectedSizeValue: string, 
    selectedRoofValue: string
  ): number | null => { // Return null if price cannot be calculated
    // Validate base price
    if (typeof basePrice !== 'number' || basePrice <= 0) {
      return null; 
    }
    
    let price = basePrice;

    const sizeOption = availableSizes.find(opt => opt.value === selectedSizeValue);
    if (sizeOption) {
      price += sizeOption.priceModifier;
    }

    const roofOption = availableRoofTypes.find(opt => opt.value === selectedRoofValue);
    if (roofOption) {
      price += roofOption.priceModifier;
    }

    // TODO: Add calculations for other options (doors, windows, etc.)
    
    return price;
  };

  // --- Add to Cart Handler ---
  const handleAddToCart = () => {
    if (!baseProduct || !selectedSize || !selectedRoof) {
      setSnackbarMessage("Please select all configuration options.");
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    // Validate base price before proceeding
    if (!baseProduct.options?.basePrice || baseProduct.options.basePrice <= 0) {
      setSnackbarMessage("Cannot add to cart: Base price missing or invalid.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Calculate price using validated base price
    const currentPrice = calculatePrice(baseProduct.options.basePrice, selectedSize, selectedRoof);
    
    // Double-check price calculation didn't fail (shouldn't due to above check, but good practice)
    if (currentPrice === null) {
        setSnackbarMessage("Cannot add to cart: Price calculation failed.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    // Store selected labels for display, or reconstruct later if needed
    // const selectedSizeLabel = availableSizes.find(s => s.value === selectedSize)?.label || selectedSize;
    // const selectedRoofLabel = availableRoofTypes.find(r => r.value === selectedRoof)?.label || selectedRoof;
    const configuredOptions = { 
        size: selectedSize, // Value like '3x4'
        roof: selectedRoof, // Value like 'apex'
        // sizeLabel: selectedSizeLabel, // Optionally store labels too
        // roofLabel: selectedRoofLabel,
    };

    const cartItem: CartItem = {
      id: uuidv4(), // Generate unique ID for this cart item
      productId: baseProduct.id,
      name: baseProduct.name,
      quantity: 1,
      unitPrice: currentPrice, // Use unitPrice as per existing slice
      category: baseProduct.category, // Add category
      image: baseProduct.images?.[0],
      options: configuredOptions,
    };

    dispatch(addItem(cartItem));
    console.log('Added to cart:', cartItem);
    
    // Show success feedback
    setSnackbarMessage(`${baseProduct.name} added to cart!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // TODO: Optionally reset selections or navigate?
    // setSelectedSize('');
    // setSelectedRoof('');
  };

  // Determine if required options are selected
  const optionsSelected = !!selectedSize && !!selectedRoof;
  // Calculate current price based on selections for display
  const currentPrice: number | null = baseProduct && optionsSelected 
    ? calculatePrice(baseProduct.options?.basePrice, selectedSize, selectedRoof)
    : (typeof baseProduct?.options?.basePrice === 'number' && baseProduct.options.basePrice > 0 ? baseProduct.options.basePrice : null); // Show valid base price or null if options not selected/base price invalid
  
  // --- Render Logic ---
  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!baseProduct) {
    return <Typography>Could not load product data.</Typography>;
  }

  return (
    <div>
      <h1>Configure Your {baseProduct.name || 'Garage'}</h1>

      {/* Configuration Options */}
      <section>
        <h2>Options</h2>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          {/* Size Selector */}
          <FormControl fullWidth>
            <InputLabel id="size-select-label">Size</InputLabel>
            <Select
              labelId="size-select-label"
              id="size-select"
              value={selectedSize}
              label="Size"
              onChange={handleSizeChange}
            >
              <MenuItem value=""><em>Select Size...</em></MenuItem>
              {availableSizes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} (+£{option.priceModifier}) {/* Show price modifier */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Roof Type Selector */}
          <FormControl fullWidth>
            <InputLabel id="roof-select-label">Roof Type</InputLabel>
            <Select
              labelId="roof-select-label"
              id="roof-select"
              value={selectedRoof}
              label="Roof Type"
              onChange={handleRoofChange}
            >
              <MenuItem value=""><em>Select Roof Type...</em></MenuItem>
              {availableRoofTypes.map((option) => (
                 <MenuItem key={option.value} value={option.value}>
                   {option.label} (+£{option.priceModifier}) {/* Show price modifier */}
                 </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* TODO: Add more configuration options (doors, windows, cladding, etc.) */}
        </Box>
      </section>

      {/* Placeholder for Visualiser */}
      <section>
        <h2>Visualiser</h2>
        {/* TODO: Integrate or build a 3D visualiser */}
        <p>A visualiser preview will go here.</p>
      </section>

      {/* Placeholder for Price Summary and Add to Cart */}
      <section>
        <h2>Summary</h2>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Estimated Price: {currentPrice !== null ? `£${currentPrice.toFixed(2)}` : '£N/A'}
          </Typography>
          {/* TODO: Add detailed price breakdown */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            disabled={
              isLoading || 
              !baseProduct || 
              !optionsSelected || 
              !baseProduct.options?.basePrice || 
              baseProduct.options.basePrice <= 0 || // Disable if base price is missing/invalid
              currentPrice === null // Disable if final price calculation failed
            } 
            sx={{ mt: 2 }}
          >
            Add to Cart
          </Button>
        </Box>
      </section>
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
    </div>
  );
};

export default GarageConfigPage;

