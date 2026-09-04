import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { PageHeader, StatusBadge } from '../../components/ui';

export default function SuperAdminDashboard() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    client.get('/super-admin/restaurants').then((r) => setItems(r.data)).catch(() => {});
  }, []);
  const active = items.filter((x) => x.isActive).length;
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Super admin overview" />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          ['Total Restaurants', items.length],
          ['Active', active],
          ['Inactive', items.length - active],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <div className="text-sm text-[var(--rb-muted)]">{label}</div>
            <div className="text-3xl font-bold mt-2">{value}</div>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Recent Restaurants</h3>
          <Link to="/super-admin/restaurants" className="text-sm text-[var(--rb-blue)] font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {items.slice(0, 5).map((r) => (
            <div key={r._id} className="flex justify-between items-center border-b border-[var(--rb-border)] pb-3">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-slate-500">{r.email}</div>
              </div>
              <StatusBadge active={r.isActive} />
            </div>
          ))}
          {items.length === 0 && <p className="text-slate-400 text-sm">No restaurants yet</p>}
        </div>
      </div>
    </div>
  );
}
