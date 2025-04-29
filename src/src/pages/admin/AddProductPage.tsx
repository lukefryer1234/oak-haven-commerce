import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Alert } from '@mui/material';
import ProductForm from '../../components/admin/ProductForm'; // Adjust path if needed
import { createDocument, ProductData } from '../../services/firebase'; // Adjust path if needed

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = async (productData: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    setError(null);
    try {
      // createDocument should handle adding timestamps
      await createDocument('products', productData);
      navigate('/admin/products'); // Navigate back to product list on success
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Failed to add product. Please check the data and try again.");
      setIsSaving(false); // Only set false on error, success navigates away
    } 
    // No finally block needed as success navigates away
  };

  const handleCancel = () => {
    navigate('/admin/products'); // Navigate back to product list
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Product
      </Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <ProductForm 
          onSubmit={handleAddProduct} 
          isSaving={isSaving} 
          submitButtonText="Add Product"
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};

export default AddProductPage;

