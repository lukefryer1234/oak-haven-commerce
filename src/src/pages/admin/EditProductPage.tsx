import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Alert, CircularProgress, Box } from '@mui/material';
import ProductForm from '../../components/admin/ProductForm'; // Adjust path if needed
import { getDocument, updateDocument, ProductData } from '../../services/firebase'; // Adjust path if needed

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing product data
  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing from URL.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDocument<ProductData>('products', productId);
        if (data) {
          setProductData(data);
        } else {
          setError(`Product with ID "${productId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle form submission for updating
  const handleUpdateProduct = async (updatedData: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!productId) {
        setError("Cannot save changes: Product ID is missing.");
        return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      // updateDocument should handle the updatedAt timestamp
      await updateDocument('products', productId, updatedData);
      navigate('/admin/products'); // Navigate back to product list on success
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to save changes. Please try again.");
      setIsSaving(false); // Only set false on error
    }
    // No finally block here as success navigates away
  };

  const handleCancel = () => {
    navigate('/admin/products'); // Navigate back to product list
  };

  // Render logic
  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !productData) { // Show fetch error only if we don't have data to display
     return (
       <Container sx={{ mt: 5 }}>
         <Alert severity="error">{error}</Alert>
       </Container>
     );
  }
  
  if (!productData) {
     // This case handles productId missing or document not found after loading
     return (
       <Container sx={{ mt: 5 }}>
         <Alert severity="warning">Product data could not be loaded or found.</Alert>
       </Container>
     );
  }


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Product: {productData.name}
      </Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} {/* Show saving errors */}
        <ProductForm 
          initialData={productData} // Pass fetched data to the form
          onSubmit={handleUpdateProduct} 
          isSaving={isSaving} 
          submitButtonText="Save Changes"
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};

export default EditProductPage;

