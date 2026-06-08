import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Camera, Lock, Shield, UserCheck, 
  GraduationCap, Building, Briefcase, 
  Edit3, Save, X, ChevronRight, CheckCircle2,
  AlertCircle, History, LogIn, Clock, 
  IdCard, BookOpen, ShieldCheck as LucideShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const ProfilePage = () => {
  const { user, isStudent, isAdmin, isSystemAdmin } = useAuth();
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
    } catch (e) {
      return '';
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    staffId: user?.staffId || '',
    program: user?.program || '',
    level: user?.level || '',
    address: user?.address || '',
    gender: user?.gender || '',
    dateOfBirth: formatDateForInput(user?.dateOfBirth),
  });

  const [activeTab, setActiveTab] = useState('general');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fileInputRef = useRef(null);

  // Programs from database
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await client.get('/programs');
        setPrograms(response.data || []);
      } catch (error) {
        console.error('Failed to load programs', error);
      }
    };
    fetchPrograms();
  }, []);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await client.put('/profile/update', profileData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Wait for backend to update and then potentially refresh user context 
      // depending on app architecture, or just update local state
      window.location.reload(); // Simplest way to refresh all components with new user data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    setLoading(true);
    try {
      await client.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setLoading(true);
    try {
      await client.put('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile picture updated!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload picture');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      fields: [
        { label: 'Full Name', name: 'fullName', type: 'text', icon: User, editable: true },
        { label: 'Email Address', name: 'email', type: 'email', icon: Mail, editable: false },
        { label: 'Phone Number', name: 'phone', type: 'tel', icon: Phone, editable: true },
        { label: 'Gender', name: 'gender', type: 'select', icon: UserCheck, editable: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
        { label: 'Date of Birth', name: 'dateOfBirth', type: 'date', icon: Calendar, editable: true },
        { label: 'Address', name: 'address', type: 'text', icon: MapPin, editable: true },
      ],
      fullWidthFields: [
        { label: 'Short Bio', name: 'bio', type: 'textarea', icon: Edit3, editable: true },
      ]
    },
    {
      id: 'academic',
      title: isStudent ? 'Academic Information' : 'Staff Information',
      icon: GraduationCap,
      fields: isStudent ? [
        { label: 'Student ID', name: 'studentId', type: 'text', icon: IdCard, editable: true },
        { label: 'Program/Course', name: 'program', type: 'select', icon: BookOpen, editable: true, options: programs.map(p => p.name) },
        { label: 'Department', name: 'department', type: 'text', icon: Building, editable: true },
        { label: 'Level/Year', name: 'level', type: 'select', icon: GraduationCap, editable: true, options: ['Level 1.1', 'Level 1.2', 'Level 2.1', 'Level 2.2', 'Level 3.1', 'Level 3.2', 'Level 4.1', 'Level 4.2'] },
      ] : [
        { label: 'Staff ID', name: 'staffId', type: 'text', icon: IdCard, editable: true },
        { label: 'Department', name: 'department', type: 'text', icon: Building, editable: true },
      ]
    }
  ];

  const tabs = [
    { id: 'general', label: 'Personal Info', icon: User },
    { id: 'academic', label: isStudent ? 'Academic Info' : 'Staff Info', icon: GraduationCap },
    { id: 'security', label: 'Security & Access', icon: Shield },
  ];

  const metadata = [
    { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive', icon: CheckCircle2, color: user?.isActive ? 'success' : 'danger' },
    { label: 'Joined On', value: new Date(user?.createdAt).toLocaleDateString(), icon: Clock },
    { label: 'Last Updated', value: new Date(user?.updatedAt).toLocaleTimeString(), icon: History },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header Profile Card */}
      <Card className="!p-0 overflow-hidden !rounded-[40px] border-none shadow-2xl shadow-slate-200/50">
        <div className="h-48 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="px-10 pb-10 flex flex-col md:flex-row items-end gap-8 -mt-20 relative z-10">
          <div className="relative group">
            <div 
              className={cn(
                "w-40 h-40 rounded-[35px] border-8 border-white bg-white shadow-2xl overflow-hidden cursor-pointer",
                "transform transition-transform duration-500 group-hover:scale-105"
              )}
              onClick={handleAvatarClick}
            >
              {user?.profilePicture ? (
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.profilePicture}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-black text-primary">
                  {user?.fullName?.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.fullName}</h1>
            </div>
            <p className="text-slate-500 font-medium text-lg flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>

          <div className="flex gap-3 pb-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="rounded-2xl px-6 h-14 font-black">
                <Edit3 className="w-5 h-5 mr-2" /> Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-2xl px-6 h-14 font-black border-slate-200">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} loading={loading} className="rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/20">
                  <Save className="w-5 h-5 mr-2" /> Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 px-2 text-sm font-black flex items-center gap-2 border-b-2 transition-all relative font-display",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "text-slate-400")} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" 
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-10">
              {sections.filter(s => s.id === 'personal').map((section) => (
                <Card key={section.id} className="!rounded-[32px] border-none shadow-xl shadow-slate-100/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{field.label}</label>
                        <div className="relative group">
                          <field.icon className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 transition-colors",
                            isEditing && field.editable && "group-focus-within:text-primary"
                          )} />
                          {isEditing && field.editable ? (
                            field.type === 'select' ? (
                              <select
                                name={field.name}
                                value={profileData[field.name]}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              >
                                <option value="">Select {field.label}</option>
                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <Input 
                                type={field.type}
                                name={field.name}
                                value={profileData[field.name]}
                                onChange={handleInputChange}
                                className="pl-11 h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                              />
                            )
                          ) : (
                            <div className="h-14 flex items-center pl-11 pr-4 bg-slate-50/50 rounded-2xl border border-transparent text-sm font-bold text-slate-700">
                              {profileData[field.name] || <span className="text-slate-300 font-medium italic">Not specified</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {section.fullWidthFields?.map((field) => (
                      <div key={field.name} className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{field.label}</label>
                        {isEditing && field.editable ? (
                          <textarea
                            name={field.name}
                            value={profileData[field.name]}
                            onChange={handleInputChange}
                            className="w-full p-4 min-h-[120px] bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            placeholder={`Tell us about yourself...`}
                          />
                        ) : (
                          <div className="p-4 min-h-[100px] bg-slate-50/50 rounded-2xl border border-transparent text-sm font-bold text-slate-700 leading-relaxed">
                            {profileData[field.name] || <span className="text-slate-300 font-medium italic">Empty bio</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Right Column: Meta */}
            <div className="space-y-8">
              <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-100/50">
                <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Account Metadata
                </h4>
                <div className="space-y-6">
                  {metadata.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">{item.label}</span>
                      </div>
                      {item.color ? (
                        <Badge variant={item.color} className="rounded-lg">{item.value}</Badge>
                      ) : (
                        <span className="text-sm font-black text-slate-800">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'academic' && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-10">
              {sections.filter(s => s.id === 'academic').map((section) => (
                <Card key={section.id} className="!rounded-[32px] border-none shadow-xl shadow-slate-100/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{field.label}</label>
                        <div className="relative group">
                          <field.icon className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 transition-colors",
                            isEditing && field.editable && "group-focus-within:text-primary"
                          )} />
                          {isEditing && field.editable ? (
                            <Input 
                              type={field.type}
                              name={field.name}
                              value={profileData[field.name]}
                              onChange={handleInputChange}
                              className="pl-11 h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                            />
                          ) : (
                            <div className="h-14 flex items-center pl-11 pr-4 bg-slate-50/50 rounded-2xl border border-transparent text-sm font-bold text-slate-700">
                              {profileData[field.name] || <span className="text-slate-300 font-medium italic">Not specified</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Right Column: Info */}
            <div className="space-y-8">
              <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-100/50">
                <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {isStudent ? 'Academic Standing' : 'Staff Assignments'}
                </h4>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {isStudent 
                    ? "Your academic records and progress are managed by your department. Please contact them directly to formally change your course or level."
                    : "Your staff records and department assignments are centrally managed."}
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* Left Column: Password */}
            <div className="lg:col-span-2">
              <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-100/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Change Password</h3>
                    <p className="text-slate-500 font-medium">Update your security credentials</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <Input 
                        type="password"
                        label="Current Password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="pl-11 h-14 bg-slate-50 border-none rounded-2xl"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <Input 
                        type="password"
                        label="New Password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="pl-11 h-14 bg-slate-50 border-none rounded-2xl"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <Input 
                        type="password"
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-11 h-14 bg-slate-50 border-none rounded-2xl"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" loading={loading} className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/10">
                    Update Security Credentials
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Column: Status */}
            <div>
              <Card className="!rounded-[32px] border-none bg-slate-900 text-white shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/40 transition-all duration-500"></div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Employment/Status
                  </h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                    Your account is currently verified and has all standard permissions for the <span className="text-primary font-bold">{user?.role?.name}</span> role.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <LucideShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">System Level</p>
                      <p className="text-sm font-bold">Standard Access</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">
                    Some information like your role and permissions are managed by the System Administrators.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
