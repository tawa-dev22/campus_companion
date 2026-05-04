import { Router } from 'express';
import * as timetableController from '../controllers/timetableController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { timetableSchema, validate } from '../validators/contentValidator.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(timetableController.getTimetables)
  .post(
    authorize('manage_timetable'),
    validate(timetableSchema),
    timetableController.createTimetable
  );

router.route('/:id')
  .get(timetableController.getTimetable)
  .patch(
    authorize('manage_timetable'),
    validate(timetableSchema),
    timetableController.updateTimetable
  )
  .delete(
    authorize('manage_timetable'),
    timetableController.deleteTimetable
  );

export default router;
