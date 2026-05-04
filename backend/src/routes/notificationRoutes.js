import { Router } from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});

export default router;
