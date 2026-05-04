import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/**
 * Log a system action to the audit log
 * @param {string} action - The action performed (e.g., 'LOGIN_SUCCESS', 'ROLE_UPDATE')
 * @param {string} module - The module where the action occurred
 * @param {string} userId - The user ID who performed the action
 * @param {object} details - Any additional details about the action
 * @param {object} req - Express request object to extract IP and User Agent
 */
export const logAudit = async (action, module, userId, details = {}, req = null) => {
  try {
    const auditData = {
      action,
      module,
      userId,
      details,
    };

    if (req) {
      auditData.ipAddress = req.ip;
      auditData.userAgent = req.headers['user-agent'];
    }

    await AuditLog.create(auditData);
    logger.debug(`Audit Log: ${action} by ${userId} in ${module}`);
  } catch (error) {
    logger.error(`Failed to create audit log: ${error.message}`);
  }
};
