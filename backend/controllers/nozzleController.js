import { DbWrapper } from '../models/dbWrapper.js';

export const getNozzles = async (req, res) => {
  try {
    const nozzles = await DbWrapper.getNozzles();
    res.json(nozzles);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving nozzles.', error: err.message });
  }
};

export const createNozzle = async (req, res) => {
  const { id, fuel, status, reading, lastMaintenance } = req.body;
  try {
    const nozzles = await DbWrapper.getNozzles();
    if (nozzles.find(n => n.id === id)) {
      return res.status(400).json({ message: `Nozzle with ID ${id} already exists.` });
    }

    const newNozzle = {
      id,
      fuel,
      status: status || 'Active',
      assignedWorker: 'None',
      assignedWorkerId: '',
      reading: Number(reading || 0),
      openingReading: Number(reading || 0),
      accuracyRate: 100.0,
      lastMaintenance: lastMaintenance || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const created = await DbWrapper.createNozzle(newNozzle);
    res.status(201).json({ message: 'Nozzle added successfully!', nozzle: created });
  } catch (err) {
    res.status(500).json({ message: 'Error adding nozzle.', error: err.message });
  }
};

export const updateNozzle = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const nozzle = await DbWrapper.updateNozzle(id, updateData);
    if (!nozzle) return res.status(404).json({ message: 'Nozzle not found.' });

    // If assigning a worker, sync user details as well
    if (updateData.assignedWorkerId) {
      await DbWrapper.updateUser(updateData.assignedWorkerId, { nozzle: id });
    }

    res.json({ message: 'Nozzle updated successfully!', nozzle });
  } catch (err) {
    res.status(500).json({ message: 'Error updating nozzle.', error: err.message });
  }
};

export const calibrateNozzle = async (req, res) => {
  const { id } = req.params;
  try {
    const nozzles = await DbWrapper.getNozzles();
    const nz = nozzles.find(n => n.id === id);
    if (!nz) return res.status(404).json({ message: 'Nozzle not found.' });

    // Calibrate: set openingReading to reading (reset shift counters) and randomize/set accuracy
    const calibration = {
      openingReading: nz.reading,
      accuracyRate: Number((98.0 + Math.random() * 2).toFixed(1)) // Random accuracy rate between 98.0% and 100.0%
    };

    const updated = await DbWrapper.updateNozzle(id, calibration);
    res.json({ message: `Nozzle ${id} calibrated successfully!`, nozzle: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error calibrating nozzle.', error: err.message });
  }
};

export const deleteNozzle = async (req, res) => {
  const { id } = req.params;
  try {
    const nozzle = await DbWrapper.deleteNozzle(id);
    if (!nozzle) return res.status(404).json({ message: 'Nozzle not found.' });
    res.json({ message: 'Nozzle deleted successfully!', nozzle });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting nozzle.', error: err.message });
  }
};

export const toggleNozzle = async (req, res) => {
  const { nozzleId } = req.body;
  try {
    const nozzles = await DbWrapper.getNozzles();
    const nz = nozzles.find(n => n.id === nozzleId);
    if (!nz) return res.status(404).json({ message: 'Nozzle not found.' });

    const newStatus = nz.status === 'Active' ? 'Offline' : 'Active';
    const updated = await DbWrapper.updateNozzle(nozzleId, { status: newStatus });
    res.json({ message: 'Nozzle status toggled!', nozzle: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling nozzle.', error: err.message });
  }
};

export const allocateNozzle = async (req, res) => {
  const { nozzleId, workerId } = req.body;
  try {
    const users = await DbWrapper.getUsers();
    const worker = users.find(u => u.id === workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });

    // Clear old nozzle from this worker if any
    const nozzles = await DbWrapper.getNozzles();
    const oldNz = nozzles.find(n => n.assignedWorkerId === workerId);
    if (oldNz) {
      await DbWrapper.updateNozzle(oldNz.id, { assignedWorker: 'None', assignedWorkerId: '' });
    }

    // Allocate new nozzle
    const updated = await DbWrapper.updateNozzle(nozzleId, { assignedWorker: worker.name, assignedWorkerId: workerId });
    // Also update worker's nozzle
    await DbWrapper.updateUser(workerId, { nozzle: nozzleId });

    res.json({ message: 'Nozzle allocated successfully!', nozzle: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error allocating nozzle.', error: err.message });
  }
};
