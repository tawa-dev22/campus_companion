import React, { useState, useEffect } from 'react';
import client, { getBackendUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import FileUpload from '../components/ui/FileUpload';
import { 
  Plus, 
  Search, 
  Calendar, 
  FileText, 
  Trash2, 
  Edit, 
  Download, 
  BookOpen, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, isSystemAdmin } = useAuth();
  const canManage = isAdmin || isSystemAdmin;

  // Programs from database
  const [programs, setPrograms] = useState([]);

  // Student Submissions Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Admin Submissions Viewer
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedSubmissionsAssignment, setSelectedSubmissionsAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading form
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [formGrade, setFormGrade] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    module: '',
    dueDate: '',
    status: 'pending',
    priority: 'Medium',
    notes: '',
    level: 'Level 1.1',
    program: '',
  });
  const [documentFile, setDocumentFile] = useState(null);

  const fetchPrograms = async () => {
    try {
      const response = await client.get('/programs');
      const list = response.data || [];
      setPrograms(list);
      // Set default program from first item
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, program: prev.program || list[0].name }));
      }
    } catch (error) {
      console.error('Failed to load programs', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await client.get('/assignments');
      setAssignments(response.items || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchAssignments();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (documentFile) data.append('document', documentFile);

    try {
      if (editingAssignment) {
        await client.patch(`/assignments/${editingAssignment._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Assignment updated successfully');
      } else {
        await client.post('/assignments', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('New assignment posted and students notified!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment? Students will be notified.')) {
      try {
        await client.delete(`/assignments/${id}`);
        toast.success('Assignment removed');
        fetchAssignments();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      module: '', 
      dueDate: '', 
      status: 'pending', 
      priority: 'Medium', 
      notes: '', 
      level: 'Level 1.1', 
      program: programs[0]?.name || '' 
    });
    setDocumentFile(null);
    setEditingAssignment(null);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      module: assignment.module,
      dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
      status: assignment.status || 'pending',
      priority: assignment.priority || 'Medium',
      notes: assignment.notes || '',
      level: assignment.level || 'Level 1.1',
      program: assignment.program || 'Computer Science',
    });
    setIsModalOpen(true);
  };

  // Student Submissions trigger
  const openSubmitModal = (assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionFile(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile || !submittingAssignment) return;

    const data = new FormData();
    data.append('document', submissionFile);

    try {
      setSubmitting(true);
      await client.post(`/assignments/${submittingAssignment._id}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      setSubmissionFile(null);
      fetchAssignments();
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin view submissions trigger
  const openSubmissionsModal = async (assignment) => {
    setSelectedSubmissionsAssignment(assignment);
    setIsSubmissionsModalOpen(true);
    setSubmissions([]);
    setLoadingSubmissions(true);
    try {
      const res = await client.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data || []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Admin submit grading
  const handleGradeSubmit = async (e, submissionId) => {
    e.preventDefault();
    try {
      setGrading(true);
      await client.patch(`/assignments/submissions/${submissionId}`, {
        grade: formGrade,
        feedback: formFeedback
      });
      toast.success('Grade and feedback saved successfully!');
      setGradingSubmissionId(null);
      setFormGrade('');
      setFormFeedback('');
      // Reload submissions list
      const res = await client.get(`/assignments/${selectedSubmissionsAssignment._id}/submissions`);
      setSubmissions(res.data || []);
    } catch (error) {
      toast.error('Failed to save grade');
    } finally {
      setGrading(false);
    }
  };

  const openGradingPanel = (submission) => {
    setGradingSubmissionId(submission._id);
    setFormGrade(submission.grade || '');
    setFormFeedback(submission.feedback || '');
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted': return <Badge variant="success" className="rounded-lg px-2 text-[10px] h-6 flex items-center">Submitted</Badge>;
      case 'in-progress': return <Badge variant="primary" className="rounded-lg px-2 text-[10px] h-6 flex items-center">Reviewing</Badge>;
      default: return <Badge variant="warning" className="rounded-lg px-2 text-[10px] h-6 flex items-center">Open</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
     if (priority === 'High') return <Badge variant="danger" className="rounded-lg text-[9px] h-5 opacity-80 uppercase">Rush</Badge>;
     return <Badge variant="outline" className="rounded-lg text-[9px] h-5 opacity-60 uppercase">{priority}</Badge>;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="emerald" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
              Academic Hub
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Assignments</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Track deadlines, submissions, and course materials.</p>
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Add Course Assignment
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-[28px] shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="flex items-center gap-3 flex-1 pl-4 h-12">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by module code or title..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-medium outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id} className="!p-0 !rounded-[32px] overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col group">
              <div className="p-8 pb-4">
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       {getStatusBadge(assignment.status)}
                       {getPriorityBadge(assignment.priority)}
                       <Badge variant="default" className="rounded-lg text-[9px] h-5 uppercase">{assignment.program || 'CS'} • {assignment.level || '1.1'}</Badge>
                    </div>
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-7 line-clamp-2">{assignment.title}</h3>
                 <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.15em]">{assignment.module || 'No Module'}</p>
              </div>

              <div className="px-8 pb-8 flex-1 flex flex-col">
                <div className="space-y-4 mb-auto">
                   <div className="flex items-center justify-between py-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                         <Calendar className="w-4 h-4 text-primary" />
                         <span className="text-xs">Submission Deadline</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                   
                   {assignment.notes && (
                     <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/30 relative">
                        <AlertCircle className="absolute -top-1.5 -right-1.5 w-4 h-4 text-indigo-400 bg-white rounded-full" />
                        <p className="text-xs text-indigo-900 font-medium leading-relaxed italic line-clamp-2">"{assignment.notes}"</p>
                     </div>
                   )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col gap-3">
                   {assignment.document ? (
                      <a href={assignment.document.startsWith('http') ? assignment.document : `${getBackendUrl()}/${assignment.document.replace('\\', '/')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg shadow-slate-200"
                      >
                         <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 opacity-80" />
                            <span className="text-xs font-black truncate max-w-[120px]">{assignment.fileMetadata?.filename || 'Course Document'}</span>
                         </div>
                         <Download className="w-4 h-4" />
                      </a>
                   ) : (
                      <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed">
                         <FileText className="w-4 h-4" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">No Attachment</span>
                      </div>
                   )}

                   {canManage && (
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => openSubmissionsModal(assignment)} className="w-full rounded-xl h-10 border-slate-100 bg-white font-bold text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 shadow-sm">
                           View Submissions ({assignment.submissionCount || 0})
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(assignment)} className="flex-1 rounded-xl h-10 border-slate-100 bg-white font-bold text-slate-600 hover:border-primary">
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(assignment._id)} className="flex-1 rounded-xl h-10 border-slate-100 bg-white font-bold text-rose-500 hover:border-rose-500 hover:bg-rose-50">
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                          </Button>
                        </div>
                      </div>
                   )}

                   {!canManage && (
                      <div className="pt-4 border-t border-slate-50">
                        {assignment.status === 'submitted' ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800">
                              <div className="flex items-center gap-2 font-black text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Submitted</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(assignment.submission?.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-bold">
                              <span className="truncate max-w-[150px]">{assignment.submission?.fileMetadata?.filename}</span>
                              <button 
                                onClick={() => openSubmitModal(assignment)}
                                className="text-primary hover:underline"
                              >
                                Resubmit
                              </button>
                            </div>
                            {assignment.submission?.status === 'graded' && (
                              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 text-xs mt-2">
                                <p className="font-black text-indigo-900 flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-indigo-600" />
                                  Grade: <span className="text-sm font-black text-slate-900">{assignment.submission.grade}</span>
                                </p>
                                {assignment.submission.feedback && (
                                  <p className="text-slate-500 italic mt-2">"{assignment.submission.feedback}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button 
                            variant="primary" 
                            onClick={() => openSubmitModal(assignment)}
                            className="w-full rounded-xl"
                          >
                            Submit Assignment
                          </Button>
                        )}
                      </div>
                   )}
                </div>
              </div>
            </Card>
          ))}
          {filteredAssignments.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
               <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-xl font-bold tracking-tight">No assignments match your filter.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4 rounded-xl font-black">View All</Button>
            </div>
          )}
        </div>
      )}

      {/* Modern Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Update Assignment' : 'Post Assignment'}
        className="!p-0 !rounded-[32px] overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <Input 
            label="Title of Assignment" 
            name="title" 
            placeholder="e.g. Midterm Lab Report"
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            className="rounded-2xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Associated Module" 
              name="module" 
              placeholder="e.g. CS101"
              value={formData.module} 
              onChange={handleInputChange} 
              required
              className="rounded-2xl"
            />
            <Input 
              label="Final Submission Date" 
              name="dueDate" 
              type="date" 
              value={formData.dueDate} 
              onChange={handleInputChange} 
              required 
              className="rounded-2xl"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Priority Level</label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Student Program</label>
              <select 
                name="program" 
                value={formData.program} 
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 cursor-pointer"
              >
                <option value="">-- Select Program --</option>
                {programs.map(p => (
                  <option key={p._id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Student Level</label>
              <select 
                name="level" 
                value={formData.level} 
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 cursor-pointer"
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Context / Instructions</label>
            <textarea 
              name="notes" 
              rows="3" 
              placeholder="Provide specific details about the submission format, requirements, and grading criteria..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900"
              value={formData.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="pt-2">
            <FileUpload 
              label="Course Material / Resources" 
              description="Drag & Drop PDF, DOCX or ZIP (Max 10MB)"
              accept=".pdf,.doc,.docx,.zip,.txt"
              onFileSelect={(file) => setDocumentFile(file)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-2xl font-bold h-12 px-6 border-slate-200">
              Cancel
            </Button>
            <Button type="submit" className="rounded-2xl font-black h-12 px-10 shadow-lg shadow-primary/20">
              {editingAssignment ? 'Save Changes' : 'Broadcast to Students'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Assignment Solution"
        className="!p-0 !rounded-[32px] overflow-hidden"
      >
        <form onSubmit={handleSubmissionSubmit} className="space-y-6 p-8">
          <div>
            <h4 className="text-lg font-black text-slate-900">{submittingAssignment?.title}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Module: {submittingAssignment?.module}</p>
          </div>

          <FileUpload 
            label="Upload Assignment Document"
            description="Select PDF, Word document, or ZIP file of your work (Max 50MB)"
            accept=".pdf,.doc,.docx,.zip,.txt"
            onFileSelect={(file) => setSubmissionFile(file)}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsSubmitModalOpen(false)} className="rounded-2xl font-bold">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="rounded-2xl font-black px-8">
              Submit Solution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Submissions Viewer Modal */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title="Students Submissions Panel"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900">{selectedSubmissionsAssignment?.title}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {selectedSubmissionsAssignment?.program} • {selectedSubmissionsAssignment?.level}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                {submissions.length} Submissions
              </span>
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="py-12 text-center text-slate-400 font-bold animate-pulse">Loading solutions...</div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const isGradingThis = gradingSubmissionId === sub._id;

                return (
                  <Card key={sub._id} className="!p-6 bg-white border border-slate-100 shadow-sm rounded-[24px]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{sub.student?.fullName}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          ID: {sub.student?.studentId || 'N/A'} • {sub.student?.program || 'N/A'} • {sub.student?.level || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {sub.status === 'graded' ? (
                          <Badge variant="success" className="font-bold uppercase text-[9px]">Graded: {sub.grade}</Badge>
                        ) : (
                          <Badge variant="warning" className="font-bold uppercase text-[9px]">Needs Grade</Badge>
                        )}
                        <a href={sub.document.startsWith('http') ? sub.document : `${getBackendUrl()}/${sub.document.replace('\\', '/')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Document
                        </a>
                      </div>
                    </div>

                    {/* Grading Section */}
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      {isGradingThis ? (
                        <form onSubmit={(e) => handleGradeSubmit(e, sub._id)} className="space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1">
                              <Input 
                                label="Grade"
                                placeholder="e.g. A+, 85%"
                                value={formGrade}
                                onChange={(e) => setFormGrade(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Input 
                                label="Feedback"
                                placeholder="Provide remarks..."
                                value={formFeedback}
                                onChange={(e) => setFormFeedback(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" type="button" onClick={() => setGradingSubmissionId(null)} className="h-9 rounded-xl">
                              Cancel
                            </Button>
                            <Button size="sm" type="submit" loading={grading} className="h-9 rounded-xl px-5">
                              Submit Grade
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-50">
                          <div className="min-w-0">
                            {sub.feedback ? (
                              <p className="text-xs text-slate-500 font-medium italic truncate">"{sub.feedback}"</p>
                            ) : (
                              <p className="text-xs text-slate-400 font-bold">No feedback provided.</p>
                            )}
                          </div>
                          <button 
                            onClick={() => openGradingPanel(sub)}
                            className="text-xs text-primary font-black uppercase tracking-wider hover:text-primary-dark shrink-0"
                          >
                            {sub.status === 'graded' ? 'Regrade' : 'Grade Submission'}
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
              No students have submitted solutions for this assignment yet.
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsSubmissionsModalOpen(false)} className="rounded-xl">
              Close Panel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;
