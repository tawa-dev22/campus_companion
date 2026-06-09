import React, { useState, useEffect } from 'react';
import client, { getBackendUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import FileUpload from '../components/ui/FileUpload';
import { Plus, Search, Calendar, MapPin, Trash2, Edit, Sparkles, Filter, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, isSystemAdmin } = useAuth();
  const canManage = isAdmin || isSystemAdmin;

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    date: '',
    venue: '',
    description: '',
  });
  
  const [files, setFiles] = useState({
    image: null,
    video: null
  });

  const fetchEvents = async () => {
    try {
      const response = await client.get('/events');
      setEvents(response.items || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.image) data.append('image', files.image);
    if (files.video) data.append('video', files.video);

    try {
      if (editingEvent) {
        await client.patch(`/events/${editingEvent._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event updated successfully');
      } else {
        await client.post('/events', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event created successfully and broadcasted!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await client.delete(`/events/${id}`);
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'General', date: '', venue: '', description: '' });
    setFiles({ image: null, video: null });
    setEditingEvent(null);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      category: event.category || 'General',
      date: new Date(event.date).toISOString().split('T')[0],
      venue: event.venue || '',
      description: event.description || '',
    });
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
              Explore Life
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Campus Events</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Stay connected with everything happening on campus.</p>
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Post Event
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-[28px] shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="flex items-center gap-3 flex-1 pl-4 h-12">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search events, workshops, exhibitions..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-medium outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <Button variant="outline" className="h-10 rounded-2xl border-none bg-slate-50 text-slate-600 font-bold hover:bg-slate-100">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event._id} className="relative group perspective-1000">
               <Card className="!p-0 !rounded-[32px] overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform group-hover:-translate-y-2 h-full flex flex-col">
                <div className="h-56 overflow-hidden relative group-hover:h-64 transition-all duration-500">
                  <img 
                    src={event.image ? (event.image.startsWith('http') ? event.image : `${getBackendUrl()}/${event.image.replace('\\', '/')}`) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-5 right-5">
                    <Badge className="glass !bg-white/90 !text-slate-900 font-black px-4 py-1.5 rounded-xl border-none shadow-lg">{event.category || 'General'}</Badge>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2">{event.title}</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed mb-auto">
                    {event.description || 'No description provided for this campus event.'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                    <Button variant="outline" className="border-none bg-slate-50 hover:bg-primary hover:text-white rounded-xl h-10 px-4 font-black">
                      Join Event
                    </Button>
                    {canManage && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => openEditModal(event)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <Sparkles className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-xl font-bold">No events found matching your search.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4 rounded-xl font-black">Clear Search</Button>
            </div>
          )}
        </div>
      )}

      {/* Modern Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Refine Event' : 'New Campus Event'}
        className="!p-0 !rounded-[32px] overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <Input 
            label="What's the event name?" 
            name="title" 
            placeholder="e.g. Annual Tech Symposium"
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            className="rounded-2xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="When?" 
              name="date" 
              type="date" 
              value={formData.date} 
              onChange={handleInputChange} 
              required 
              className="rounded-2xl"
            />
            <Input 
              label="Tag / Category" 
              name="category" 
              placeholder="e.g. Academic"
              value={formData.category} 
              onChange={handleInputChange} 
              className="rounded-2xl"
            />
          </div>
          <Input 
            label="Where on campus?" 
            name="venue" 
            placeholder="e.g. Grand Hall, Sector 4"
            value={formData.venue} 
            onChange={handleInputChange} 
            className="rounded-2xl"
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Tell us more about it</label>
            <textarea 
              name="description" 
              rows="3" 
              placeholder="Add details about speakers, registration, and highlight features..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <FileUpload 
              label="Cover Graphics" 
              description="Max 10MB (JPG, PNG)"
              accept="image/*"
              onFileSelect={(file) => setFiles(prev => ({ ...prev, image: file }))}
            />
            <FileUpload 
              label="Promo Video" 
              description="Max 50MB (MP4, MOV)"
              accept="video/*"
              onFileSelect={(file) => setFiles(prev => ({ ...prev, video: file }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-2xl font-bold h-12 px-6 border-slate-200">
              Cancel
            </Button>
            <Button type="submit" className="rounded-2xl font-black h-12 px-10 shadow-lg shadow-primary/20">
              {editingEvent ? 'Save Changes' : 'Broadcast Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;
