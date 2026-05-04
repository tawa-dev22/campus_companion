import StudyGroup from '../models/StudyGroup.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';

export const createStudyGroup = async (req, res, next) => {
  try {
    const studyGroup = await contentService.createItem(StudyGroup, req.body, req.user);
    await logAudit('STUDY_GROUP_CREATED', 'study_groups', req.user._id, { studyGroupId: studyGroup._id }, req);
    res.status(201).json({ status: 'success', data: { studyGroup } });
  } catch (error) {
    next(error);
  }
};

export const joinStudyGroup = async (req, res, next) => {
  try {
    const studyGroup = await StudyGroup.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } },
      { new: true }
    );
    if (!studyGroup) {
      return res.status(404).json({ status: 'fail', message: 'Study group not found' });
    }
    await logAudit('STUDY_GROUP_JOINED', 'study_groups', req.user._id, { studyGroupId: studyGroup._id }, req);
    res.status(200).json({ status: 'success', data: { studyGroup } });
  } catch (error) {
    next(error);
  }
};

export const getStudyGroups = async (req, res, next) => {
  try {
    const { page, limit, sort, course } = req.query;
    const query = course ? { course: new RegExp(course, 'i') } : {};
    const result = await contentService.getItems(StudyGroup, query, { page, limit, sort, populate: 'user' });
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getStudyGroup = async (req, res, next) => {
  try {
    const studyGroup = await contentService.getItemById(StudyGroup, req.params.id, 'user');
    res.status(200).json({ status: 'success', data: { studyGroup } });
  } catch (error) {
    next(error);
  }
};

export const updateStudyGroup = async (req, res, next) => {
  try {
    const studyGroup = await contentService.updateItem(StudyGroup, req.params.id, req.body, req.user);
    await logAudit('STUDY_GROUP_UPDATED', 'study_groups', req.user._id, { studyGroupId: studyGroup._id }, req);
    res.status(200).json({ status: 'success', data: { studyGroup } });
  } catch (error) {
    next(error);
  }
};

export const deleteStudyGroup = async (req, res, next) => {
  try {
    await contentService.deleteItem(StudyGroup, req.params.id, req.user);
    await logAudit('STUDY_GROUP_DELETED', 'study_groups', req.user._id, { studyGroupId: req.params.id }, req);
    res.status(200).json({ status: 'success', message: 'Study group deleted' });
  } catch (error) {
    next(error);
  }
};
