import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import MarketplaceItem from '../models/MarketplaceItem.js';
import notificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, productId, message } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      throw new AppError('You cannot send a message to yourself', 400);
    }

    const product = await MarketplaceItem.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      product: productId,
      message,
    });

    // Send notification to receiver
    const io = req.app.get('io');
    await notificationService.sendToUser(io, receiverId, {
      title: 'New Message',
      message: `${req.user.fullName} is interested in your product: ${product.title}`,
      type: 'marketplace',
      link: `/marketplace/chat/${productId}/${senderId}`,
    });

    res.status(201).json({
      status: 'success',
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { productId, otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort('createdAt');

    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all unique conversations (product + other user)
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'fullName')
      .populate('receiver', 'fullName')
      .populate('product', 'title images')
      .sort('-createdAt');

    // Group by conversation
    const conversations = [];
    const seen = new Set();

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const key = `${msg.product._id}-${otherUser._id}`;

      if (!seen.has(key)) {
        seen.add(key);
        conversations.push({
          product: msg.product,
          otherUser,
          lastMessage: msg.message,
          updatedAt: msg.createdAt,
        });
      }
    });

    res.status(200).json({
      status: 'success',
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};
