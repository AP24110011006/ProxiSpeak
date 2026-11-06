import express from 'express';
import {
  getRoomStatus,
  claimHostRole,
  muteAllInRoom,
  kickParticipant,
  togglePrivacyLock,
} from '../controllers/moderationController.js';

const router = express.Router();

router.get('/:roomId/status', getRoomStatus);
router.post('/:roomId/claim', claimHostRole);
router.post('/:roomId/mute-all', muteAllInRoom);
router.post('/:roomId/kick', kickParticipant);
router.post('/:roomId/lock', togglePrivacyLock);

export default router;
