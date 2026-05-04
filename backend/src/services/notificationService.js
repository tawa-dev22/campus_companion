import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

class NotificationService {
  /**
   * Send a notification to a specific user
   */
  async sendToUser(io, userId, notificationData) {
    try {
      const { title, message, type, link } = notificationData;

      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        link,
      });

      if (io) {
        io.to(userId).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      logger.error(`Error sending notification to user ${userId}:`, error.message);
    }
  }

  /**
   * Broadcast notification to all users of a specific role
   */
  async broadcastToRole(io, roleName, notificationData, users) {
    try {
      const { title, message, type, link } = notificationData;

      // Filter users by role name (this assumes users have populated role)
      const targetUsers = users.filter(u => u.role?.name === roleName);

      const notifications = await Promise.all(
        targetUsers.map(u => 
          Notification.create({
            user: u._id,
            title,
            message,
            type,
            link,
          })
        )
      );

      if (io) {
        targetUsers.forEach((u, i) => {
          io.to(u._id.toString()).emit('notification', notifications[i]);
        });
      }

      return notifications;
    } catch (error) {
      logger.error(`Error broadcasting notification to role ${roleName}:`, error.message);
    }
  }

  /**
   * Broadcast to everyone
   */
  async broadcastAll(io, notificationData) {
    // This could be expensive, usually handled by client-side subscription to a global room
    if (io) {
      io.emit('notification_global', notificationData);
    }
  }
}

export default new NotificationService();
