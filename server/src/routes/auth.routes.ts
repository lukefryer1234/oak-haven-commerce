import { Router } from 'express';
import { 
  register, 
  login, 
  googleAuth, 
  appleAuth, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route example
router.get('/me', authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role
  });
});

export default router; 