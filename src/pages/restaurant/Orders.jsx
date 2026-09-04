import { useEffect, useState } from 'react';
import client from '../../api/client';
import { money } from '../../utils/format';
import { PageHeader, StatusBadge } from '../../components/ui';

const NEXT = {
  NEW: [
    { status: 'CONFIRMED', label: 'Confirm', className: 'btn btn-primary' },
    { status: 'CANCELLED', label: 'Cancel', className: 'btn btn-danger' },
  ],
  CONFIRMED: [
    { status: 'PREPARING', label: 'Start Preparing', className: 'btn btn-warning' },
    { status: 'CANCELLED', label: 'Cancel', className: 'btn btn-danger' },
  ],
  PREPARING: [
    { status: 'READY', label: 'Mark Ready', className: 'btn btn-success' },
    { status: 'CANCELLED', label: 'Cancel', className: 'btn btn-danger' },
  ],
  READY: [],
  COMPLETED: [],
  CANCELLED: [],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const r = await client.get('/orders');
    setOrders(r.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const open = async (id) => {
    const r = await client.get(`/orders/${id}`);
    setSelected(r.data);
  };

  const transition = async (id, status) => {
    const cancelReason =
      status === 'CANCELLED' ? window.prompt('Cancel reason (optional)') || '' : '';
    await client.put(`/orders/${id}/status`, { status, cancelReason });
    await load();
    if (selected?.order?._id === id) await open(id);
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Track and update order status" />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o._id}
                  className={`cursor-pointer hover:bg-slate-50 ${selected?.order?._id === o._id ? 'bg-blue-50' : ''}`}
                  onClick={() => open(o._id)}
                >
                  <td className="font-semibold">#{o.orderNumber}</td>
                  <td>{o.orderType === 'DINE_IN' ? `Table ${o.tableName}` : 'Takeaway'}</td>
                  <td>
                    <StatusBadge label={o.status} />
                  </td>
                  <td>{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          {!selected ? (
            <p className="text-slate-400">Select an order to view details</p>
          ) : (
            <>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-xl font-bold">Order #{selected.order.orderNumber}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selected.order.orderType}
                    {selected.order.tableName ? ` · Table ${selected.order.tableName}` : ''}
                  </p>
                </div>
                <StatusBadge label={selected.order.status} />
              </div>
              {(selected.order.customerName || selected.order.customerPhone) && (
                <p className="text-sm mt-3">
                  {selected.order.customerName} {selected.order.customerPhone}
                </p>
              )}
              {selected.order.notes && (
                <p className="text-sm mt-2 italic text-slate-500">{selected.order.notes}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm">
                {selected.items.map((i) => (
                  <li key={i._id} className="flex justify-between border-b border-[var(--rb-border)] py-2">
                    <span>
                      {i.name} × {i.quantity}
                    </span>
                    <span className="font-medium">{money(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right text-lg font-bold">{money(selected.order.total)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(NEXT[selected.order.status] || []).map((a) => (
                  <button
                    key={a.status}
                    className={a.className}
                    onClick={() => transition(selected.order._id, a.status)}
                  >
                    {a.label}
                  </button>
                ))}
                {selected.order.status === 'READY' && (
                  <p className="text-sm text-slate-500 w-full">Bill this order from Billing.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
