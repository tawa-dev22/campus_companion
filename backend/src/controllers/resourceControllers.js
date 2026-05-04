import Assignment from '../models/Assignment.js';
import Event from '../models/Event.js';
import MarketplaceItem from '../models/MarketplaceItem.js';
import StudyGroup from '../models/StudyGroup.js';
import Timetable from '../models/Timetable.js';
import { createCrudController } from '../utils/createCrudController.js';

export const timetableController = createCrudController(Timetable, 'day startTime');
export const assignmentController = createCrudController(Assignment, 'dueDate');
export const eventController = createCrudController(Event, 'date');
export const studyGroupController = createCrudController(StudyGroup);
export const marketplaceController = createCrudController(MarketplaceItem);
