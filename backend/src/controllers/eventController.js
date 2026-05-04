import Event from '../models/Event.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';

export const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.image) eventData.image = req.files.image[0].path;
      if (req.files.video) eventData.video = req.files.video[0].path;
    }

    const event = await contentService.createItem(Event, eventData, req.user);
    await logAudit('EVENT_CREATED', 'events', req.user._id, { eventId: event._id }, req);
    
    // Broadcast notification to all users
    const io = req.app.get('io');
    await notificationService.broadcastAll(io, {
      title: 'New Campus Event!',
      message: `${event.title} has been scheduled at ${event.venue}.`,
      type: 'event',
      link: '/events'
    });

    res.status(201).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    // Admins see all events, students see all events too (public)
    const result = await contentService.getItems(Event, {}, { page, limit, sort, populate: 'user' });
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await contentService.getItemById(Event, req.params.id, 'user');
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };
    if (req.files) {
      if (req.files.image) eventData.image = req.files.image[0].path;
      if (req.files.video) eventData.video = req.files.video[0].path;
    }
    const event = await contentService.updateItem(Event, req.params.id, eventData, req.user);
    await logAudit('EVENT_UPDATED', 'events', req.user._id, { eventId: event._id }, req);
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await contentService.deleteItem(Event, req.params.id, req.user);
    await logAudit('EVENT_DELETED', 'events', req.user._id, { eventId: req.params.id }, req);
    res.status(200).json({ status: 'success', message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
