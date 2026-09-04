import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { money, mediaUrl } from '../../utils/format';
import { Icon, Modal, PageHeader, SearchInput, StatusBadge } from '../../components/ui';

const emptyItem = {
  name: '',
  categoryId: '',
  description: '',
  price: '',
  taxPercent: '5',
  isAvailable: true,
};

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [catName, setCatName] = useState('');
  const [form, setForm] = useState(emptyItem);
  const [editId, setEditId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [c, i] = await Promise.all([
      client.get('/menu/categories'),
      client.get('/menu/items'),
    ]);
    setCategories(c.data);
    setItems(i.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter && String(item.categoryId) !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  const addCategory = async (e) => {
    e.preventDefault();
    await client.post('/menu/categories', { name: catName });
    setCatName('');
    await load();
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyItem);
    setPhoto(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || '',
      price: item.price,
      taxPercent: item.taxPercent,
      isAvailable: item.isAvailable,
    });
    setPhoto(null);
    setOpen(true);
  };

  const saveItem = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      if (editId) await client.put(`/menu/items/${editId}`, fd);
      else await client.post('/menu/items', fd);
      setOpen(false);
      setMsg(editId ? 'Item updated' : 'Item created');
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Deactivate this menu item?')) return;
    await client.delete(`/menu/items/${id}`);
    await load();
  };

  const catMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  return (
    <div>
      <PageHeader
        title="Menu Management"
        subtitle="Categories and menu items"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} /> Add Item
          </button>
        }
      />
      {msg && <p className="text-sm text-slate-600 mb-3">{msg}</p>}

      <form onSubmit={addCategory} className="card p-4 flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="input"
          placeholder="New category (e.g. Biriyani)"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          required
        />
        <button className="btn btn-secondary whitespace-nowrap">Add Category</button>
      </form>

      <div className="card p-4 mb-4 flex flex-col md:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        <select
          className="select max-w-xs"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img src={mediaUrl(item.image)} alt="" className="w-11 h-11 object-cover rounded-lg" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-100" />
                    )}
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td>{catMap[item.categoryId] || '-'}</td>
                <td>{money(item.price)}</td>
                <td>{item.taxPercent}%</td>
                <td>
                  <StatusBadge label={item.isAvailable ? 'Active' : 'Inactive'} />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="icon-btn icon-btn-edit" onClick={() => openEdit(item)}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button className="icon-btn icon-btn-delete" onClick={() => removeItem(item._id)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={editId ? 'Edit Item' : 'Add Item'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button form="item-form" className="btn btn-primary">
                Save
              </button>
            </>
          }
        >
          <form id="item-form" onSubmit={saveItem} className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select className="select mt-1" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <input className="input mt-1" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="textarea mt-1" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Tax %</label>
              <input className="input mt-1" type="number" min="0" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select className="select mt-1" value={form.isAvailable ? 'Available' : 'Unavailable'} onChange={(e) => setForm({ ...form, isAvailable: e.target.value === 'Available' })}>
                <option>Available</option>
                <option>Unavailable</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Photo</label>
              <input className="input mt-1" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
