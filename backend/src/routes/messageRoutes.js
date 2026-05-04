import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getMyConversations);
router.get('/:productId/:otherUserId', messageController.getMessages);

export default router;
