import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses'
import { getDepartments } from '../../api/departments'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const empty = { title: '', code: '', description: '', credits: '', departmentId: '' }

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [cRes, dRes] = await Promise.all([getCourses(), getDepartments()])
      setCourses(cRes.data?.content ?? cRes.data ?? [])
      setDepartments(dRes.data?.content ?? dRes.data ?? [])
    } catch { toast.error('Failed to load courses') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setModalOpen(true) }
  const openEdit = (c) => {
    setForm({
      title: c.title, code: c.code,
      description: c.description || '',
      credits: c.credits, departmentId: c.department?.id || ''
    })
    setEditId(c.id); setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) { await updateCourse(editId, form); toast.success('Course updated!') }
      else { await createCourse(form); toast.success('Course added!') }
      setModalOpen(false); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving course') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteDialog.id)
      toast.success('Course deleted!')
      setDeleteDialog({ open: false, id: null })
      fetchAll()
    } catch { toast.error('Failed to delete') }
  }

  const filtered = courses.filter(c =>
    `${c.title} ${c.code}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button onClick={openAdd} className="btn-primary gap-2">
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="input-field pl-10" placeholder="Search courses..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Title', 'Code', 'Credits', 'Department', 'Actions'].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No courses found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{c.title}</td>
                <td className="table-cell">
                  <span className="badge bg-purple-100 text-purple-700">{c.code}</span>
                </td>
                <td className="table-cell text-gray-500">{c.credits} credits</td>
                <td className="table-cell">
                  <span className="badge bg-blue-100 text-blue-700">{c.department?.name || '—'}</span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteDialog({ open: true, id: c.id })} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="input-field" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input className="input-field" value={form.code}
                onChange={e => setForm({...form, code: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input type="number" min="1" max="10" className="input-field" value={form.credits}
                onChange={e => setForm({...form, credits: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select className="input-field" value={form.departmentId}
              onChange={e => setForm({...form, departmentId: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete} title="Delete Course"
        message="Are you sure you want to delete this course?" />
    </div>
  )
}