import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = Router();

// Protect all routes
router.use(authenticate);

router.get('/me', profileController.getProfile);
router.get('/:id', profileController.getPublicProfile);
router.put('/update', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);
router.put('/avatar', upload.single('profilePicture'), profileController.updateAvatar);

export default router;
