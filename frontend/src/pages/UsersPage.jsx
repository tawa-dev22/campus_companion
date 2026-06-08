import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus, 
  AlertTriangle,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  BookOpen,
  Plus,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

  // ─── Users State ────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Programs State ─────────────────────────────────────────────
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramCode, setNewProgramCode] = useState('');
  const [addingProgram, setAddingProgram] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState(null);

  // ─── Data Fetching ───────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        client.get('/admin/users'),
        client.get('/admin/roles')
      ]);
      if (usersRes?.status === 'success') setUsers(usersRes.data);
      if (rolesRes?.status === 'success') setRoles(rolesRes.data);
    } catch (error) {
      console.error('Failed to load user management data', error);
      toast.error('Could not load users and roles.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      const res = await client.get('/programs');
      setPrograms(res.data || []);
    } catch (error) {
      console.error('Failed to load programs', error);
      toast.error('Could not load programs.');
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPrograms();
  }, []);

  // ─── User Management Handlers ───────────────────────────────────
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormFullName(user.fullName || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormRoleId(user.role?._id || user.role || '');
    setFormIsActive(user.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving(true);
      const updateData = {
        fullName: formFullName,
        email: formEmail,
        phone: formPhone,
        roleId: formRoleId,
        isActive: formIsActive
      };
      const res = await client.put(`/admin/users/${selectedUser._id}`, updateData);
      if (res?.status === 'success') {
        toast.success('User updated successfully');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update user', error);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      const res = await client.delete(`/admin/users/${selectedUser._id}`);
      if (res?.status === 'success') {
        toast.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete user', error);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Program Management Handlers ────────────────────────────────
  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgramName.trim()) return toast.error('Program name is required');
    try {
      setAddingProgram(true);
      const res = await client.post('/programs/admin', { name: newProgramName.trim(), code: newProgramCode.trim() });
      if (res?.status === 'success') {
        toast.success(`Program "${newProgramName}" added successfully`);
        setNewProgramName('');
        setNewProgramCode('');
        fetchPrograms();
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to add program';
      toast.error(msg);
    } finally {
      setAddingProgram(false);
    }
  };

  const handleDeleteProgram = async (program) => {
    if (!window.confirm(`Are you sure you want to delete the program "${program.name}"? This cannot be undone.`)) return;
    try {
      setDeletingProgramId(program._id);
      const res = await client.delete(`/programs/admin/${program._id}`);
      if (res?.status === 'success') {
        toast.success(`Program "${program.name}" deleted`);
        fetchPrograms();
      }
    } catch (error) {
      toast.error('Failed to delete program');
    } finally {
      setDeletingProgramId(null);
    }
  };

  // ─── Filtered Users ──────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.staffId?.toLowerCase().includes(searchTerm.toLowerCase());
    const userRoleName = u.role?.name || '';
    const matchesRole = roleFilter === 'All' || userRoleName === roleFilter;
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && u.isActive !== false) || 
      (statusFilter === 'Inactive' && u.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.isActive !== false).length;
  const systemAdminCount = users.filter(u => u.role?.name === 'System Administrator').length;
  const adminCount = users.filter(u => u.role?.name === 'Admin').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Control</h1>
          <p className="text-slate-500 font-medium mt-1">Manage users, roles, and academic programs.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          id="tab-users"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-white text-primary shadow-md shadow-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Directory
        </button>
        <button
          id="tab-programs"
          onClick={() => setActiveTab('programs')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'programs'
              ? 'bg-white text-primary shadow-md shadow-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Program Management
        </button>
      </div>

      {/* ─── USERS TAB ─── */}
      {activeTab === 'users' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="!rounded-[28px] border-none shadow-xl shadow-slate-200/50 bg-slate-50">
              <Card.Content className="flex items-center gap-5 p-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Users</p>
                  <h3 className="text-3xl font-black text-slate-900">{totalUsersCount}</h3>
                </div>
              </Card.Content>
            </Card>

            <Card className="!rounded-[28px] border-none shadow-xl shadow-slate-200/50 bg-slate-50">
              <Card.Content className="flex items-center gap-5 p-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Active Accounts</p>
                  <h3 className="text-3xl font-black text-slate-900">{activeUsersCount}</h3>
                </div>
              </Card.Content>
            </Card>

            <Card className="!rounded-[28px] border-none shadow-xl shadow-slate-200/50 bg-slate-50">
              <Card.Content className="flex items-center gap-5 p-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">System Admins</p>
                  <h3 className="text-3xl font-black text-slate-900">{systemAdminCount}</h3>
                </div>
              </Card.Content>
            </Card>

            <Card className="!rounded-[28px] border-none shadow-xl shadow-slate-200/50 bg-slate-50">
              <Card.Content className="flex items-center gap-5 p-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Standard Admins</p>
                  <h3 className="text-3xl font-black text-slate-900">{adminCount}</h3>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Table Section */}
          <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <Card.Header 
              title="All Users" 
              subtitle="View and edit individual profile details, statuses, and role privileges." 
              className="p-8 pb-4"
            />
            
            {/* Filter Controls */}
            <div className="px-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, student/staff ID..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  {roles.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* User Table */}
            <Card.Content className="!p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="space-y-4 p-8 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-6 py-4 border-b border-slate-50">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
                          <div className="h-3 w-1/2 bg-slate-50 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-y border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        <th className="py-4 px-8">User Details</th>
                        <th className="py-4 px-4">Contact Info</th>
                        <th className="py-4 px-4">Role</th>
                        <th className="py-4 px-4">Account Status</th>
                        <th className="py-4 px-4">Joined Date</th>
                        <th className="py-4 px-8 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u) => {
                        const isSelf = u._id === currentUser?._id;
                        const roleName = u.role?.name || 'Unassigned';

                        return (
                          <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-5 px-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                  {u.profilePicture ? (
                                    <img 
                                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${u.profilePicture}`} 
                                      alt="" 
                                      className="w-full h-full object-cover rounded-2xl"
                                    />
                                  ) : u.fullName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                                    {u.fullName}
                                    {isSelf && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">You</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                    {u.studentId ? `ID: ${u.studentId}` : u.staffId ? `Staff: ${u.staffId}` : 'No ID Assigned'}
                                  </p>
                                  {u.program && (
                                    <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{u.program}{u.level ? ` • ${u.level}` : ''}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{u.email}</span>
                                </div>
                                {u.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{u.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-5 px-4">
                              <Badge 
                                variant={
                                  roleName === 'System Administrator' ? 'error' :
                                  roleName === 'Admin' ? 'warning' : 'primary'
                                }
                                className="rounded-lg py-1 px-2.5 font-bold uppercase tracking-wider text-[10px]"
                              >
                                {roleName}
                              </Badge>
                            </td>

                            <td className="py-5 px-4">
                              <Badge
                                variant={u.isActive !== false ? 'success' : 'default'}
                                className="rounded-lg py-1 px-2.5 font-bold uppercase tracking-wider text-[10px]"
                              >
                                {u.isActive !== false ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>

                            <td className="py-5 px-4 text-xs font-bold text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-300" />
                                <span>{new Date(u.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              </div>
                            </td>

                            <td className="py-5 px-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                  title="Edit user role & status"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(u)}
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete user"
                                  disabled={isSelf}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-24 text-center">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4 animate-bounce" />
                    <h4 className="text-lg font-bold text-slate-900">No users found</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Try adjusting your search terms or filters to find what you are looking for.</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Edit User Modal */}
          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update User privileges" maxWidth="md">
            <form onSubmit={handleUpdateUser} className="space-y-6">
              {selectedUser && selectedUser._id === currentUser?._id && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs font-medium flex gap-3 leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>You are editing your own profile. You cannot change your own role or disable your status to prevent admin lockout.</div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="No phone number" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Security Role</label>
                <select value={formRoleId} onChange={(e) => setFormRoleId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" disabled={selectedUser?._id === currentUser?._id}>
                  {roles.map(r => (<option key={r._id} value={r._id}>{r.name}</option>))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">Account Access</p>
                  <p className="text-xs text-slate-400 font-medium">Deactivated users will be blocked from logging into the app.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="sr-only peer" disabled={selectedUser?._id === currentUser?._id} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" variant="primary" loading={saving} className="rounded-xl">Save Changes</Button>
              </div>
            </form>
          </Modal>

          {/* Delete User Modal */}
          <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm User Deletion" maxWidth="sm">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-rose-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-lg font-black text-slate-900">Are you absolutely sure?</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently delete the user account for <span className="font-bold text-slate-800">{selectedUser?.fullName}</span> ({selectedUser?.email}) and remove all their database associations. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl w-full">Cancel</Button>
                <Button variant="danger" onClick={handleDeleteUser} loading={deleting} className="rounded-xl w-full">Delete User</Button>
              </div>
            </div>
          </Modal>
        </>
      )}

      {/* ─── PROGRAMS TAB ─── */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Program Form */}
          <div className="lg:col-span-1">
            <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
              <Card.Content className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Add New Program</h3>
                    <p className="text-xs text-slate-400 font-medium">Expand the academic program catalogue</p>
                  </div>
                </div>

                <form id="add-program-form" onSubmit={handleAddProgram} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Program Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering"
                      required
                      value={newProgramName}
                      onChange={(e) => setNewProgramName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Program Code <span className="text-slate-300">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. SE"
                      value={newProgramCode}
                      onChange={(e) => setNewProgramCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={addingProgram}
                    className="w-full rounded-xl mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Program
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    <span className="font-black">How it works:</span> Programs added here will appear in the program dropdown for students when they set up their profile, and when admins post assignments or timetables.
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Programs List */}
          <div className="lg:col-span-2">
            <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <Card.Header
                title="Academic Programs"
                subtitle={`${programs.length} program${programs.length !== 1 ? 's' : ''} registered in the system`}
                className="p-8 pb-4"
              />
              <Card.Content className="!p-0">
                {programsLoading ? (
                  <div className="p-8 space-y-4 animate-pulse">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-16 bg-slate-50 rounded-2xl"></div>
                    ))}
                  </div>
                ) : programs.length === 0 ? (
                  <div className="py-20 text-center px-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">No programs yet</h4>
                    <p className="text-slate-400 text-sm mt-1">Add your first academic program using the form on the left.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {programs.map((program, index) => (
                      <div key={program._id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/60 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary font-black text-sm">
                            {program.code || (index + 1)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{program.name}</p>
                            {program.code && (
                              <p className="text-xs text-slate-400 font-medium mt-0.5">Code: {program.code}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </Badge>
                          <button
                            onClick={() => handleDeleteProgram(program)}
                            disabled={deletingProgramId === program._id}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40"
                            title={`Delete ${program.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
