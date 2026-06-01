import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from './User.js';
import Stock from './Stock.js';
import Nozzle from './Nozzle.js';
import Sale from './Sale.js';
import Attendance from './Attendance.js';
import Expense from './Expense.js';
import Shift from './Shift.js';
import Generator from './Generator.js';

const MOCK_DB_PATH = path.resolve('mock_db.json');

// Default initial state
const defaultDb = {
  users: {
    superadmin: { id: 'superadmin', password: 'superadmin', role: 'super-admin', name: 'Alok Sharma', phone: '9988776655' },
    admin: { id: 'admin', password: 'admin', role: 'admin', name: 'Vikram Singh', phone: '9876543210' },
    worker: { id: 'worker', password: 'worker', role: 'worker', name: 'Ramesh Kumar', phone: '9123456789', nozzle: 'A', dob: '1992-08-24', address: 'Quarter No. 45, BPCL Colony, Mathura' }
  },
  stocks: [
    { fuelType: 'Petrol', current: 8450, capacity: 12400 },
    { fuelType: 'Diesel', current: 12230, capacity: 19700 }
  ],
  nozzles: {
    'A': { id: 'A', fuel: 'Petrol', status: 'Active', assignedWorker: 'Ramesh Kumar', assignedWorkerId: 'worker', reading: 124000, openingReading: 124000, accuracyRate: 98.6, lastMaintenance: '15 Feb 2026' },
    'B': { id: 'B', fuel: 'Diesel', status: 'Active', assignedWorker: 'None', assignedWorkerId: '', reading: 85300, openingReading: 85300, accuracyRate: 98.6, lastMaintenance: '10 Feb 2026' }
  },
  sales: [
    { workerId: 'worker', workerName: 'Ramesh Kumar', nozzle: 'A', fuel: 'Petrol', liters: 2400, amount: 249600, payment: 'Mix', cash: 12500, digital: 8300, date: new Date().toISOString() }
  ],
  attendance: [
    { workerId: 'worker', workerName: 'Ramesh Kumar', date: new Date().toISOString().split('T')[0], checkIn: '06:05 AM', checkOut: '', status: 'Active' }
  ],
  expenses: [
    { id: 1, category: 'Generator Fuel', amount: 15000, description: 'Refueled 150L diesel for backup generator', date: '2026-05-26' },
    { id: 2, category: 'Cleaning Services', amount: 2500, description: 'Station driveway pressure wash', date: '2026-05-25' }
  ],
  generator: {
    status: 'OFF',
    hours: 240.5,
    dieselLiters: 180
  },
  shifts: [
    { id: 1, name: 'Morning Shift', time: '6:00 AM - 12:00 PM', workersCount: 15, onboardCount: 8, status: 'Active' },
    { id: 2, name: 'Afternoon Shift', time: '12:00 PM - 6:00 PM', workersCount: 12, onboardCount: 0, status: 'Inactive' },
    { id: 3, name: 'Night Shift', time: '6:00 PM - 6:00 AM', workersCount: 8, onboardCount: 0, status: 'Inactive' }
  ]
};

// Ensure JSON db is initialized
const initJsonDb = () => {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
  }
};

const getJsonDb = () => {
  initJsonDb();
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
  } catch (e) {
    return defaultDb;
  }
};

const saveJsonDb = (data) => {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const DbWrapper = {
  // SEED MONGO DATABASE IF EMPTY
  async seedMongo() {
    if (!isMongoConnected()) return;
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Seed] Seeding MongoDB with initial data...');
        // Insert Users
        for (const uid in defaultDb.users) {
          await User.create(defaultDb.users[uid]);
        }
        // Insert Stocks
        for (const st of defaultDb.stocks) {
          await Stock.create(st);
        }
        // Insert Nozzles
        for (const nz in defaultDb.nozzles) {
          await Nozzle.create(defaultDb.nozzles[nz]);
        }
        // Insert Sales
        for (const sl of defaultDb.sales) {
          await Sale.create(sl);
        }
        // Insert Attendance
        for (const att of defaultDb.attendance) {
          await Attendance.create(att);
        }
        // Insert Expenses
        for (const exp of defaultDb.expenses) {
          await Expense.create(exp);
        }
        // Insert Shifts
        for (const sh of defaultDb.shifts) {
          await Shift.create(sh);
        }
        // Insert Generator
        await Generator.create(defaultDb.generator);
        console.log('[Seed] MongoDB seeded successfully!');
      }
    } catch (e) {
      console.error('[Seed] Seeding MongoDB failed:', e.message);
    }
  },

  // USERS REST OPERATIONS
  async getUsers() {
    if (isMongoConnected()) {
      return await User.find({});
    } else {
      const db = getJsonDb();
      return Object.values(db.users);
    }
  },

  async getUserById(id) {
    if (isMongoConnected()) {
      return await User.findOne({ id });
    } else {
      const db = getJsonDb();
      return db.users[id] || null;
    }
  },

  async createUser(userData) {
    if (isMongoConnected()) {
      return await User.create(userData);
    } else {
      const db = getJsonDb();
      db.users[userData.id] = userData;
      saveJsonDb(db);
      return userData;
    }
  },

  async updateUser(id, updateData) {
    if (isMongoConnected()) {
      return await User.findOneAndUpdate({ id }, updateData, { new: true });
    } else {
      const db = getJsonDb();
      if (db.users[id]) {
        db.users[id] = { ...db.users[id], ...updateData };
        saveJsonDb(db);
        return db.users[id];
      }
      return null;
    }
  },

  async deleteUser(id) {
    if (isMongoConnected()) {
      return await User.findOneAndDelete({ id });
    } else {
      const db = getJsonDb();
      if (db.users[id]) {
        const deleted = db.users[id];
        delete db.users[id];
        saveJsonDb(db);
        return deleted;
      }
      return null;
    }
  },

  // STOCKS REST OPERATIONS
  async getStocks() {
    if (isMongoConnected()) {
      return await Stock.find({});
    } else {
      const db = getJsonDb();
      return db.stocks;
    }
  },

  async updateStock(fuelType, updateData) {
    if (isMongoConnected()) {
      return await Stock.findOneAndUpdate({ fuelType }, updateData, { new: true });
    } else {
      const db = getJsonDb();
      const index = db.stocks.findIndex(s => s.fuelType.toLowerCase() === fuelType.toLowerCase());
      if (index !== -1) {
        db.stocks[index] = { ...db.stocks[index], ...updateData };
        saveJsonDb(db);
        return db.stocks[index];
      }
      return null;
    }
  },

  // NOZZLES REST OPERATIONS
  async getNozzles() {
    if (isMongoConnected()) {
      return await Nozzle.find({});
    } else {
      const db = getJsonDb();
      return Object.values(db.nozzles);
    }
  },

  async createNozzle(nozzleData) {
    if (isMongoConnected()) {
      return await Nozzle.create(nozzleData);
    } else {
      const db = getJsonDb();
      db.nozzles[nozzleData.id] = nozzleData;
      saveJsonDb(db);
      return nozzleData;
    }
  },

  async updateNozzle(id, updateData) {
    if (isMongoConnected()) {
      return await Nozzle.findOneAndUpdate({ id }, updateData, { new: true });
    } else {
      const db = getJsonDb();
      if (db.nozzles[id]) {
        db.nozzles[id] = { ...db.nozzles[id], ...updateData };
        saveJsonDb(db);
        return db.nozzles[id];
      }
      return null;
    }
  },

  async deleteNozzle(id) {
    if (isMongoConnected()) {
      return await Nozzle.findOneAndDelete({ id });
    } else {
      const db = getJsonDb();
      if (db.nozzles[id]) {
        const deleted = db.nozzles[id];
        delete db.nozzles[id];
        saveJsonDb(db);
        return deleted;
      }
      return null;
    }
  },

  // SALES REST OPERATIONS
  async getSales() {
    if (isMongoConnected()) {
      return await Sale.find({}).sort({ date: -1 });
    } else {
      const db = getJsonDb();
      return db.sales.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createSale(saleData) {
    if (isMongoConnected()) {
      return await Sale.create(saleData);
    } else {
      const db = getJsonDb();
      const newSale = { ...saleData, date: new Date().toISOString() };
      db.sales.push(newSale);
      saveJsonDb(db);
      return newSale;
    }
  },

  // ATTENDANCE REST OPERATIONS
  async getAttendance() {
    if (isMongoConnected()) {
      return await Attendance.find({});
    } else {
      const db = getJsonDb();
      return db.attendance;
    }
  },

  async logAttendance(attendanceData) {
    if (isMongoConnected()) {
      return await Attendance.findOneAndUpdate(
        { workerId: attendanceData.workerId, date: attendanceData.date },
        attendanceData,
        { upsert: true, new: true }
      );
    } else {
      const db = getJsonDb();
      const idx = db.attendance.findIndex(a => a.workerId === attendanceData.workerId && a.date === attendanceData.date);
      if (idx !== -1) {
        db.attendance[idx] = { ...db.attendance[idx], ...attendanceData };
      } else {
        db.attendance.push(attendanceData);
      }
      saveJsonDb(db);
      return attendanceData;
    }
  },

  // EXPENSES REST OPERATIONS
  async getExpenses() {
    if (isMongoConnected()) {
      return await Expense.find({}).sort({ date: -1 });
    } else {
      const db = getJsonDb();
      return db.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createExpense(expenseData) {
    if (isMongoConnected()) {
      return await Expense.create(expenseData);
    } else {
      const db = getJsonDb();
      const newExpense = { ...expenseData, id: expenseData.id || Date.now() };
      db.expenses.push(newExpense);
      saveJsonDb(db);
      return newExpense;
    }
  },

  async setExpenses(expenseList) {
    if (isMongoConnected()) {
      await Expense.deleteMany({});
      return await Expense.insertMany(expenseList);
    } else {
      const db = getJsonDb();
      db.expenses = expenseList;
      saveJsonDb(db);
      return expenseList;
    }
  },

  // GENERATOR REST OPERATIONS
  async getGenerator() {
    if (isMongoConnected()) {
      let gen = await Generator.findOne({});
      if (!gen) {
        gen = await Generator.create(defaultDb.generator);
      }
      return gen;
    } else {
      const db = getJsonDb();
      return db.generator || defaultDb.generator;
    }
  },

  async updateGenerator(generatorData) {
    if (isMongoConnected()) {
      return await Generator.findOneAndUpdate({}, generatorData, { new: true, upsert: true });
    } else {
      const db = getJsonDb();
      db.generator = { ...(db.generator || defaultDb.generator), ...generatorData };
      saveJsonDb(db);
      return db.generator;
    }
  },

  // SHIFTS REST OPERATIONS
  async getShifts() {
    if (isMongoConnected()) {
      return await Shift.find({});
    } else {
      const db = getJsonDb();
      return db.shifts;
    }
  },

  async updateShifts(shiftList) {
    if (isMongoConnected()) {
      await Shift.deleteMany({});
      return await Shift.insertMany(shiftList);
    } else {
      const db = getJsonDb();
      db.shifts = shiftList;
      saveJsonDb(db);
      return shiftList;
    }
  },

  // RESET DATABASE STATE
  async resetDatabase() {
    if (isMongoConnected()) {
      await Promise.all([
        User.deleteMany({}),
        Stock.deleteMany({}),
        Nozzle.deleteMany({}),
        Sale.deleteMany({}),
        Attendance.deleteMany({}),
        Expense.deleteMany({}),
        Shift.deleteMany({}),
        Generator.deleteMany({})
      ]);
      // Re-seed default DB
      for (const uid in defaultDb.users) {
        await User.create(defaultDb.users[uid]);
      }
      for (const st of defaultDb.stocks) {
        await Stock.create(st);
      }
      for (const nz in defaultDb.nozzles) {
        await Nozzle.create(defaultDb.nozzles[nz]);
      }
      for (const sl of defaultDb.sales) {
        await Sale.create(sl);
      }
      for (const att of defaultDb.attendance) {
        await Attendance.create(att);
      }
      for (const exp of defaultDb.expenses) {
        await Expense.create(exp);
      }
      for (const sh of defaultDb.shifts) {
        await Shift.create(sh);
      }
      await Generator.create(defaultDb.generator);
      return { message: 'Database reset successfully!' };
    } else {
      saveJsonDb(defaultDb);
      return { message: 'Local JSON fallback reset successfully!' };
    }
  }
};
