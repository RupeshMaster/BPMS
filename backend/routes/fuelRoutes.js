import express from 'express';
import { 
  getStocks, 
  updateStock, 
  addRefill, 
  getSales, 
  createSale,
  getExpenses,
  createExpense,
  setExpenses,
  getGenerator,
  updateGenerator,
  getShifts,
  updateShifts,
  resetDatabase
} from '../controllers/fuelController.js';

const router = express.Router();

router.get('/stock', getStocks);
router.put('/stock', updateStock);
router.post('/refill', addRefill);
router.get('/sales', getSales);
router.post('/sales', createSale);

router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses', setExpenses);

router.get('/generator', getGenerator);
router.put('/generator', updateGenerator);

router.get('/shifts', getShifts);
router.put('/shifts', updateShifts);

router.post('/reset', resetDatabase);

export default router;
