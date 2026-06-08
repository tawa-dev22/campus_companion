import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Plus, Search, MapPin, User, Clock, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, isSystemAdmin } = useAuth();
  
  const canManage = isAdmin || isSystemAdmin;

  const [formData, setFormData] = useState({
    courseTitle: '',
    lecturer: '',
    venue: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    level: 'Level 1.1',
    program: '',
  });

  // Programs from database
  const [programs, setPrograms] = useState([]);

  const fetchPrograms = async () => {
    try {
      const response = await client.get('/programs');
      const list = response.data || [];
      setPrograms(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, program: prev.program || list[0].name }));
      }
    } catch (error) {
      console.error('Failed to load programs', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await client.get('/timetable');
      setEntries(response.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchEntries();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await client.patch(`/timetable/${editingEntry._id}`, formData);
        toast.success('Timetable entry updated successfully');
      } else {
        await client.post('/timetable', formData);
        toast.success('Timetable entry created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await client.delete(`/timetable/${id}`);
        toast.success('Entry deleted');
        fetchEntries();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ courseTitle: '', lecturer: '', venue: '', day: 'Monday', startTime: '', endTime: '', level: 'Level 1.1', program: programs[0]?.name || '' });
    setEditingEntry(null);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      courseTitle: entry.courseTitle,
      lecturer: entry.lecturer || '',
      venue: entry.venue || '',
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      level: entry.level || 'Level 1.1',
      program: entry.program || 'Computer Science',
    });
    setIsModalOpen(true);
  };

  // Group entries by day
  const groupedEntries = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = entries.filter(e => 
      e.day === day && 
      (e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (e.lecturer && e.lecturer.toLowerCase().includes(searchTerm.toLowerCase())))
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Class Timetable</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your weekly class schedule.</p>
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search classes or lecturers..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS_OF_WEEK.map(day => {
            const dayEntries = groupedEntries[day];
            if (dayEntries.length === 0 && searchTerm) return null; // Hide empty days when searching

            return (
              <Card key={day} className="flex flex-col bg-slate-50/50 border-slate-200 shadow-sm">
                <Card.Header 
                  title={<span className="text-lg text-primary">{day}</span>} 
                  className="pb-2 border-b border-slate-200"
                />
                <Card.Content className="flex-1 pt-4 space-y-4">
                  {dayEntries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">No classes scheduled</div>
                  ) : (
                    dayEntries.map((entry) => (
                      <div key={entry._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900">{entry.courseTitle}</h4>
                          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md shrink-0">
                            {entry.startTime} - {entry.endTime}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {entry.program || 'Computer Science'} • {entry.level || 'Level 1.1'}
                            </span>
                          </div>
                          {entry.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{entry.venue}</span>
                            </div>
                          )}
                          {entry.lecturer && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>{entry.lecturer}</span>
                            </div>
                          )}
                        </div>

                        {canManage && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur pb-2 pl-2 rounded-bl-lg flex gap-1">
                            <button onClick={() => openEditModal(entry)} className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-100 rounded-md">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(entry._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors bg-slate-100 rounded-md">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Course Title" 
            name="courseTitle" 
            value={formData.courseTitle} 
            onChange={handleInputChange} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Lecturer" 
              name="lecturer" 
              value={formData.lecturer} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Venue" 
              name="venue" 
              value={formData.venue} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Day of Week</label>
              <select 
                name="day" 
                value={formData.day} 
                onChange={handleInputChange}
                className="input-premium bg-white"
              >
                {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Student Program</label>
              <select 
                name="program" 
                value={formData.program} 
                onChange={handleInputChange}
                className="input-premium bg-white"
              >
                <option value="">-- Select Program --</option>
                {programs.map(p => (
                  <option key={p._id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Student Level</label>
              <select 
                name="level" 
                value={formData.level} 
                onChange={handleInputChange}
                className="input-premium bg-white"
              >
                <option value="Level 1.1">Level 1.1</option>
                <option value="Level 1.2">Level 1.2</option>
                <option value="Level 2.1">Level 2.1</option>
                <option value="Level 2.2">Level 2.2</option>
                <option value="Level 3.1">Level 3.1</option>
                <option value="Level 3.2">Level 3.2</option>
                <option value="Level 4.1">Level 4.1</option>
                <option value="Level 4.2">Level 4.2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Time" 
              name="startTime" 
              type="time" 
              value={formData.startTime} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="End Time" 
              name="endTime" 
              type="time" 
              value={formData.endTime} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              {editingEntry ? 'Update Class' : 'Add Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetablePage;
