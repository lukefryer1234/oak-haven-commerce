import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  createProductConfig,
  getProductConfigs,
  calculatePrice,
  updateProductConfig,
  deleteProductConfig
} from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Product Category Routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', authenticateToken, requireAdmin, createCategory);

// Product Configuration Routes
router.get('/configs', getProductConfigs);
router.post('/configs', authenticateToken, requireAdmin, createProductConfig);
router.post('/calculate-price', calculatePrice);
router.put('/configs/:id', authenticateToken, requireAdmin, updateProductConfig);
router.delete('/configs/:id', authenticateToken, requireAdmin, deleteProductConfig);

// Mock products data
const products = [
  {
    id: '1',
    name: 'Classic Garage Door',
    description: 'A sturdy and reliable garage door suitable for any home.',
    price: 599.99,
    images: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1',
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b2'
    ],
    category: 'garage'
  },
  {
    id: '2',
    name: 'Modern Sectional Door',
    description: 'Contemporary sectional door with excellent insulation.',
    price: 899.99,
    images: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b3',
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b4'
    ],
    category: 'garage'
  }
];

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

export default router; 