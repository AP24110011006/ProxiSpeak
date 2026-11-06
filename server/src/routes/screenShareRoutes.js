import express from 'express';
import {
  startPresentation,
  stopPresentation,
  addViewerToSession,
  adaptSessionBitrate,
  getActiveInRoom,
  getAllActive,
} from '../controllers/screenShareController.js';

const router = express.Router();

router.get('/active', getAllActive);
router.get('/room/:roomId', getActiveInRoom);
router.post('/start', startPresentation);
router.post('/:sessionId/stop', stopPresentation);
router.post('/:sessionId/viewer', addViewerToSession);
router.post('/:sessionId/adapt', adaptSessionBitrate);

export default router;
