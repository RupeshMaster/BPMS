import express from 'express';
import { getNozzles, createNozzle, updateNozzle, calibrateNozzle, deleteNozzle } from '../controllers/nozzleController.js';

const router = express.Router();

router.get('/', getNozzles);
router.post('/', createNozzle);
router.put('/:id', updateNozzle);
router.post('/:id/calibrate', calibrateNozzle);
router.delete('/:id', deleteNozzle);

export default router;
