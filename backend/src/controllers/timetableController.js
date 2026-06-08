import Timetable from '../models/Timetable.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';
import { getStudentFilters } from '../utils/filterHelper.js';

export const createTimetable = async (req, res, next) => {
  try {
    const timetable = await contentService.createItem(Timetable, req.body, req.user);
    await logAudit('TIMETABLE_CREATED', 'timetable', req.user._id, { timetableId: timetable._id }, req);
    res.status(201).json({ status: 'success', data: { timetable } });
  } catch (error) {
    next(error);
  }
};

export const getTimetables = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const query = {};
    if (req.user.role?.name === 'Student') {
      const studentFilters = getStudentFilters(req.user);
      query.level = studentFilters.level;
      query.program = studentFilters.program;
    } else if (req.user.role?.name === 'Admin') {
      // Admins only see timetables they posted
      query.user = req.user._id;
    }
    // System Administrator sees all — no filter applied
    const result = await contentService.getItems(Timetable, query, { page, limit, sort, populate: 'user' });
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getTimetable = async (req, res, next) => {
  try {
    const timetable = await contentService.getItemById(Timetable, req.params.id, 'user');
    res.status(200).json({ status: 'success', data: { timetable } });
  } catch (error) {
    next(error);
  }
};

export const updateTimetable = async (req, res, next) => {
  try {
    const timetable = await contentService.updateItem(Timetable, req.params.id, req.body, req.user);
    await logAudit('TIMETABLE_UPDATED', 'timetable', req.user._id, { timetableId: timetable._id }, req);
    res.status(200).json({ status: 'success', data: { timetable } });
  } catch (error) {
    next(error);
  }
};

export const deleteTimetable = async (req, res, next) => {
  try {
    await contentService.deleteItem(Timetable, req.params.id, req.user);
    await logAudit('TIMETABLE_DELETED', 'timetable', req.user._id, { timetableId: req.params.id }, req);
    res.status(200).json({ status: 'success', message: 'Timetable entry deleted' });
  } catch (error) {
    next(error);
  }
};
