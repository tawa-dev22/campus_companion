import Assignment from '../models/Assignment.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';

export const createAssignment = async (req, res, next) => {
  try {
    const assignmentData = { ...req.body };
    if (req.file) {
      assignmentData.document = req.file.path;
      assignmentData.fileMetadata = {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    const assignment = await contentService.createItem(Assignment, assignmentData, req.user);
    await logAudit('ASSIGNMENT_CREATED', 'assignments', req.user._id, { assignmentId: assignment._id }, req);
    
    // Broadcast notification to students
    const io = req.app.get('io');
    const students = await User.find().populate('role');
    await notificationService.broadcastToRole(io, 'Student', {
      title: 'New Assignment Posted',
      message: `${assignment.title} is now available for completion.`,
      type: 'assignment',
      link: '/assignments'
    }, students);

    res.status(201).json({ status: 'success', data: { assignment } });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    // Admins see all, Students see all academic assignments
    const result = await contentService.getItems(Assignment, {}, { page, limit, sort, populate: 'user' });
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await contentService.getItemById(Assignment, req.params.id, 'user');
    res.status(200).json({ status: 'success', data: { assignment } });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignmentData = { ...req.body };
    if (req.file) {
      assignmentData.document = req.file.path;
      assignmentData.fileMetadata = {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    const assignment = await contentService.updateItem(Assignment, req.params.id, assignmentData, req.user);
    await logAudit('ASSIGNMENT_UPDATED', 'assignments', req.user._id, { assignmentId: assignment._id }, req);
    res.status(200).json({ status: 'success', data: { assignment } });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    await contentService.deleteItem(Assignment, req.params.id, req.user);
    await logAudit('ASSIGNMENT_DELETED', 'assignments', req.user._id, { assignmentId: req.params.id }, req);
    res.status(200).json({ status: 'success', message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};
