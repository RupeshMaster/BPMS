import { DbWrapper } from '../models/dbWrapper.js';

export const getStocks = async (req, res) => {
  try {
    const stocks = await DbWrapper.getStocks();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving stocks.', error: err.message });
  }
};

export const updateStock = async (req, res) => {
  const { fuelType, current, capacity } = req.body;
  try {
    const stock = await DbWrapper.updateStock(fuelType, { current, capacity });
    if (!stock) return res.status(404).json({ message: 'Fuel type not found.' });
    res.json({ message: 'Stock updated successfully!', stock });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock.', error: err.message });
  }
};

export const addRefill = async (req, res) => {
  const { fuelType, liters } = req.body;
  try {
    const stocks = await DbWrapper.getStocks();
    const fuel = stocks.find(s => s.fuelType.toLowerCase() === fuelType.toLowerCase());
    if (!fuel) return res.status(404).json({ message: 'Fuel type not found.' });

    const newCurrent = Math.min(fuel.current + Number(liters), fuel.capacity);
    const updated = await DbWrapper.updateStock(fuelType, { current: newCurrent });

    res.json({ message: `Refilled ${liters}L of ${fuelType} successfully!`, stock: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error registering refill.', error: err.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const sales = await DbWrapper.getSales();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving sales history.', error: err.message });
  }
};

export const createSale = async (req, res) => {
  const { workerId, workerName, nozzle, fuel, liters, amount, payment, cash, digital } = req.body;
  try {
    // 1. Verify and deduct fuel stock
    const stocks = await DbWrapper.getStocks();
    const targetFuel = stocks.find(s => s.fuelType.toLowerCase() === fuel.toLowerCase());
    if (!targetFuel) {
      return res.status(404).json({ message: `Fuel type ${fuel} not found.` });
    }

    if (targetFuel.current < Number(liters)) {
      return res.status(400).json({ message: `Insufficient fuel in stock. Current: ${targetFuel.current} L` });
    }

    // 2. Perform stock deduction
    await DbWrapper.updateStock(fuel, { current: targetFuel.current - Number(liters) });

    // 3. Increment nozzle reading
    const nozzles = await DbWrapper.getNozzles();
    const nz = nozzles.find(n => n.id === nozzle);
    if (nz) {
      const newReading = nz.reading + Number(liters);
      await DbWrapper.updateNozzle(nz.id, { reading: newReading });
    }

    // 4. Create sale entry
    const newSale = await DbWrapper.createSale({
      workerId,
      workerName,
      nozzle,
      fuel,
      liters: Number(liters),
      amount: Number(amount),
      payment,
      cash: Number(cash || 0),
      digital: Number(digital || 0)
    });

    res.status(201).json({ message: 'Sale registered successfully!', sale: newSale });
  } catch (err) {
    res.status(500).json({ message: 'Error creating sales entry.', error: err.message });
  }
};

// EXPENSES CONTROLLERS
export const getExpenses = async (req, res) => {
  try {
    const expenses = await DbWrapper.getExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving expenses.', error: err.message });
  }
};

export const createExpense = async (req, res) => {
  const { category, amount, description, date } = req.body;
  try {
    const expense = await DbWrapper.createExpense({ category, amount: Number(amount), description, date });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Error creating expense.', error: err.message });
  }
};

export const setExpenses = async (req, res) => {
  try {
    const expenses = await DbWrapper.setExpenses(req.body);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error setting expenses.', error: err.message });
  }
};

// GENERATOR CONTROLLERS
export const getGenerator = async (req, res) => {
  try {
    const generator = await DbWrapper.getGenerator();
    res.json(generator);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving generator status.', error: err.message });
  }
};

export const updateGenerator = async (req, res) => {
  try {
    const generator = await DbWrapper.updateGenerator(req.body);
    res.json(generator);
  } catch (err) {
    res.status(500).json({ message: 'Error updating generator status.', error: err.message });
  }
};

// SHIFTS CONTROLLERS
export const getShifts = async (req, res) => {
  try {
    const shifts = await DbWrapper.getShifts();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving shifts.', error: err.message });
  }
};

export const updateShifts = async (req, res) => {
  try {
    const shifts = await DbWrapper.updateShifts(req.body);
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Error updating shifts.', error: err.message });
  }
};

// RESET DATABASE
export const resetDatabase = async (req, res) => {
  try {
    const result = await DbWrapper.resetDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error resetting database.', error: err.message });
  }
};
