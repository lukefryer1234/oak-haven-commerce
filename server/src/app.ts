import express, { Request, Response } from 'express';
import cors from 'cors';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mock products data
const products: Record<string, Product> = {
  '1': {
    id: '1',
    name: 'Classic Garage Door',
    description: 'A sturdy and reliable garage door suitable for any home.',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1',
    category: 'garage',
    rating: 4.5,
    reviews: 128
  },
  '2': {
    id: '2',
    name: 'Modern Sectional Door',
    description: 'Contemporary sectional door with excellent insulation.',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b3',
    category: 'garage',
    rating: 4.8,
    reviews: 89
  }
};

// Mock products endpoint
app.get('/api/products', (_: Request, res: Response) => {
  res.json(Object.values(products));
});

// Single product endpoint
app.get('/api/products/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  
  if (!(id in products)) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(products[id]);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 