import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, productsCollection, ProductData } from '../services/firebase'; // Assuming firebase config is in src/services/firebase.ts
import ProductCard from '../components/products/ProductCard'; // Import ProductCard
import Grid from '@mui/material/Grid'; // Import Grid
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const ProductCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>(); // Get category from URL params
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if category is defined
    if (!category) {
      setError("Category not specified.");
      setIsLoading(false);
      return;
    }

    const fetchProductsByCategory = async () => {
      setIsLoading(true);
      setError(null);
      setProducts([]); // Clear previous products

      try {
        // Create a query against the 'products' collection
        const q = query(productsCollection, where('category', '==', category));
        
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductData[]; // Cast needed as data() returns DocumentData

        setProducts(productsData);
      } catch (err) {
        console.error(`Error fetching products for category ${category}:`, err);
        setError(`Failed to fetch products for category "${category}". Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsByCategory();

  }, [category]); // Re-run effect if category changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Capitalize category for display
  const displayCategory = category ? capitalizeFirstLetter(category) : 'Unknown Category';

  return (
    <div>
      <h1>Products in {displayCategory}</h1>
      <Grid container spacing={2}> {/* Use Grid container */}
        {products.length > 0 ? (
          products.map(product => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}> {/* Grid item with breakpoints */}
              <ProductCard product={product} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}> {/* Span full width if no products */}
             <p>No products found in this category.</p>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ProductCategoryPage;

