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

export default router; 