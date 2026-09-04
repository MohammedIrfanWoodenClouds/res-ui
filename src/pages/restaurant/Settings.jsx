import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import client from '../../api/client';
import { mediaUrl } from '../../utils/format';
import { PageHeader } from '../../components/ui';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [logo, setLogo] = useState(null);
  const [tableName, setTableName] = useState('');
  const [qr, setQr] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [p, t] = await Promise.all([client.get('/menu/profile'), client.get('/menu/tables')]);
    setProfile(p.data);
    setForm({ name: p.data.name || '', phone: p.data.phone || '', address: p.data.address || '' });
    setTables(t.data);
    const publicUrl = `${import.meta.env.VITE_PUBLIC_URL || 'https://restopilot-zwoo.onrender.com'}/menu/${p.data.slug}`;
    setQr(await QRCode.toDataURL(publicUrl, { width: 220, margin: 1 }));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logo) fd.append('logo', logo);
    await client.put('/menu/profile', fd);
    setMsg('Profile saved');
    await load();
  };

  const addTable = async (e) => {
    e.preventDefault();
    await client.post('/menu/tables', { name: tableName });
    setTableName('');
    await load();
  };

  const removeTable = async (id) => {
    await client.delete(`/menu/tables/${id}`);
    await load();
  };

  const menuUrl = profile
    ? `${import.meta.env.VITE_PUBLIC_URL || 'https://restopilot-zwoo.onrender.com'}/menu/${profile.slug}`
    : '';

  return (
    <div>
      <PageHeader title="Settings" subtitle="Restaurant profile, tables, and QR menu" />
      {msg && <p className="text-sm mb-3 text-emerald-700">{msg}</p>}

      <form onSubmit={saveProfile} className="card p-5 grid md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-medium">Restaurant name</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Address</label>
          <input className="input mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          {profile?.logo && <img src={mediaUrl(profile.logo)} alt="" className="w-12 h-12 object-cover rounded-lg" />}
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </div>
        <button className="btn btn-primary justify-self-start">Save Profile</button>
      </form>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Tables</h3>
          <form onSubmit={addTable} className="flex gap-2 mb-4">
            <input className="input" placeholder="Table name / number" value={tableName} onChange={(e) => setTableName(e.target.value)} required />
            <button className="btn btn-primary">Add</button>
          </form>
          <ul className="space-y-2 text-sm">
            {tables.map((t) => (
              <li key={t._id} className="flex justify-between border-b border-[var(--rb-border)] py-2">
                <span className="font-medium">{t.name}</span>
                <button className="text-red-600 font-medium" onClick={() => removeTable(t._id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Public Menu QR</h3>
          <p className="text-sm text-slate-500 mb-3 break-all">{menuUrl}</p>
          {qr && <img src={qr} alt="QR code" className="border border-[var(--rb-border)] rounded-xl" />}
        </div>
      </div>
    </div>
  );
}
