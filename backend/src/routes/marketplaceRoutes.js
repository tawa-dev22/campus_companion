import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';
import { marketplaceSchema, validate } from '../validators/contentValidator.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(marketplaceController.getMarketplaceItems)
  .post(
    upload.fields([{ name: 'marketplaceImages', maxCount: 5 }]),
    validate(marketplaceSchema),
    marketplaceController.createMarketplaceItem
  );

router.route('/:id')
  .get(marketplaceController.getMarketplaceItem)
  .patch(
    authorize('manage_marketplace'),
    upload.fields([{ name: 'marketplaceImages', maxCount: 5 }]),
    validate(marketplaceSchema),
    marketplaceController.updateMarketplaceItem
  )
  .delete(
    authorize('manage_marketplace'),
    marketplaceController.deleteMarketplaceItem
  );

export default router;
