import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDocument, updateDocument, ProductData } from '../../services/firebase';
import {
  Container,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Paper,
  Box,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

// Import the category-specific components
import GarageOptions from './options/GarageOptions';
import BeamOptions from './options/BeamOptions';
import FlooringOptions from './options/FlooringOptions';
import GazeboOptions from './options/GazeboOptions';
import PorchOptions from './options/PorchOptions';

// Placeholder component for category options (we'll replace with actual components later)
const OptionEditor: React.FC<{
  category: string;
  productOptions: any;
  onChange: (options: any) => void;
}> = ({ category, productOptions, onChange }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {category.charAt(0).toUpperCase() + category.slice(1)} Options
      </Typography>
      <Alert severity="info">
        Option editor for {category} will be implemented here. This will allow editing arrays like 
        {category === 'garage' && ' availableSizes, availableRoofs'}
        {category === 'beam' && ' availableWidths, availableThicknesses, availableFinishes, availableProfiles'}
        {category === 'flooring' && ' availableThicknesses, availableGrades, availableFinishes'}
        {category === 'gazebo' && ' availableSizes, availableRoofs, availablePanels'}
        {category === 'porch' && ' availableStyles, availableRoofs, availablePosts, availableTrusses'}
        .
      </Alert>
    </Box>
  );
};

const ProductOptionsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch product data based on productId
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const productData = await getDocument<ProductData>('products', productId);
        if (productData) {
          setProduct(productData);
        } else {
          setError(`Product with ID "${productId}" not found.`);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle option changes
  const handleOptionsChange = (newOptions: any) => {
    if (product) {
      setProduct({
        ...product,
        options: {
          ...product.options,
          ...newOptions
        }
      });
    }
  };

  // Save changes back to Firestore
  const handleSave = async () => {
    if (!product || !productId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateDocument('products', productId, { options: product.options });
      setSnackbar({
        open: true,
        message: 'Options saved successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving options:', err);
      setError('Failed to save changes. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error saving options.',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Loading and error handling
  if (isLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading product data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/admin/prices" sx={{ mt: 2 }}>
          Back to Base Prices
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Product not found.</Alert>
        <Button component={Link} to="/admin/prices" sx={{ mt: 2 }}>
          Back to Base Prices
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/admin/prices" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Manage Options: {product.name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Options'}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Product Details</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography><strong>ID:</strong> {product.id}</Typography>
          <Typography><strong>Category:</strong> {product.category}</Typography>
          <Typography><strong>Base Price Field:</strong> {
            product.category === 'beam' ? 'basePricePerCubicMeter' :
            product.category === 'flooring' ? 'basePricePerSquareMeter' :
            'basePrice'
          }</Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Render the appropriate options editor based on product category */}
        {product.category === 'garage' ? (
          <GarageOptions
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        ) : product.category === 'beam' ? (
          <BeamOptions
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        ) : product.category === 'flooring' ? (
          <FlooringOptions
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        ) : product.category === 'gazebo' ? (
          <GazeboOptions
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        ) : product.category === 'porch' ? (
          <PorchOptions
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        ) : (
          <OptionEditor
            category={product.category}
            productOptions={product.options || {}}
            onChange={handleOptionsChange}
          />
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductOptionsPage;

