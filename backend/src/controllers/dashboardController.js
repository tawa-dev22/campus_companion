import User from '../models/User.js';
import Role from '../models/Role.js';
import Assignment from '../models/Assignment.js';
import { getStudentFilters } from '../utils/filterHelper.js';
import Event from '../models/Event.js';
import MarketplaceItem from '../models/MarketplaceItem.js';
import StudyGroup from '../models/StudyGroup.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import Timetable from '../models/Timetable.js';
import Submission from '../models/Submission.js';

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
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      newUsers,
      roleStats,
      totalEvents,
      newEvents,
      totalAssignments,
      newAssignments,
      totalMarketplace,
      newMarketplace,
      recentLogs,
      notifications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      User.aggregate([
        { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'roleData' } },
        { $unwind: '$roleData' },
        { $group: { _id: '$roleData.name', count: { $sum: 1 } } }
      ]),
      Event.countDocuments(),
      Event.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Assignment.countDocuments(),
      Assignment.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      MarketplaceItem.countDocuments(),
      MarketplaceItem.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'fullName'),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    const userTrend = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;
    const eventTrend = totalEvents > 0 ? Math.round((newEvents / totalEvents) * 100) : 0;
    const assignmentTrend = totalAssignments > 0 ? Math.round((newAssignments / totalAssignments) * 100) : 0;
    const marketplaceTrend = totalMarketplace > 0 ? Math.round((newMarketplace / totalMarketplace) * 100) : 0;

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          userTrend,
          roleStats: Object.fromEntries(roleStats.map(r => [r._id, r.count])),
          totalEvents,
          eventTrend,
          totalAssignments,
          assignmentTrend,
          totalMarketplace,
          marketplaceTrend,
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
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      myTimetables,
      newTimetables,
      myAssignments,
      newAssignments,
      totalStudents,
      newStudents,
      recentActivity,
      notifications
    ] = await Promise.all([
      Timetable.countDocuments({ user: userId }),
      Timetable.countDocuments({ user: userId, createdAt: { $gte: oneWeekAgo } }),
      Assignment.countDocuments({ user: userId }),
      Assignment.countDocuments({ user: userId, createdAt: { $gte: oneWeekAgo } }),
      (async () => {
        const studentRole = await Role.findOne({ name: 'Student' });
        return studentRole ? User.countDocuments({ role: studentRole._id }) : 0;
      })(),
      (async () => {
        const studentRole = await Role.findOne({ name: 'Student' });
        return studentRole ? User.countDocuments({ role: studentRole._id, createdAt: { $gte: oneWeekAgo } }) : 0;
      })(),
      AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    const timetableTrend = myTimetables > 0 ? Math.round((newTimetables / myTimetables) * 100) : 0;
    const assignmentTrend = myAssignments > 0 ? Math.round((newAssignments / myAssignments) * 100) : 0;
    const studentTrend = totalStudents > 0 ? Math.round((newStudents / totalStudents) * 100) : 0;

    res.json({
      status: 'success',
      data: {
        stats: {
          myEvents: myTimetables, // mapping events key to timetable counts for frontend compatibility
          timetableTrend,
          myAssignments,
          assignmentTrend,
          totalStudents,
          studentTrend,
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
    const studentFilters = getStudentFilters(req.user);
    
    // Fetch assignments for student's program and level
    const studentAssignments = await Assignment.find({ program: studentFilters.program, level: studentFilters.level });
    const assignmentIds = studentAssignments.map(a => a._id);
    
    // Find submissions by this student for these assignments
    const studentSubmissions = await Submission.find({ 
      student: userId, 
      assignment: { $in: assignmentIds } 
    });
    const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignment.toString()));
    
    const pendingAssignmentsCount = studentAssignments.filter(a => !submittedAssignmentIds.has(a._id.toString())).length;
    
    // Get upcoming assignments, sort by dueDate
    const upcomingAssignments = studentAssignments
      .filter(a => !submittedAssignmentIds.has(a._id.toString()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const [
      upcomingEvents,
      myMarketplace,
      myGroups,
      notifications,
      discoverableMarketplace,
      discoverableGroups
    ] = await Promise.all([
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
          pendingAssignments: pendingAssignmentsCount,
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
