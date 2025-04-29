import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, ProductData } from '../../services/firebase'; // Adjust path as necessary
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, ProductData } from '../../services/firebase'; // Adjust path as necessary
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  InputAdornment,
  AlertColor,
  IconButton // Import IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // Import an icon

interface ProductWithPriceString extends ProductData {
  options: {
    basePrice?: string | number; // Store input as string temporarily
    basePricePerSquareMeter?: string | number;
    basePricePerCubicMeter?: string | number;
    [key: string]: any; // Allow other option properties
  };
}

// Helper to get the correct field name and label
const getBasePriceInfo = (category: string): { field: string; label: string } => {
  switch (category) {
    case 'beam':
      return { field: 'basePricePerCubicMeter', label: 'Base Price/m³' };
    case 'flooring':
      return { field: 'basePricePerSquareMeter', label: 'Base Price/m²' };
    case 'garage':
    case 'gazebo':
    case 'porch':
    default:
      return { field: 'basePrice', label: 'Base Price' };
  }
};


const AdminPricesPage: React.FC = () => {
  const [products, setProducts] = useState<ProductWithPriceString[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const configurableCategories = ['garage', 'beam', 'flooring', 'gazebo', 'porch'];
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('category', 'in', configurableCategories));
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data() as ProductData;
            // Ensure options exist and convert initial price numbers to strings for editing
            const options = data.options || {};
            const { field } = getBasePriceInfo(data.category);
            if (options[field] !== undefined && typeof options[field] === 'number') {
                 options[field] = options[field].toString();
            } else if (options[field] === undefined) {
                 options[field] = ''; // Initialize if missing
            }

            return {
                ...data,
                id: docSnap.id,
                options, // Use the potentially modified options
            } as ProductWithPriceString;
        });

        // Sort products by category, then name for consistent order
        fetchedProducts.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
        setSnackbar({ open: true, message: 'Error fetching products.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePriceChange = (productId: string, newPrice: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const { field } = getBasePriceInfo(p.category);
          return {
            ...p,
            options: {
              ...p.options,
              [field]: newPrice, // Store as string
            },
          };
        }
        return p;
      })
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);

    const batch = writeBatch(db);
    let validationErrors: string[] = [];

    // --- Validation Phase ---
    products.forEach(product => {
      const { field } = getBasePriceInfo(product.category);
      const priceValue = product.options[field];

      if (typeof priceValue !== 'string' || priceValue.trim() === '') {
         validationErrors.push(`Price for ${product.name} cannot be empty.`);
         return; // Skip further checks for this product
      }
      
      const priceNum = parseFloat(priceValue);
      if (isNaN(priceNum) || priceNum < 0) {
        validationErrors.push(`Invalid price format for ${product.name}: "${priceValue}". Must be a non-negative number.`);
      }
    });

    if (validationErrors.length > 0) {
      setSnackbar({ open: true, message: `Validation failed: ${validationErrors[0]}`, severity: 'error' });
      setIsSaving(false);
      return;
    }

    // --- Batch Update Phase ---
    products.forEach(product => {
      const { field } = getBasePriceInfo(product.category);
      const priceValue = product.options[field] as string; // Known to be valid string now
      const priceNum = parseFloat(priceValue); // Known to be valid number now
      
      const docRef = doc(db, 'products', product.id);
      // Use dot notation for nested fields in update
      batch.update(docRef, { [`options.${field}`]: priceNum }); 
    });

    try {
      await batch.commit();
      setSnackbar({ open: true, message: 'Prices updated successfully!', severity: 'success' });
    } catch (err) {
      console.error("Error saving prices:", err);
      setError("Failed to save prices. Please try again.");
      setSnackbar({ open: true, message: 'Error saving prices.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
   const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Base Prices
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading products...</Typography>
          </Box>
        ) : error && products.length === 0 ? ( // Show fetch error only if list is empty
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="base prices table">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell align="center">Options</TableCell> {/* Add Header */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => {
                    const { field, label } = getBasePriceInfo(product.category);
                    const currentPriceValue = product.options[field] ?? ''; // Default to empty string

                    return (
                      <TableRow
                        key={product.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <TextField
                            label={label}
                            type="number"
                            size="small"
                            value={currentPriceValue}
                            onChange={(e) => handlePriceChange(product.id, e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">£</InputAdornment>,
                              inputProps: { step: "0.01", min: "0" } 
                            }}
                            // Basic visual feedback for empty/invalid could be added here via 'error' prop if desired
                            // error={typeof currentPriceValue === 'string' && (currentPriceValue.trim() === '' || isNaN(parseFloat(currentPriceValue)) || parseFloat(currentPriceValue) < 0)}
                          />
                        </TableCell>
                        <TableCell align="center"> {/* Add Cell for Button */}
                          <IconButton
                            component={Link}
                            to={`/admin/prices/options/${product.id}`}
                            size="small"
                            aria-label="edit options"
                            title="Edit Configuration Options & Modifiers" // Tooltip
                           >
                            <SettingsIcon /> 
                           </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={isSaving || isLoading}
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
             {/* Display general save error if it occurs */}
             {error && !isLoading && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </>
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

export default AdminPricesPage;
