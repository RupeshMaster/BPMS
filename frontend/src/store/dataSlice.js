import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async Thunks to synchronize with MERN backend
export const fetchInitialData = createAsyncThunk(
  'data/fetchInitialData',
  async (_, { rejectWithValue }) => {
    try {
      const [stocksRes, nozzlesRes, salesRes, workersRes, attendanceRes, expensesRes, generatorRes, shiftsRes] = await Promise.all([
        api.get('/fuel/stock'),
        api.get('/nozzles'),
        api.get('/fuel/sales'),
        api.get('/workers'),
        api.get('/workers/attendance'),
        api.get('/fuel/expenses'),
        api.get('/fuel/generator'),
        api.get('/fuel/shifts')
      ]);

      // Mappings: Adapt MongoDB array schemas to dashboard state formats
      const stocksObj = {
        petrol: { current: 0, capacity: 12400 },
        diesel: { current: 0, capacity: 19700 }
      };
      stocksRes.data.forEach(s => {
        stocksObj[s.fuelType.toLowerCase()] = { current: s.current, capacity: s.capacity };
      });

      const nozzlesObj = {};
      nozzlesRes.data.forEach(n => {
        nozzlesObj[n.id] = {
          id: n.id,
          fuel: n.fuel,
          status: n.status,
          assignedWorker: n.assignedWorker,
          assignedWorkerId: n.assignedWorkerId,
          reading: n.reading
        };
      });

      const usersObj = {};
      workersRes.data.forEach(u => {
        usersObj[u.id] = u;
      });

      return {
        users: usersObj,
        stocks: stocksObj,
        nozzles: nozzlesObj,
        sales: salesRes.data,
        attendance: attendanceRes.data,
        expenses: expensesRes.data,
        generator: generatorRes.data,
        shifts: shiftsRes.data
      };
    } catch (err) {
      console.warn('MERN endpoints failed, returning localStorage fallback state', err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addSaleThunk = createAsyncThunk(
  'data/addSaleThunk',
  async (saleData, { rejectWithValue }) => {
    try {
      const res = await api.post('/fuel/sales', saleData);
      return res.data.sale;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const refillStockThunk = createAsyncThunk(
  'data/refillStockThunk',
  async ({ fuelType, liters, cost }, { rejectWithValue }) => {
    try {
      // 1. Refill stock level
      const refillRes = await api.post('/fuel/refill', { fuelType, liters });
      
      // 2. Log refill expense
      const expenseRes = await api.post('/fuel/expenses', {
        category: 'Fuel Stock',
        amount: liters * cost,
        description: `Purchased ${liters}L of ${fuelType} stock refill`,
        date: new Date().toISOString().split('T')[0]
      });

      return {
        fuelType: fuelType.toLowerCase(),
        stock: refillRes.data.stock,
        expense: expenseRes.data
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const allocateNozzleThunk = createAsyncThunk(
  'data/allocateNozzleThunk',
  async ({ nozzleId, workerId, workerName }, { rejectWithValue }) => {
    try {
      const res = await api.post('/nozzles/allocate', { nozzleId, workerId });
      return { nozzleId, workerId, workerName };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleNozzleThunk = createAsyncThunk(
  'data/toggleNozzleThunk',
  async (nozzleId, { rejectWithValue }) => {
    try {
      const res = await api.post('/nozzles/toggle', { nozzleId });
      return res.data.nozzle;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addWorkerThunk = createAsyncThunk(
  'data/addWorkerThunk',
  async (workerData, { rejectWithValue }) => {
    try {
      const res = await api.post('/workers', workerData);
      return res.data.worker;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleWorkerThunk = createAsyncThunk(
  'data/toggleWorkerThunk',
  async (workerId, { rejectWithValue }) => {
    try {
      const res = await api.post('/workers/toggle', { workerId });
      return res.data.worker;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleCheckInThunk = createAsyncThunk(
  'data/toggleCheckInThunk',
  async ({ workerId, workerName, isCheckedIn }, { rejectWithValue }) => {
    try {
      let res;
      if (isCheckedIn) {
        // Perform check-out
        res = await api.post('/workers/checkout', { workerId });
      } else {
        // Perform check-in
        res = await api.post('/workers/checkin', { workerId, workerName });
      }
      return res.data.log;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addExpenseThunk = createAsyncThunk(
  'data/addExpenseThunk',
  async (expenseData, { rejectWithValue }) => {
    try {
      const res = await api.post('/fuel/expenses', expenseData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateGeneratorThunk = createAsyncThunk(
  'data/updateGeneratorThunk',
  async (generatorData, { rejectWithValue }) => {
    try {
      const res = await api.put('/fuel/generator', generatorData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateShiftsThunk = createAsyncThunk(
  'data/updateShiftsThunk',
  async (shiftList, { rejectWithValue }) => {
    try {
      const res = await api.put('/fuel/shifts', shiftList);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const resetDatabaseThunk = createAsyncThunk(
  'data/resetDatabaseThunk',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/fuel/reset');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Initial state fallback helper in case API is disconnected
const getLocalInitialState = () => {
  return {
    users: {},
    stocks: { petrol: { current: 8450, capacity: 12400 }, diesel: { current: 12230, capacity: 19700 } },
    nozzles: {
      'A': { id: 'A', fuel: 'Petrol', status: 'Active', assignedWorker: 'Ramesh Kumar', assignedWorkerId: 'worker', reading: 124000 },
      'B': { id: 'B', fuel: 'Petrol', status: 'Active', assignedWorker: 'None', assignedWorkerId: '', reading: 85300 },
      'C': { id: 'C', fuel: 'Diesel', status: 'Active', assignedWorker: 'None', assignedWorkerId: '', reading: 45000 },
      'D': { id: 'D', fuel: 'Diesel', status: 'Active', assignedWorker: 'None', assignedWorkerId: '', reading: 62000 }
    },
    sales: [],
    attendance: [],
    expenses: [],
    generator: { status: 'OFF', hours: 240.5, dieselLiters: 180 },
    shifts: [
      { id: 1, name: 'Morning Shift', time: '6:00 AM - 12:00 PM', workersCount: 15, onboardCount: 8, status: 'Active' },
      { id: 2, name: 'Afternoon Shift', time: '12:00 PM - 6:00 PM', workersCount: 12, onboardCount: 0, status: 'Inactive' },
      { id: 3, name: 'Night Shift', time: '6:00 PM - 6:00 AM', workersCount: 8, onboardCount: 0, status: 'Inactive' }
    ]
  };
};

const dataSlice = createSlice({
  name: 'data',
  initialState: getLocalInitialState(),
  reducers: {
    // Local reducers as fallbacks if needed
    updateStocks(state, action) {
      state.stocks = action.payload;
    },
    updateNozzles(state, action) {
      state.nozzles = action.payload;
    },
    addSale(state, action) {
      state.sales.unshift(action.payload);
    },
    setAttendance(state, action) {
      state.attendance = action.payload;
    },
    addExpense(state, action) {
      state.expenses.unshift(action.payload);
    },
    updateGenerator(state, action) {
      state.generator = { ...state.generator, ...action.payload };
    },
    updateShifts(state, action) {
      state.shifts = action.payload;
    },
    resetDatabase(state) {
      const fresh = getLocalInitialState();
      state.users = fresh.users;
      state.stocks = fresh.stocks;
      state.nozzles = fresh.nozzles;
      state.sales = fresh.sales;
      state.attendance = fresh.attendance;
      state.expenses = fresh.expenses;
      state.generator = fresh.generator;
      state.shifts = fresh.shifts;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch mapping
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.stocks = action.payload.stocks;
        state.nozzles = action.payload.nozzles;
        state.sales = action.payload.sales;
        state.attendance = action.payload.attendance;
        state.expenses = action.payload.expenses;
        state.generator = action.payload.generator;
        state.shifts = action.payload.shifts;
      })
      // Sales logging
      .addCase(addSaleThunk.fulfilled, (state, action) => {
        state.sales.unshift(action.payload);
        // Adjust client stocks locally
        const fuelKey = action.payload.fuel.toLowerCase();
        if (state.stocks[fuelKey]) {
          state.stocks[fuelKey].current = Math.max(0, parseFloat((state.stocks[fuelKey].current - action.payload.liters).toFixed(2)));
        }
        // Adjust nozzle meter reading locally
        const nzId = action.payload.nozzle;
        if (state.nozzles[nzId]) {
          state.nozzles[nzId].reading += action.payload.liters;
        }
      })
      // Refills
      .addCase(refillStockThunk.fulfilled, (state, action) => {
        const { fuelType, stock, expense } = action.payload;
        if (state.stocks[fuelType]) {
          state.stocks[fuelType].current = stock.current;
        }
        state.expenses.unshift(expense);
      })
      // Nozzle allocation
      .addCase(allocateNozzleThunk.fulfilled, (state, action) => {
        const { nozzleId, workerId, workerName } = action.payload;
        if (state.nozzles[nozzleId]) {
          state.nozzles[nozzleId].assignedWorker = workerName;
          state.nozzles[nozzleId].assignedWorkerId = workerId;
        }
        // Update user's nozzle status
        if (state.users[workerId]) {
          state.users[workerId].nozzle = nozzleId;
        }
      })
      // Toggle nozzle status
      .addCase(toggleNozzleThunk.fulfilled, (state, action) => {
        const n = action.payload;
        state.nozzles[n.id] = n;
      })
      // Add worker
      .addCase(addWorkerThunk.fulfilled, (state, action) => {
        const u = action.payload;
        state.users[u.id] = u;
      })
      // Toggle worker status
      .addCase(toggleWorkerThunk.fulfilled, (state, action) => {
        const u = action.payload;
        state.users[u.id] = u;
      })
      // Attendance check-in/out
      .addCase(toggleCheckInThunk.fulfilled, (state, action) => {
        const attLog = action.payload;
        const idx = state.attendance.findIndex(a => a.workerId === attLog.workerId && a.date === attLog.date);
        if (idx !== -1) {
          state.attendance[idx] = attLog;
        } else {
          state.attendance.push(attLog);
        }
      })
      // Log expense
      .addCase(addExpenseThunk.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      // Update generator console parameters
      .addCase(updateGeneratorThunk.fulfilled, (state, action) => {
        state.generator = action.payload;
      })
      // Update shift settings
      .addCase(updateShiftsThunk.fulfilled, (state, action) => {
        state.shifts = action.payload;
      })
      // Reset database Thunk
      .addCase(resetDatabaseThunk.fulfilled, (state) => {
        const fresh = getLocalInitialState();
        state.users = fresh.users;
        state.stocks = fresh.stocks;
        state.nozzles = fresh.nozzles;
        state.sales = fresh.sales;
        state.attendance = fresh.attendance;
        state.expenses = fresh.expenses;
        state.generator = fresh.generator;
        state.shifts = fresh.shifts;
      });
  }
});

export const {
  updateStocks,
  updateNozzles,
  addSale,
  setAttendance,
  addExpense,
  updateGenerator,
  updateShifts,
  resetDatabase
} = dataSlice.actions;

export default dataSlice.reducer;
