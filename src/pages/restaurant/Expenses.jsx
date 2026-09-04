import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { money, todayInput } from '../../utils/format';
import { Icon, Modal, PageHeader, SearchInput } from '../../components/ui';

export default function Expenses() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    date: todayInput(),
    categoryId: '',
    description: '',
    amount: '',
    paymentMethod: 'Cash',
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [c, e] = await Promise.all([
      client.get('/expenses/categories'),
      client.get('/expenses'),
    ]);
    setCategories(c.data);
    setItems(e.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        x.voucherNumber?.toLowerCase().includes(q) ||
        x.categoryName?.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const save = async (e) => {
    e.preventDefault();
    await client.post('/expenses', form);
    setForm({ ...form, description: '', amount: '' });
    setOpen(false);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Expense vouchers"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} /> Add Expense
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Voucher</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x) => (
              <tr key={x._id}>
                <td className="font-medium">{x.voucherNumber}</td>
                <td>{new Date(x.date).toLocaleDateString()}</td>
                <td>{x.categoryName}</td>
                <td>{x.description}</td>
                <td>{money(x.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title="Expense Voucher"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button form="expense-form" className="btn btn-primary">Save</button>
            </>
          }
        >
          <form id="expense-form" onSubmit={save} className="grid sm:grid-cols-2 gap-3">
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input className="input" placeholder="Amount" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <select className="select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              {['Cash', 'UPI', 'Card', 'Bank', 'Other'].map((m) => <option key={m}>{m}</option>)}
            </select>
            <textarea className="textarea sm:col-span-2" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </form>
        </Modal>
      )}
    </div>
  );
}
