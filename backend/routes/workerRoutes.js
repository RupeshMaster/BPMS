import express from 'express';
import { getWorkers, createWorker, updateWorker, deleteWorker, getAttendance, checkIn, checkOut } from '../controllers/workerController.js';

const router = express.Router();

router.get('/', getWorkers);
router.post('/', createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);
router.get('/attendance', getAttendance);
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

export default router;
