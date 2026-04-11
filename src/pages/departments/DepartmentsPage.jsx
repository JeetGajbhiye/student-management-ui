import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const empty = { name: '', code: '', description: '' }

export default function DepartmentsPage() {
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
      const [sRes, dRes] = await Promise.all([getStudents(), getDepartments()])
      // unwrap the "data" wrapper
      const sData = sRes.data?.data ?? sRes.data
      const dData = dRes.data?.data ?? dRes.data
      setStudents(sData?.content ?? (Array.isArray(sData) ? sData : []))
      setDepartments(dData?.content ?? (Array.isArray(dData) ? dData : []))
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setModalOpen(true) }
  const openEdit = (d) => {
    setForm({ name: d.name, code: d.code, description: d.description || '' })
    setEditId(d.id); setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) { await updateDepartment(editId, form); toast.success('Department updated!') }
      else { await createDepartment(form); toast.success('Department added!') }
      setModalOpen(false); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving department') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteDepartment(deleteDialog.id)
      toast.success('Department deleted!')
      setDeleteDialog({ open: false, id: null })
      fetchAll()
    } catch { toast.error('Cannot delete — has linked students or courses') }
  }

  const filtered = departments.filter(d =>
    `${d.name} ${d.code}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button onClick={openAdd} className="btn-primary gap-2">
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="input-field pl-10" placeholder="Search departments..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-8">No departments found</p>
        ) : filtered.map(d => (
          <div key={d.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{d.name}</h3>
                <span className="badge bg-green-100 text-green-700 mt-1">{d.code}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteDialog({ open: true, id: d.id })} className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {d.description && <p className="text-sm text-gray-500 line-clamp-2">{d.description}</p>}
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input-field" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input className="input-field" placeholder="e.g. CS, MATH" value={form.code}
              onChange={e => setForm({...form, code: e.target.value})} required />
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
        onConfirm={handleDelete} title="Delete Department"
        message="Delete this department? Students and courses linked to it will be unlinked." />
    </div>
  )
}