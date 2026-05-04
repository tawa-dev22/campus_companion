import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';
import { assignmentSchema, validate } from '../validators/contentValidator.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(assignmentController.getAssignments)
  .post(
    authorize('manage_assignments'),
    upload.single('document'),
    validate(assignmentSchema),
    assignmentController.createAssignment
  );

router.route('/:id')
  .get(assignmentController.getAssignment)
  .patch(
    authorize('manage_assignments'),
    upload.single('document'),
    validate(assignmentSchema),
    assignmentController.updateAssignment
  )
  .delete(
    authorize('manage_assignments'),
    assignmentController.deleteAssignment
  );

export default router;
