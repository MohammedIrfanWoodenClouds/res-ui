import { useEffect, useState } from 'react';
import client from '../../api/client';
import { PageHeader, StatusBadge } from '../../components/ui';

export default function Kot() {
  const [kots, setKots] = useState([]);

  const load = async () => {
    const r = await client.get('/kots');
    setKots(r.data.filter((k) => k.status !== 'READY'));
  };

  useEffect(() => {
    load().catch(() => {});
    const t = setInterval(() => load().catch(() => {}), 8000);
    return () => clearInterval(t);
  }, []);

  const act = async (id, action) => {
    await client.put(`/kots/${id}/status`, { action });
    await load();
  };

  return (
    <div>
      <PageHeader title="KOT" subtitle="Kitchen order tickets" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kots.length === 0 && (
          <div className="card p-8 text-slate-400 col-span-full text-center">No active kitchen tickets</div>
        )}
        {kots.map((k) => (
          <div key={k._id} className="card p-5">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-bold text-xl">#{k.kotNumber}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {k.orderType === 'DINE_IN' ? `Table ${k.tableName}` : 'Takeaway'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(k.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <StatusBadge label={k.status} />
            </div>
            <ul className="mt-4 space-y-2 text-sm border-t border-[var(--rb-border)] pt-3">
              {k.items.map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{i.name}</span>
                  <span className="font-semibold">× {i.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              {k.status === 'CREATED' && (
                <button className="btn btn-warning flex-1" onClick={() => act(k._id, 'START')}>
                  Start Preparing
                </button>
              )}
              {['CREATED', 'PREPARING'].includes(k.status) && (
                <button className="btn btn-success flex-1" onClick={() => act(k._id, 'READY')}>
                  Mark Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
