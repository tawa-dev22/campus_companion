import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard'],
  ['/timetable', 'Timetable'],
  ['/assignments', 'Assignments'],
  ['/events', 'Events'],
  ['/study-groups', 'Study Groups'],
  ['/marketplace', 'Marketplace']
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">Campus Companion</Link>
        <p className="muted">Smart scheduling, student life, and collaboration.</p>
        <nav className="nav-list">
          {links.map(([path, label]) => (
            <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div>
            <h2>Welcome, {user?.fullName || 'Student'}</h2>
            <p className="muted">{user?.department || 'Campus'} • {user?.studentId || 'Profile'}</p>
          </div>
          <button className="secondary-btn" onClick={handleLogout}>Logout</button>
        </header>
        {children}
      </main>
    </div>
  );
}
