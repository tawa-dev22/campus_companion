import bcrypt from 'bcryptjs';
import logger from './logger.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

const permissions = [
  // User Management
  { name: 'manage_users', description: 'Can create, update, and deactivate users', category: 'user_management' },
  { name: 'manage_roles', description: 'Can manage roles and permissions', category: 'user_management' },
  { name: 'view_audit_logs', description: 'Can view system audit logs', category: 'user_management' },
  
  // Content Management
  { name: 'manage_timetable', description: 'Can manage course timetables', category: 'content_management' },
  { name: 'manage_assignments', description: 'Can manage academic assignments', category: 'content_management' },
  { name: 'manage_events', description: 'Can manage campus events', category: 'content_management' },
  
  // Marketplace
  { name: 'manage_marketplace', description: 'Can manage marketplace listings', category: 'marketplace' },
  
  // General
  { name: 'view_content', description: 'Can view academic and campus content', category: 'general' },
];

export async function seedRBAC() {
  try {

    // 1. Seed Permissions
    const seededPermissions = [];
    for (const p of permissions) {
      const permission = await Permission.findOneAndUpdate(
        { name: p.name },
        p,
        { upsert: true, new: true }
      );
      seededPermissions.push(permission);
    }

    // Helper to get permission IDs by names
    const getPermIds = (names) => 
      seededPermissions.filter(p => names.includes(p.name)).map(p => p._id);

    // 2. Seed Roles
    const roles = [
      {
        name: 'System Administrator',
        description: 'Highest privilege with full system access',
        isStatic: true,
        permissions: seededPermissions.map(p => p._id),
      },
      {
        name: 'Admin',
        description: 'Campus content manager',
        isStatic: true,
        permissions: getPermIds(['manage_timetable', 'manage_assignments', 'manage_events', 'view_content', 'view_audit_logs', 'manage_marketplace']),
      },
      {
        name: 'Student',
        description: 'Default student role',
        isStatic: true,
        permissions: getPermIds(['manage_marketplace', 'view_content']),
      },
    ];

    const seededRoles = {};
    for (const r of roles) {
      const role = await Role.findOneAndUpdate(
        { name: r.name },
        r,
        { upsert: true, new: true }
      );
      seededRoles[r.name] = role;
    }

    const roleMap = Object.fromEntries(
      Object.entries(seededRoles).map(([name, role]) => [name.toLowerCase(), role._id])
    );

    const legacyUsers = await User.collection
      .find({ role: { $type: 'string' } }, { projection: { email: 1, role: 1 } })
      .toArray();
    let migratedUsers = 0;

    for (const legacyUser of legacyUsers) {
      const normalizedRole = String(legacyUser.role).trim().toLowerCase();
      const mappedRoleId = roleMap[normalizedRole];

      if (!mappedRoleId) {
        logger.warn(`Unable to migrate legacy role "${legacyUser.role}" for user ${legacyUser.email}.`);
        continue;
      }

      await User.collection.updateOne(
        { _id: legacyUser._id },
        { $set: { role: mappedRoleId } }
      );
      migratedUsers += 1;
    }

    if (migratedUsers > 0) {
    }

    // 3. Seed System Administrator
    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL;
    const adminPassword = process.env.SYSTEM_ADMIN_PASSWORD;
    const adminName = process.env.SYSTEM_ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      logger.warn('SYSTEM_ADMIN_EMAIL or SYSTEM_ADMIN_PASSWORD not set in .env. Skipping admin seeding.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: seededRoles['System Administrator']._id,
        isActive: true,
      });
    } else {
      existingAdmin.role = seededRoles['System Administrator']._id;
      await existingAdmin.save();
    }
  } catch (error) {
    logger.error(`RBAC seeding failed: ${error.message}`);
    throw error;
  }
}
