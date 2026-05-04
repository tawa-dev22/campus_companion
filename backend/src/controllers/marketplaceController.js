import MarketplaceItem from '../models/MarketplaceItem.js';
import * as contentService from '../services/contentService.js';
import { logAudit } from '../utils/auditLogger.js';

export const createMarketplaceItem = async (req, res, next) => {
  try {
    const itemData = { ...req.body };
    if (req.files && req.files.marketplaceImages) {
      itemData.images = req.files.marketplaceImages.map(file => file.path);
      itemData.filesMetadata = req.files.marketplaceImages.map(file => ({
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));
    }
    const item = await contentService.createItem(MarketplaceItem, itemData, req.user);
    await logAudit('MARKETPLACE_ITEM_CREATED', 'marketplace', req.user._id, { itemId: item._id }, req);
    res.status(201).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const getMarketplaceItems = async (req, res, next) => {
  try {
    const { page, limit, sort, category } = req.query;
    const query = category ? { category } : {};
    const result = await contentService.getItems(MarketplaceItem, query, { page, limit, sort, populate: 'user' });
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getMarketplaceItem = async (req, res, next) => {
  try {
    const item = await contentService.getItemById(MarketplaceItem, req.params.id, 'user');
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const updateMarketplaceItem = async (req, res, next) => {
  try {
    const itemData = { ...req.body };
    if (req.files && req.files.marketplaceImages) {
      itemData.images = req.files.marketplaceImages.map(file => file.path);
      itemData.filesMetadata = req.files.marketplaceImages.map(file => ({
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));
    }
    const item = await contentService.updateItem(MarketplaceItem, req.params.id, itemData, req.user);
    await logAudit('MARKETPLACE_ITEM_UPDATED', 'marketplace', req.user._id, { itemId: item._id }, req);
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const deleteMarketplaceItem = async (req, res, next) => {
  try {
    await contentService.deleteItem(MarketplaceItem, req.params.id, req.user);
    await logAudit('MARKETPLACE_ITEM_DELETED', 'marketplace', req.user._id, { itemId: req.params.id }, req);
    res.status(200).json({ status: 'success', message: 'Marketplace item deleted' });
  } catch (error) {
    next(error);
  }
};
