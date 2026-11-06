import express from 'express';
import {
  getZoneMessages,
  getNearbyMessages,
  getChatStats,
} from '../controllers/spatialChatController.js';

const router = express.Router();

router.get('/stats', getChatStats);
router.get('/nearby', getNearbyMessages);
router.get('/zone/:zone', getZoneMessages);

export default router;
