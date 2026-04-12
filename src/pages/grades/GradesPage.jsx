import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grades');
      setGrades(response.data?.data ?? response.data ?? []);
      setError(null);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(grade =>
    grade.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Grade
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by student or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGrades.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No grades found
                </td>
              </tr>
            ) : (
              filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td className="px-6 py-4">{grade.student?.name}</td>
                  <td className="px-6 py-4">{grade.course?.title}</td>
                  <td className="px-6 py-4">{grade.marks}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {grade.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(grade.examDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{grade.remarks}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}