import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';
import { getStudentFilters } from '../utils/filterHelper.js';

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
    const query = {};
    if (req.user.role?.name === 'Student') {
      const studentFilters = getStudentFilters(req.user);
      query.level = studentFilters.level;
      query.program = studentFilters.program;
    } else if (req.user.role?.name === 'Admin') {
      // Admins only see assignments they posted
      query.user = req.user._id;
    }
    // System Administrator sees all — no filter applied
    const result = await contentService.getItems(Assignment, query, { page, limit, sort, populate: 'user' });

    // Attach student submission status or submission details
    if (req.user.role?.name === 'Student') {
      const submissions = await Submission.find({ student: req.user._id });
      const submissionMap = Object.fromEntries(submissions.map(s => [s.assignment.toString(), s]));
      
      const modifiedItems = result.items.map(item => {
        const itemObj = item.toObject();
        const submission = submissionMap[item._id.toString()];
        if (submission) {
          itemObj.status = 'submitted';
          itemObj.submission = submission;
        } else {
          itemObj.status = 'pending';
        }
        return itemObj;
      });
      result.items = modifiedItems;
    } else {
      // Admins see assignments. Let's count submissions for each assignment
      const submissionsCounts = await Submission.aggregate([
        { $group: { _id: '$assignment', count: { $sum: 1 } } }
      ]);
      const countsMap = Object.fromEntries(submissionsCounts.map(c => [c._id.toString(), c.count]));
      const modifiedItems = result.items.map(item => {
        const itemObj = item.toObject();
        itemObj.submissionCount = countsMap[item._id.toString()] || 0;
        return itemObj;
      });
      result.items = modifiedItems;
    }

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

export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student already submitted
    let submission = await Submission.findOne({ assignment: id, student: studentId });

    if (submission) {
      submission.document = req.file.path;
      submission.fileMetadata = {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: id,
        student: studentId,
        document: req.file.path,
        fileMetadata: {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    }

    await logAudit('ASSIGNMENT_SUBMITTED', 'assignments', req.user._id, { assignmentId: id, submissionId: submission._id }, req);

    res.status(200).json({
      status: 'success',
      message: 'Assignment submitted successfully',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsForAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ assignment: id })
      .populate('student', 'fullName email studentId program level')
      .populate('assignment', 'title module');

    res.status(200).json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'fullName email studentId program level')
      .populate('assignment', 'title module program level');

    res.status(200).json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade || '';
    submission.feedback = feedback || '';
    submission.status = 'graded';
    await submission.save();

    await logAudit('ASSIGNMENT_GRADED', 'assignments', req.user._id, { submissionId }, req);

    res.status(200).json({
      status: 'success',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};
