import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import {
  Icon,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../components/ui';

const empty = {
  name: '',
  email: '',
  phone: '',
  address: '',
  slug: '',
  password: '',
  isActive: true,
};

export default function Restaurants() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);
  const [resetId, setResetId] = useState(null);
  const [resetForm, setResetForm] = useState({ email: '', password: '' });
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => setItems((await client.get('/super-admin/restaurants')).data);
  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.slug?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const openCreate = () => {
    setEdit(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (r) => {
    setEdit(r);
    setForm({
      name: r.name,
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      slug: r.slug || '',
      password: '',
      isActive: !!r.isActive,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (edit) {
        await client.put(`/super-admin/restaurants/${edit._id}`, form);
        if (!!edit.isActive !== !!form.isActive) {
          await client.patch(`/super-admin/restaurants/${edit._id}/toggle`);
        }
        setMsg('Restaurant updated');
      } else {
        await client.post('/super-admin/restaurants', form);
        setMsg('Restaurant created');
      }
      setOpen(false);
      setForm(empty);
      setEdit(null);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r) => {
    if (
      !window.confirm(
        `Delete "${r.name}" permanently?\n\nThis removes the restaurant login and all its data.`
      )
    )
      return;
    try {
      await client.delete(`/super-admin/restaurants/${r._id}`);
      setMsg(`Deleted ${r.name}`);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Delete failed');
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/super-admin/restaurants/${resetId}/reset-login`, resetForm);
      setMsg('Login reset successfully');
      setResetId(null);
      setResetForm({ email: '', password: '' });
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Restaurants"
        subtitle="Manage all restaurants"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} /> Add Restaurant
          </button>
        }
      />

      {msg && <div className="mb-4 text-sm text-slate-600">{msg}</div>}

      <div className="card p-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search restaurants..."
        />
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={r._id}>
                <td>{idx + 1}</td>
                <td className="font-semibold">{r.name}</td>
                <td className="text-slate-500">{r.slug}</td>
                <td>{r.email}</td>
                <td>
                  <StatusBadge active={r.isActive} />
                </td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="icon-btn icon-btn-edit" title="Edit" onClick={() => openEdit(r)}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-reset"
                      title="Reset login"
                      onClick={() => {
                        setResetId(r._id);
                        setResetForm({ email: r.email || '', password: '' });
                      }}
                    >
                      <Icon name="key" size={15} />
                    </button>
                    <button className="icon-btn icon-btn-delete" title="Delete" onClick={() => remove(r)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-slate-400 py-10">
                  No restaurants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={edit ? 'Edit Restaurant' : 'Add Restaurant'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button form="restaurant-form" className="btn btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="restaurant-form" onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Restaurant Name</label>
              <input
                className="input mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <input
                className="input mt-1"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto from name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email (Login)</label>
              <input
                className="input mt-1"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            {!edit && (
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  className="input mt-1"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                className="input mt-1"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="select mt-1"
                value={form.isActive ? 'Active' : 'Inactive'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'Active' })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <textarea
                className="textarea mt-1"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {resetId && (
        <Modal
          title="Reset Login"
          onClose={() => setResetId(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setResetId(null)}>
                Cancel
              </button>
              <button form="reset-form" className="btn btn-primary">
                Reset
              </button>
            </>
          }
        >
          <form id="reset-form" onSubmit={doReset} className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                className="input mt-1"
                value={resetForm.email}
                onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input
                className="input mt-1"
                type="password"
                value={resetForm.password}
                onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
