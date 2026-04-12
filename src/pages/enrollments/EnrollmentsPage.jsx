import { useState, useEffect } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { getEnrollments, createEnrollment, deleteEnrollment } from '../../api/enrollments'
import { getStudents } from '../../api/students'
import { getCourses } from '../../api/courses'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const empty = { studentId: '', courseId: '', enrollmentDate: '', status: 'ACTIVE' }

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        getEnrollments(), getStudents(), getCourses()
      ])
      const eRaw = eRes.data?.data ?? eRes.data
      const sRaw = sRes.data?.data ?? sRes.data
      const cRaw = cRes.data?.data ?? cRes.data
      setEnrollments(Array.isArray(eRaw) ? eRaw : eRaw?.content ?? [])
      setStudents(Array.isArray(sRaw) ? sRaw : sRaw?.content ?? [])
      setCourses(Array.isArray(cRaw) ? cRaw : cRaw?.content ?? [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load enrollments')
    }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createEnrollment(form)
      toast.success('Student enrolled!')
      setModalOpen(false); setForm(empty); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Already enrolled or error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteEnrollment(deleteDialog.id)
      toast.success('Enrollment removed!')
      setDeleteDialog({ open: false, id: null }); fetchAll()
    } catch { toast.error('Failed to remove enrollment') }
  }

  const statusColor = (s) => ({
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    DROPPED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700')

  const filtered = enrollments.filter(e =>
    `${e.student?.firstName} ${e.student?.lastName} ${e.course?.title}`
      .toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary gap-2">
          <Plus size={18} /> Enroll Student
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="input-field pl-10" placeholder="Search by student or course..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Student', 'Course', 'Enrollment Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No enrollments found</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">
                  {e.student?.firstName} {e.student?.lastName}
                  <div className="text-xs text-gray-400">{e.student?.email}</div>
                </td>
                <td className="table-cell">
                  <div>{e.course?.title}</div>
                  <span className="badge bg-purple-100 text-purple-700 mt-1">{e.course?.code}</span>
                </td>
                <td className="table-cell text-gray-500">{e.enrollmentDate}</td>
                <td className="table-cell">
                  <span className={`badge ${statusColor(e.status)}`}>{e.status}</span>
                </td>
                <td className="table-cell">
                  <button onClick={() => setDeleteDialog({ open: true, id: e.id })}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enroll Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select className="input-field" value={form.studentId}
              onChange={e => setForm({...form, studentId: e.target.value})} required>
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="input-field" value={form.courseId}
              onChange={e => setForm({...form, courseId: e.target.value})} required>
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
            <input type="date" className="input-field" value={form.enrollmentDate}
              onChange={e => setForm({...form, enrollmentDate: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input-field" value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enrolling...' : 'Enroll'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete} title="Remove Enrollment"
        message="Remove this enrollment? Associated grades will also be deleted." />
    </div>
  )
}