import Program from '../models/Program.js';
import { logAudit } from '../utils/auditLogger.js';

export const getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find().sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      data: programs
    });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ status: 'fail', message: 'Program name is required' });
    }

    const existing = await Program.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Program with this name already exists' });
    }

    const program = await Program.create({ name: name.trim(), code: (code || '').trim() });
    await logAudit('PROGRAM_CREATED', 'programs', req.user._id, { programId: program._id, name: program.name }, req);

    res.status(201).json({
      status: 'success',
      data: program
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({ status: 'fail', message: 'Program not found' });
    }

    await Program.findByIdAndDelete(id);
    await logAudit('PROGRAM_DELETED', 'programs', req.user._id, { programId: id, name: program.name }, req);

    res.status(200).json({
      status: 'success',
      message: 'Program deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
