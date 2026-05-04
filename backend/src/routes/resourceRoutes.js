import { Router } from 'express';
import { protect } from '../middleware/auth.js';

export function createResourceRouter(controller) {
  const router = Router();
  router.use(protect);
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').get(controller.getOne).put(controller.update).delete(controller.remove);
  return router;
}
