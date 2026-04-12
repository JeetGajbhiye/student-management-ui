import { useState, useEffect } from 'react'
import { Plus, Pencil, Search } from 'lucide-react'
import { getGrades, createGrade, updateGrade } from '../../api/grades'
import { getEnrollments } from '../../api/enrollments'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const empty = { enrollmentId: '', marksObtained: '', maxMarks: '100', gradeLetter: '', remarks: '', examDate: '' }

const getLetterGrade = (marks, max) => {
  const pct = (marks / max) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  return 'F'
}

export default function GradesPage() {
  const [grades, setGrades] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [gRes, eRes] = await Promise.all([getGrades(), getEnrollments()])
      const gRaw = gRes.data?.data ?? gRes.data
      const eRaw = eRes.data?.data ?? eRes.data
      setGrades(Array.isArray(gRaw) ? gRaw : gRaw?.content ?? [])
      setEnrollments(Array.isArray(eRaw) ? eRaw : eRaw?.content ?? [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load grades')
    }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setModalOpen(true) }
  const openEdit = (g) => {
    setForm({
      enrollmentId: g.enrollment?.id || g.enrollmentId,
      marksObtained: g.marksObtained,
      maxMarks: g.maxMarks,
      gradeLetter: g.gradeLetter || '',
      remarks: g.remarks || '',
      examDate: g.examDate || ''
    })
    setEditId(g.id); setModalOpen(true)
  }

  const handleMarksChange = (field, value) => {
    const updated = { ...form, [field]: value }
    if (updated.marksObtained && updated.maxMarks) {
      updated.gradeLetter = getLetterGrade(+updated.marksObtained, +updated.maxMarks)
    }
    setForm(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) { await updateGrade(editId, form); toast.success('Grade updated!') }
      else { await createGrade(form); toast.success('Grade added!') }
      setModalOpen(false); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving grade') }
    finally { setSaving(false) }
  }

  const gradeColor = (letter) => ({
    'A+': 'bg-green-100 text-green-800', 'A': 'bg-green-100 text-green-700',
    'B+': 'bg-blue-100 text-blue-700',  'B': 'bg-blue-100 text-blue-600',
    'C': 'bg-yellow-100 text-yellow-700', 'F': 'bg-red-100 text-red-700',
  }[letter] || 'bg-gray-100 text-gray-700')

  const filtered = grades.filter(g =>
    `${g.enrollment?.student?.firstName} ${g.enrollment?.student?.lastName} ${g.enrollment?.course?.title}`
      .toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <button onClick={openAdd} className="btn-primary gap-2">
          <Plus size={18} /> Add Grade
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
              {['Student', 'Course', 'Marks', 'Grade', 'Exam Date', 'Remarks', 'Actions'].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No grades found</td></tr>
            ) : filtered.map(g => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">
                  {g.enrollment?.student?.firstName} {g.enrollment?.student?.lastName}
                </td>
                <td className="table-cell text-gray-500">{g.enrollment?.course?.title}</td>
                <td className="table-cell">
                  <span className="font-medium">{g.marksObtained}</span>
                  <span className="text-gray-400">/{g.maxMarks}</span>
                  <div className="text-xs text-gray-400">
                    {Math.round((g.marksObtained / g.maxMarks) * 100)}%
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge text-sm font-bold ${gradeColor(g.gradeLetter)}`}>
                    {g.gradeLetter}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{g.examDate || '—'}</td>
                <td className="table-cell text-gray-500 max-w-32 truncate">{g.remarks || '—'}</td>
                <td className="table-cell">
                  <button onClick={() => openEdit(g)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Grade' : 'Add Grade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment</label>
            <select className="input-field" value={form.enrollmentId}
              onChange={e => setForm({...form, enrollmentId: e.target.value})} required disabled={!!editId}>
              <option value="">Select Enrollment</option>
              {enrollments.map(e => (
                <option key={e.id} value={e.id}>
                  {e.student?.firstName} {e.student?.lastName} — {e.course?.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.marksObtained}
                onChange={e => handleMarksChange('marksObtained', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
              <input type="number" step="0.01" min="1" className="input-field" value={form.maxMarks}
                onChange={e => handleMarksChange('maxMarks', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Letter (auto)</label>
              <input className="input-field bg-gray-50" value={form.gradeLetter} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
              <input type="date" className="input-field" value={form.examDate}
                onChange={e => setForm({...form, examDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input className="input-field" placeholder="e.g. Excellent, Good..." value={form.remarks}
              onChange={e => setForm({...form, remarks: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}