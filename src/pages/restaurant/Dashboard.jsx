import { useEffect, useState } from 'react';
import client from '../../api/client';
import { money } from '../../utils/format';
import { PageHeader, StatusBadge } from '../../components/ui';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    client.get('/reports/dashboard').then((r) => setData(r.data)).catch(() => {});
  }, []);
  const m = data?.metrics || {};
  const chart = data?.salesChart || [];
  const max = Math.max(1, ...chart.map((c) => c.total));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Today's overview for your restaurant" />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Sales", money(m.sales), 'bg-blue-50 text-blue-700'],
          ['Total Orders', m.orders || 0, 'bg-indigo-50 text-indigo-700'],
          ['Pending KOT', m.pendingKot || 0, 'bg-amber-50 text-amber-700'],
          ['Expenses', money(m.expenses), 'bg-rose-50 text-rose-700'],
        ].map(([label, value, tone]) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex text-xs font-semibold px-2 py-1 rounded-full ${tone}`}>
              {label}
            </div>
            <div className="text-3xl font-bold mt-3">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Sales Trend</h3>
          {chart.length === 0 ? (
            <div className="h-48 grid place-items-center text-slate-400 text-sm">No sales yet today</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {chart.map((c) => (
                <div key={c.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t-md bg-[var(--rb-blue)]"
                    style={{ height: `${Math.max(8, (c.total / max) * 100)}%` }}
                    title={money(c.total)}
                  />
                  <span className="text-[10px] text-slate-500">{c.hour}h</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-sm text-slate-500">
            Net Profit today: <b className="text-slate-800">{money(m.netProfit)}</b>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders || []).map((o) => (
                  <tr key={o._id}>
                    <td className="font-medium">#{o.orderNumber}</td>
                    <td>{o.orderType === 'DINE_IN' ? `Table ${o.tableName}` : 'Takeaway'}</td>
                    <td>{money(o.total)}</td>
                    <td>
                      <StatusBadge label={o.status} />
                    </td>
                  </tr>
                ))}
                {(data?.recentOrders || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-400 py-8">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
