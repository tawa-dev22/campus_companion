import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';
import { eventSchema, validate } from '../validators/contentValidator.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(eventController.getEvents)
  .post(
    authorize('manage_events'),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 }
    ]),
    validate(eventSchema),
    eventController.createEvent
  );

router.route('/:id')
  .get(eventController.getEvent)
  .patch(
    authorize('manage_events'),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 }
    ]),
    validate(eventSchema),
    eventController.updateEvent
  )
  .delete(
    authorize('manage_events'),
    eventController.deleteEvent
  );

export default router;
