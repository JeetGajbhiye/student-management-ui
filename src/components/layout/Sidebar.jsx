import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, Building2,
  ClipboardList, Award, LogOut, GraduationCap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',  icon: Users,           label: 'Students' },
  { to: '/courses',   icon: BookOpen,        label: 'Courses' },
  { to: '/departments', icon: Building2,     label: 'Departments' },
  { to: '/enrollments', icon: ClipboardList, label: 'Enrollments' },
  { to: '/grades',    icon: Award,           label: 'Grades' },
];

export default function Sidebar() {
  const { logoutUser, user } = useAuth();

  return (
    <aside className="w-64 bg-primary-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-white" size={28} />
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">SMS</h1>
            <p className="text-primary-300 text-xs">Student Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium
              ${isActive
                ? 'bg-primary-600 text-white'
                : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <p className="text-primary-300 text-xs">{user?.roles?.[0]?.replace('ROLE_', '')}</p>
          </div>
        </div>
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 text-primary-300 hover:text-white transition-colors w-full px-2 py-2 rounded-lg hover:bg-primary-800 text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}