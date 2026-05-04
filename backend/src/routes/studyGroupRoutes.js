import { Router } from 'express';
import * as studyGroupController from '../controllers/studyGroupController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { studyGroupSchema, validate } from '../validators/contentValidator.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(studyGroupController.getStudyGroups)
  .post(
    validate(studyGroupSchema),
    studyGroupController.createStudyGroup
  );
  
router.post('/:id/join', studyGroupController.joinStudyGroup);

router.route('/:id')
  .get(studyGroupController.getStudyGroup)
  .patch(
    validate(studyGroupSchema),
    studyGroupController.updateStudyGroup
  )
  .delete(
    studyGroupController.deleteStudyGroup
  );

export default router;
