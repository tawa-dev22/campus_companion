import { Router } from 'express';
import { 
  getAllUsers, 
  getAllRoles, 
  updateUser, 
  deleteUser 
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Middleware to restrict access only to System Administrators
const requireSystemAdmin = (req, res, next) => {
  if (req.user?.role?.name !== 'System Administrator') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only System Administrators can perform this action.',
    });
  }
  next();
};

// All admin routes require authentication and System Administrator role
router.use(authenticate, requireSystemAdmin);

router.get('/users', getAllUsers);
router.get('/roles', getAllRoles);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
