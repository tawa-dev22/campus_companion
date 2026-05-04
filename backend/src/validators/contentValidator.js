import Joi from 'joi';

export const timetableSchema = Joi.object({
  courseTitle: Joi.string().required(),
  lecturer: Joi.string().allow('', null),
  venue: Joi.string().allow('', null),
  day: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

export const assignmentSchema = Joi.object({
  title: Joi.string().required(),
  module: Joi.string().required(),
  dueDate: Joi.date().required(),
  status: Joi.string().valid('pending', 'in-progress', 'submitted').default('pending'),
  notes: Joi.string().allow('', null),
});

export const eventSchema = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().default('general'),
  date: Joi.date().required(),
  venue: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
});

export const marketplaceSchema = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().default('general'),
  price: Joi.number().required().min(0),
  contact: Joi.string().required(),
  description: Joi.string().allow('', null),
  condition: Joi.string().default('good'),
  location: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'sold', 'pending', 'removed').default('active'),
  visibility: Joi.string().valid('public', 'private').default('public'),
});

export const studyGroupSchema = Joi.object({
  name: Joi.string().required(),
  course: Joi.string().required(),
  meetingDay: Joi.string().allow('', null),
  meetingTime: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  visibility: Joi.string().valid('public', 'private', 'discoverable').default('public'),
  members: Joi.array().items(Joi.string()).optional(),
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true, allowUnknown: true });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }
  req.body = value;
  next();
};
