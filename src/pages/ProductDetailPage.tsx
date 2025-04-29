import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { getDocument } from '../services/firebase'; // Assuming getDocument helper exists
import { ProductData } from '../services/firebase'; // Assuming ProductData type exists
import Button from '@mui/material/Button'; // Import Button
import Box from '@mui/material/Box'; // For layout
const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setProduct(null); // Reset product state on new fetch

      try {
        const fetchedProduct = await getDocument<ProductData>('products', productId);
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError(`Product with ID "${productId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to fetch product details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

  }, [productId]); // Re-run effect if productId changes

  if (isLoading) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    // This case should theoretically be covered by the error state, but added for robustness
    return <div>Product data could not be loaded.</div>;
  }

  // Define configuration paths based on category
  const configPaths: { [key: string]: string } = {
    garage: '/products/garage/configure',
    gazebo: '/products/gazebo/configure',
    porch: '/products/porch/configure',
    beam: '/products/beam/configure',
    flooring: '/products/flooring/configure',
  };

  const configPath = product.category ? configPaths[product.category] : undefined;

  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* Placeholder for Product Images */}
      <section>
        <h2>Images</h2>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} style={{ maxWidth: '400px', height: 'auto' }} />
          // TODO: Add image gallery/carousel if multiple images
        ) : (
          <p>No images available.</p>
        )}
      </section>

      {/* Placeholder for Product Description */}
      <section>
        <h2>Description</h2>
        <p>{product.description || 'No description available.'}</p> 
      </section>
      
      <section>
        <h2>Purchase Options</h2>
        <Box sx={{ mt: 2 }}> {/* Add some margin top */}
          {configPath ? (
            <Button
              component={Link}
              // Pass productId as state or query param if needed by config page
              to={`${configPath}?productId=${product.id}`} 
              variant="contained"
              color="primary"
              sx={{ mr: 2 }} // Add some margin right if adding other buttons later
            >
              Configure This Product
            </Button>
          ) : (
            <p>Standard product options or 'Add to Cart' will go here.</p> 
            // TODO: Implement Add to Cart for non-configurable products
          )}
          {/* TODO: Add standard 'Add to Cart' button if needed */}
        </Box>
      </section>

    </div>
  );
};

export default ProductDetailPage;

