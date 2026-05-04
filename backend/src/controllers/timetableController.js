import Timetable from '../models/Timetable.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';

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
    const result = await contentService.getItems(Timetable, {}, { page, limit, sort, populate: 'user' });
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
