import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Plus, Search, Users, MapPin, Calendar, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAdmin, isSystemAdmin } = useAuth();

  const canManage = (group) => isAdmin || isSystemAdmin || group.user?._id === user?._id;

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    meetingDay: 'Monday',
    meetingTime: '',
    location: '',
    description: '',
  });

  const fetchGroups = async () => {
    try {
      const response = await client.get('/study-groups');
      setGroups(response.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await client.patch(`/study-groups/${editingGroup._id}`, formData);
        toast.success('Study group updated successfully');
      } else {
        await client.post('/study-groups', formData);
        toast.success('Study group created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save study group');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await client.delete(`/study-groups/${id}`);
        toast.success('Group deleted');
        fetchGroups();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleJoin = async (groupId) => {
    try {
      await client.post(`/study-groups/${groupId}/join`);
      toast.success('Successfully joined the group!');
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', course: '', meetingDay: 'Monday', meetingTime: '', location: '', description: '' });
    setEditingGroup(null);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      course: group.course,
      meetingDay: group.meetingDay || 'Monday',
      meetingTime: group.meetingTime || '',
      location: group.location || '',
      description: group.description || '',
    });
    setIsModalOpen(true);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Study Groups</h1>
          <p className="text-slate-500 font-medium mt-1">Find your peers and learn together.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search groups by name or course..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups.map((group) => (
            <Card key={group._id} className="flex flex-col hover:border-accent group transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{group.course}</Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-600">{group.members?.length || 0} Members</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{group.name}</h3>
              <p className="text-sm text-slate-600 mb-6 line-clamp-2">{group.description}</p>
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-700">{group.meetingDay}</span>
                  {group.meetingTime && (
                    <span className="text-slate-300 mx-1">|</span>
                  )}
                  {group.meetingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{group.meetingTime}</span>
                    </div>
                  )}
                </div>
                
                {group.location && (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-700">{group.location}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-8 pt-6 border-t border-slate-100 italic">
                {canManage(group) ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(group)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-rose-600 hover:bg-rose-50 border-rose-100" onClick={() => handleDelete(group._id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant={group.members?.includes(user?._id) ? "outline" : "primary"} 
                    className="w-full"
                    disabled={group.members?.includes(user?._id)}
                    onClick={() => handleJoin(group._id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> 
                    {group.members?.includes(user?._id) ? 'Already a Member' : 'Join Group'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredGroups.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No study groups found. Why not create one?</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Edit Study Group' : 'Create New Group'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Group Name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
            placeholder="e.g. Advanced Maths Study Prep"
          />
          <Input 
            label="Related Course" 
            name="course" 
            value={formData.course} 
            onChange={handleInputChange} 
            required
            placeholder="e.g. MATH301"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Meeting Day</label>
              <select 
                name="meetingDay" 
                value={formData.meetingDay} 
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Meeting Time" 
              name="meetingTime" 
              type="time" 
              value={formData.meetingTime} 
              onChange={handleInputChange} 
            />
          </div>
          
          <Input 
            label="Location / Meeting Link" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange} 
            placeholder="e.g. Library Room 3 or Zoom Link"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">Description</label>
            <textarea 
              name="description" 
              rows="3" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What topics will you cover? What's the goal of the group?"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              {editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudyGroupsPage;
