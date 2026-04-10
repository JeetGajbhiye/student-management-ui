import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/students';
import { getDepartments } from '../../api/departments';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  gender: '', address: '', enrollmentDate: '', departmentId: ''
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([getStudents(), getDepartments()]);
      setStudents(sRes.data?.content ?? sRes.data ?? []);
      setDepartments(dRes.data?.content ?? dRes.data ?? []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (s) => {
    setForm({
      firstName: s.firstName, lastName: s.lastName, email: s.email,
      phone: s.phone || '', gender: s.gender || '', address: s.address || '',
      enrollmentDate: s.enrollmentDate || '', departmentId: s.department?.id || ''
    });
    setEditId(s.id); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await updateStudent(editId, form); toast.success('Student updated!'); }
      else { await createStudent(form); toast.success('Student added!'); }
      setModalOpen(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving student'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteDialog.id);
      toast.success('Student deleted!');
      setDeleteDialog({ open: false, id: null });
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input-field pl-10"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Phone', 'Department', 'Gender', 'Actions'].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No students found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{s.firstName} {s.lastName}</td>
                <td className="table-cell text-gray-500">{s.email}</td>
                <td className="table-cell text-gray-500">{s.phone || '—'}</td>
                <td className="table-cell">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {s.department?.name || '—'}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{s.gender || '—'}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteDialog({ open: true, id: s.id })} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input-field" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input-field" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select className="input-field" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
            <input type="date" className="input-field" value={form.enrollmentDate} onChange={e => setForm({...form, enrollmentDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="input-field" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
      />
    </div>
  );
}