import { Router } from 'express';
import {
  getOffices,
  getOfficeBySlug,
  createOffice,
  benchmarkProximity,
  queryNearbyUsers,
} from '../controllers/officeController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getOffices);
router.get('/benchmark', benchmarkProximity);
router.get('/nearby', queryNearbyUsers);
router.get('/:slug', getOfficeBySlug);
router.post('/', authenticate, createOffice);

export default router;
