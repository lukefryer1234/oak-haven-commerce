import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, productsCollection, ProductData } from '../services/firebase'; // Assuming firebase config is in src/services/firebase.ts
import ProductCard from '../components/products/ProductCard'; // Import ProductCard
import Grid from '@mui/material/Grid'; // Import Grid
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(productsCollection);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductData[]; // Cast needed as data() returns DocumentData
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <Grid container spacing={2}> {/* Use Grid container */}
        {products.length > 0 ? (
          products.map(product => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}> {/* Grid item with breakpoints */}
              <ProductCard product={product} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}> {/* Span full width if no products */}
            <p>No products found.</p>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ProductsPage;

