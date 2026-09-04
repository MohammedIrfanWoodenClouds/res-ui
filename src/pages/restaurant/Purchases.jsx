import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { money, todayInput } from '../../utils/format';
import { Icon, Modal, PageHeader, SearchInput, StatusBadge } from '../../components/ui';

const emptyLine = { name: '', quantity: '', unit: 'kg', rate: '' };

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', address: '' });
  const [form, setForm] = useState({
    supplierId: '',
    date: todayInput(),
    invoiceNumber: '',
    paymentStatus: 'Pending',
    notes: '',
  });
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [open, setOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [s, p] = await Promise.all([
      client.get('/purchases/suppliers'),
      client.get('/purchases'),
    ]);
    setSuppliers(s.data);
    setPurchases(p.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter(
      (p) =>
        p.supplierName?.toLowerCase().includes(q) ||
        p.invoiceNumber?.toLowerCase().includes(q)
    );
  }, [purchases, search]);

  const addSupplier = async (e) => {
    e.preventDefault();
    await client.post('/purchases/suppliers', supplierForm);
    setSupplierForm({ name: '', phone: '', address: '' });
    setSupplierOpen(false);
    await load();
  };

  const savePurchase = async (e) => {
    e.preventDefault();
    await client.post('/purchases', { ...form, items: lines });
    setLines([{ ...emptyLine }]);
    setForm({ ...form, invoiceNumber: '', notes: '' });
    setOpen(false);
    await load();
  };

  const total = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.rate || 0), 0);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Suppliers and raw material purchases"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setSupplierOpen(true)}>
              Add Supplier
            </button>
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              <Icon name="plus" size={16} /> Add Purchase
            </button>
          </>
        }
      />

      <div className="card p-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search purchases..." />
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td className="font-medium">{p.supplierName}</td>
                <td>{p.invoiceNumber || '-'}</td>
                <td>{money(p.total)}</td>
                <td>
                  <StatusBadge label={p.paymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {supplierOpen && (
        <Modal
          title="Add Supplier"
          onClose={() => setSupplierOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setSupplierOpen(false)}>Cancel</button>
              <button form="supplier-form" className="btn btn-primary">Save</button>
            </>
          }
        >
          <form id="supplier-form" onSubmit={addSupplier} className="grid gap-3">
            <input className="input" placeholder="Supplier name" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
            <input className="input" placeholder="Phone" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
            <input className="input" placeholder="Address" value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
          </form>
        </Modal>
      )}

      {open && (
        <Modal
          title="Add Purchase"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button form="purchase-form" className="btn btn-primary">Save</button>
            </>
          }
        >
          <form id="purchase-form" onSubmit={savePurchase} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <select className="select" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
                <option value="">Supplier</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input className="input" placeholder="Supplier invoice #" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
              <select className="select" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                {['Paid', 'Pending', 'Partial'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input className="input col-span-2" placeholder="Item" value={line.name} onChange={(e) => { const n = [...lines]; n[idx].name = e.target.value; setLines(n); }} required />
                <input className="input" placeholder="Qty" type="number" value={line.quantity} onChange={(e) => { const n = [...lines]; n[idx].quantity = e.target.value; setLines(n); }} required />
                <input className="input" placeholder="Rate" type="number" value={line.rate} onChange={(e) => { const n = [...lines]; n[idx].rate = e.target.value; setLines(n); }} required />
              </div>
            ))}
            <div className="flex justify-between items-center">
              <button type="button" className="text-sm text-[var(--rb-blue)] font-medium" onClick={() => setLines([...lines, { ...emptyLine }])}>+ Add line</button>
              <div className="font-bold">Total {money(total)}</div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
