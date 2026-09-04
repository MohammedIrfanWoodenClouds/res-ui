import { useEffect, useState } from 'react';
import client from '../../api/client';
import { money } from '../../utils/format';
import { PageHeader, StatusBadge } from '../../components/ui';
import KotThermalSlip, { printKotSlip } from '../../components/KotThermalSlip';
import { useToast } from '../../components/Toast';

const NEXT = {
  NEW: [{ status: 'CANCELLED', label: 'Cancel', className: 'btn btn-danger' }],
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
  const { push } = useToast();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [printPayload, setPrintPayload] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await client.get('/orders');
    setOrders(r.data);
  };

  useEffect(() => {
    load().catch(() => {});
    client
      .get('/menu/profile')
      .then((r) => setRestaurant(r.data))
      .catch(() => {});
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

  const runThermalPrint = async (bundle) => {
    setPrintPayload({
      order: bundle.order,
      items: bundle.items,
      kot: bundle.kot,
    });
    await printKotSlip();
  };

  const sendKot = async (orderId) => {
    setBusy(true);
    try {
      let bundle = selected?.order?._id === orderId ? selected : null;
      if (!bundle || bundle.order.status === 'NEW') {
        const r = await client.put(`/orders/${orderId}/status`, { status: 'CONFIRMED' });
        bundle = r.data;
      } else if (!bundle.kot && bundle.order.kotId) {
        const r = await client.get(`/orders/${orderId}`);
        bundle = r.data;
      }
      await load();
      setSelected(bundle);
      await runThermalPrint(bundle);
      push(`KOT #${bundle.kot?.kotNumber || '—'} sent to kitchen`, {
        title: 'KOT sent',
        type: 'success',
      });
    } catch (e) {
      push(e.response?.data?.message || 'Failed to send KOT', {
        title: 'KOT failed',
        type: 'warning',
      });
    } finally {
      setBusy(false);
    }
  };

  const reprintKot = async () => {
    if (!selected?.order) return;
    setBusy(true);
    try {
      let bundle = selected;
      if (!bundle.kot) {
        const r = await client.get(`/orders/${selected.order._id}`);
        bundle = r.data;
        setSelected(bundle);
      }
      if (!bundle.kot) {
        push('No KOT for this order yet. Use Send KOT first.', { type: 'warning' });
        return;
      }
      await runThermalPrint(bundle);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Confirm orders, send KOT, and track kitchen status" />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total</th>
                <th className="no-print" />
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
                  <td className="no-print" onClick={(e) => e.stopPropagation()}>
                    {o.status === 'NEW' && (
                      <button
                        className="btn btn-primary text-xs py-1 px-2"
                        disabled={busy}
                        onClick={() => sendKot(o._id)}
                      >
                        Send KOT
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5 no-print">
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
                    {selected.kot ? ` · KOT #${selected.kot.kotNumber}` : ''}
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
                {selected.order.status === 'NEW' && (
                  <button
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => sendKot(selected.order._id)}
                  >
                    {busy ? 'Sending…' : 'Send KOT'}
                  </button>
                )}
                {selected.kot && (
                  <button className="btn btn-secondary" disabled={busy} onClick={reprintKot}>
                    Print KOT
                  </button>
                )}
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

      {printPayload && (
        <KotThermalSlip
          restaurant={restaurant}
          order={printPayload.order}
          items={printPayload.items}
          kot={printPayload.kot}
        />
      )}
    </div>
  );
}
