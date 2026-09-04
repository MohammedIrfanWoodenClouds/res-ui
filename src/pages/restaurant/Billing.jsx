import { useEffect, useState } from 'react';
import client from '../../api/client';
import { money } from '../../utils/format';
import { PageHeader, StatusBadge } from '../../components/ui';
import InvoiceThermalSlip, { printInvoiceSlip } from '../../components/InvoiceThermalSlip';
import { useToast } from '../../components/Toast';

export default function Billing() {
  const { push } = useToast();
  const [ready, setReady] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [method, setMethod] = useState('Cash');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [orders, inv] = await Promise.all([
      client.get('/orders?status=READY'),
      client.get('/invoices'),
    ]);
    setReady(orders.data);
    setInvoices(inv.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const bill = async (orderId) => {
    setBusy(true);
    try {
      const r = await client.post(`/invoices/bill/${orderId}`, { paymentMethod: method });
      setPrintData(r.data);
      await load();
      await printInvoiceSlip();
      push(`Invoice ${r.data.invoice.invoiceNumber} · ${money(r.data.invoice.total)}`, {
        title: 'Bill printed',
        type: 'success',
      });
    } catch (e) {
      push(e.response?.data?.message || 'Billing failed', {
        title: 'Error',
        type: 'warning',
      });
    } finally {
      setBusy(false);
    }
  };

  const openInvoice = async (id) => {
    const r = await client.get(`/invoices/${id}`);
    setPrintData(r.data);
  };

  const reprint = async () => {
    if (!printData) return;
    await printInvoiceSlip();
  };

  return (
    <div>
      <PageHeader title="Billing" subtitle="Create thermal invoices and print bills" />

      <div className="card p-5 mb-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold">Ready to bill</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Payment</label>
            <select className="select w-auto" value={method} onChange={(e) => setMethod(e.target.value)}>
              {['Cash', 'UPI', 'Card', 'Other'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        {ready.length === 0 && <p className="text-slate-400 text-sm">No READY orders</p>}
        <div className="space-y-2">
          {ready.map((o) => (
            <div
              key={o._id}
              className="flex justify-between items-center border border-[var(--rb-border)] rounded-xl p-3"
            >
              <div>
                <div className="font-semibold">#{o.orderNumber}</div>
                <div className="text-sm text-slate-500">
                  {o.orderType === 'DINE_IN' ? `Table ${o.tableName}` : 'Takeaway'} · {money(o.total)}
                </div>
              </div>
              <button className="btn btn-primary" disabled={busy} onClick={() => bill(o._id)}>
                {busy ? 'Printing…' : 'Bill & Print'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card table-wrap no-print">
          <div className="px-4 py-3 border-b border-[var(--rb-border)] font-semibold">Recent Invoices</div>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i._id}>
                  <td className="font-medium">{i.invoiceNumber}</td>
                  <td>
                    <StatusBadge label={i.orderType} />
                  </td>
                  <td>{money(i.total)}</td>
                  <td>{i.paymentMethod}</td>
                  <td>
                    <button
                      className="text-[var(--rb-blue)] text-sm font-medium"
                      onClick={() => openInvoice(i._id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {printData && (
          <div className="card p-4">
            <div className="no-print flex justify-between items-center mb-3">
              <h3 className="font-semibold">Thermal invoice preview</h3>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={reprint}>
                  Print
                </button>
                <button className="btn btn-primary" onClick={() => setPrintData(null)}>
                  New Bill
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-slate-100 rounded-xl p-4 no-print-bg">
              <InvoiceThermalSlip
                restaurant={printData.restaurant}
                invoice={printData.invoice}
                payment={printData.payment}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
