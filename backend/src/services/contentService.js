import logger from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export const createItem = async (Model, data, user, req = null) => {
  try {
    const item = await Model.create({ ...data, user: user._id });
    logger.debug(`Created ${Model.modelName} item: ${item._id}`);
    return item;
  } catch (error) {
    logger.error(`Error creating ${Model.modelName}: ${error.message}`);
    throw error;
  }
};

export const getItems = async (Model, query = {}, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
  const skip = (page - 1) * limit;

  try {
    const items = await Model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);

    const total = await Model.countDocuments(query);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error fetching ${Model.modelName}s: ${error.message}`);
    throw error;
  }
};

export const getItemById = async (Model, id, populate = '') => {
  try {
    const item = await Model.findById(id).populate(populate);
    if (!item) throw new AppError(`${Model.modelName} not found`, 404);
    return item;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error fetching ${Model.modelName} by ID: ${error.message}`);
    throw error;
  }
};

export const updateItem = async (Model, id, data, user) => {
  try {
    const item = await Model.findById(id);
    if (!item) throw new AppError(`${Model.modelName} not found`, 404);

    // Authorization: Only owner or admin can update
    // Note: System Admin bypasses this in middleware or controller check
    if (item.user.toString() !== user._id.toString() && user.role.name !== 'System Administrator' && user.role.name !== 'Admin') {
      throw new AppError('You do not have permission to update this item', 403);
    }

    const updatedItem = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    
    logger.debug(`Updated ${Model.modelName} item: ${id}`);
    return updatedItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error updating ${Model.modelName}: ${error.message}`);
    throw error;
  }
};

export const deleteItem = async (Model, id, user) => {
  try {
    const item = await Model.findById(id);
    if (!item) throw new AppError(`${Model.modelName} not found`, 404);

    // Authorization
    if (item.user.toString() !== user._id.toString() && user.role.name !== 'System Administrator' && user.role.name !== 'Admin') {
      throw new AppError('You do not have permission to delete this item', 403);
    }

    await Model.findByIdAndDelete(id);
    logger.debug(`Deleted ${Model.modelName} item: ${id}`);
    return { message: 'Deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error deleting ${Model.modelName}: ${error.message}`);
    throw error;
  }
};
