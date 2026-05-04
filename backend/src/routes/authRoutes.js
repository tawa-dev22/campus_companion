import { Router } from 'express';
import { 
  login, 
  me, 
  register, 
  verifyRegistration, 
  refresh, 
  forgotPassword, 
  resetPassword, 
  logout 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/verify', verifyRegistration);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
