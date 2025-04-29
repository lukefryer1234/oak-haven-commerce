import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, ProductData, deleteDocument } from '../../services/firebase'; // Import deleteDocument
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // For fetch errors
  const [deleteError, setDeleteError] = useState<string | null>(null); // For delete errors
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // Track which product is being deleted
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsRef = collection(db, 'products');
        // Order by category first, then by name
        const q = query(productsRef, orderBy('category'), orderBy('name')); 
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductData[]; 
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Fetch once on component mount

  const handleDeleteProduct = async (productId: string, productName: string) => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to permanently delete "${productName}" (ID: ${productId})? This action cannot be undone.`)) {
      setIsDeletingId(productId); // Set loading state for this specific product
      setDeleteError(null); // Clear previous delete errors
      setError(null); // Clear previous fetch errors

      try {
        await deleteDocument('products', productId);
        // Remove the product from the local state on successful deletion
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        // Optionally show a success Snackbar message here
        console.log(`Product ${productId} deleted successfully.`);
      } catch (err) {
        console.error("Error deleting product:", err);
        setDeleteError(`Failed to delete product "${productName}" (ID: ${productId}). Please try again.`);
      } finally {
        setIsDeletingId(null); // Clear loading state for this product
      }
    }
  };


  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading products...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div"> 
          Manage Products 
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/products/add" // Define this route in App.tsx if not already present
        >
          Add New Product
        </Button>
      </Box>

      {/* Display delete errors */}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {products.length === 0 && !isLoading ? ( // Check isLoading here too
        <Typography sx={{ mt: 2 }}>No products found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>ID</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.id}</TableCell> {/* Consider shortening */}
                  <TableCell align="center">
                    <IconButton 
                      component={Link} 
                      to={`/admin/products/edit/${product.id}`} // Define this route too
                      aria-label="edit"
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete" 
                      color="error"
                      size="small"
                      onClick={() => handleDeleteProduct(product.id, product.name)} 
                      disabled={isLoading || isDeletingId === product.id} // Disable while fetching list or deleting this item
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminProductsPage;

