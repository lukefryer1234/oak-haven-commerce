import { Router } from 'express';
import { body } from 'express-validator';
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

// Validation middleware
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

const registerValidation = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
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

router.post('/logout', (req, res) => {
  // TODO: Implement logout logic
  res.json({ message: 'Logout endpoint' });
});

export default router; 