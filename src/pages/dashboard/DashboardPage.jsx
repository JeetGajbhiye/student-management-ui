import { useEffect, useState } from 'react';
import { Users, BookOpen, Building2, ClipboardList } from 'lucide-react';
import { getDashboardStats } from '../../api/dashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => {
        const raw = res.data?.data ?? res.data
        setStats(raw ?? {})
      })
      .catch((e) => { console.error(e); setStats({}) })
      .finally(() => setLoading(false))
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users}        label="Total Students"    value={stats?.totalStudents}    color="bg-blue-500" />
        <StatCard icon={BookOpen}     label="Total Courses"     value={stats?.totalCourses}     color="bg-green-500" />
        <StatCard icon={Building2}    label="Departments"       value={stats?.totalDepartments} color="bg-purple-500" />
        <StatCard icon={ClipboardList} label="Enrollments"      value={stats?.totalEnrollments} color="bg-orange-500" />
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Student Management System</h2>
        <p className="text-gray-500">Use the sidebar to manage students, courses, departments, enrollments and grades.</p>
      </div>
    </div>
  );
}