import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AuthLayout from './components/AuthLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import TimetablePage from './pages/TimetablePage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import SystemAuditPage from './pages/SystemAuditPage';
import UsersPage from './pages/UsersPage';
import { Hammer } from 'lucide-react';

const UnderConstruction = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-6 shadow-xl shadow-amber-100/50">
      <Hammer className="w-10 h-10" />
    </div>
    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{title}</h2>
    <p className="text-slate-500 max-w-md font-medium leading-relaxed">
      This module is currently being optimized for the Premium White Theme experience. Check back soon for the full release.
    </p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" />
        
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/study-groups" element={<StudyGroupsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/create" element={<CreateListingPage />} />
            <Route path="/marketplace/chat/:productId/:otherUserId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Admin Restricted Routes */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute roles={['System Administrator']}>
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/system" 
              element={
                <ProtectedRoute roles={['System Administrator']}>
                  <SystemAuditPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
