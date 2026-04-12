import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner'; // adjust path if needed
import api from '../services/api'; // we'll create this next

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/stats');
        // Handle both possible response structures
        const raw = response.data?.data ?? response.data;
        setStats(raw ?? {});
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Courses</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.totalCourses || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Departments</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalDepartments || 0}</p>
        </div>
      </div>
    </div>
  );
}