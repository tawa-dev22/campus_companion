import User from '../models/User.js';
import Role from '../models/Role.js';
import Assignment from '../models/Assignment.js';
import Event from '../models/Event.js';
import MarketplaceItem from '../models/MarketplaceItem.js';
import StudyGroup from '../models/StudyGroup.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

export async function getDashboard(req, res, next) {
  try {
    const { user } = req;
    const roleName = user.role?.name;

    if (roleName === 'System Administrator') {
      return getSystemAdminDashboard(req, res, next);
    } else if (roleName === 'Admin') {
      return getAdminDashboard(req, res, next);
    } else {
      return getStudentDashboard(req, res, next);
    }
  } catch (error) {
    next(error);
  }
}

async function getSystemAdminDashboard(req, res, next) {
  try {
    const [
      totalUsers,
      roleStats,
      totalEvents,
      totalAssignments,
      totalMarketplace,
      recentLogs,
      notifications
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'roleData' } },
        { $unwind: '$roleData' },
        { $group: { _id: '$roleData.name', count: { $sum: 1 } } }
      ]),
      Event.countDocuments(),
      Assignment.countDocuments(),
      MarketplaceItem.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'fullName'),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          roleStats: Object.fromEntries(roleStats.map(r => [r._id, r.count])),
          totalEvents,
          totalAssignments,
          totalMarketplace,
        },
        recentLogs,
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const [
      myEvents,
      myAssignments,
      totalStudents,
      recentActivity,
      notifications
    ] = await Promise.all([
      Event.countDocuments({ createdBy: userId }), // Assuming createdBy exists
      Assignment.countDocuments({ createdBy: userId }),
      (async () => {
        const studentRole = await Role.findOne({ name: 'Student' });
        return studentRole ? User.countDocuments({ role: studentRole._id }) : 0;
      })(),
      AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          myEvents,
          myAssignments,
          totalStudents,
        },
        recentActivity,
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getStudentDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const [
      pendingAssignments,
      upcomingAssignments,
      upcomingEvents,
      myMarketplace,
      myGroups,
      notifications,
      discoverableMarketplace,
      discoverableGroups
    ] = await Promise.all([
      Assignment.countDocuments({ status: { $ne: 'submitted' } }), 
      Assignment.find({ status: { $ne: 'submitted' } }).sort({ dueDate: 1 }).limit(5),
      Event.find().sort({ date: 1 }).limit(5),
      MarketplaceItem.countDocuments({ user: userId }),
      StudyGroup.countDocuments({ members: userId }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      MarketplaceItem.find({ status: 'active' }).sort({ createdAt: -1 }).limit(6).populate('user', 'fullName'),
      StudyGroup.find({ visibility: { $ne: 'private' } }).sort({ createdAt: -1 }).limit(6).populate('user', 'fullName')
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          pendingAssignments,
          upcomingEventsCount: upcomingEvents.length,
          myMarketplace,
          myGroups,
        },
        upcomingAssignments,
        upcomingEvents,
        notifications,
        discoverableMarketplace,
        discoverableGroups
      }
    });
  } catch (error) {
    next(error);
  }
}
