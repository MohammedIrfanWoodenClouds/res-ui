import { useEffect, useState } from 'react';
import client from '../../api/client';
import { money } from '../../utils/format';
import { PageHeader, StatusBadge } from '../../components/ui';

export default function Billing() {
  const [ready, setReady] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [method, setMethod] = useState('Cash');

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
    const r = await client.post(`/invoices/bill/${orderId}`, { paymentMethod: method });
    setPrintData(r.data);
    await load();
  };

  const openInvoice = async (id) => {
    const r = await client.get(`/invoices/${id}`);
    setPrintData(r.data);
  };

  return (
    <div>
      <PageHeader title="Billing" subtitle="Create invoices and print bills" />

      <div className="card p-5 mb-4">
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
            <div key={o._id} className="flex justify-between items-center border border-[var(--rb-border)] rounded-xl p-3">
              <div>
                <div className="font-semibold">#{o.orderNumber}</div>
                <div className="text-sm text-slate-500">
                  {o.orderType === 'DINE_IN' ? `Table ${o.tableName}` : 'Takeaway'} · {money(o.total)}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => bill(o._id)}>
                Create Invoice
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card table-wrap">
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
                    <button className="text-[var(--rb-blue)] text-sm font-medium" onClick={() => openInvoice(i._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {printData && (
          <div className="card p-6" id="invoice-print">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{printData.restaurant?.name}</h3>
                <p className="text-sm text-slate-500">{printData.restaurant?.address}</p>
                <p className="text-sm text-slate-500">{printData.restaurant?.phone}</p>
              </div>
              <div className="no-print flex gap-2">
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  Print
                </button>
                <button className="btn btn-primary" onClick={() => setPrintData(null)}>
                  New Bill
                </button>
              </div>
            </div>
            <div className="font-bold mb-1">INVOICE #{printData.invoice.invoiceNumber}</div>
            <div className="text-sm text-slate-500 mb-4">
              {new Date(printData.invoice.createdAt).toLocaleString()} · {printData.invoice.orderType}
              {printData.invoice.tableName ? ` · Table ${printData.invoice.tableName}` : ''}
            </div>
            <table className="table mb-4">
              <tbody>
                {printData.invoice.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.itemName}</td>
                    <td className="text-right">
                      {l.quantity} × {l.unitPrice}
                    </td>
                    <td className="text-right font-medium">{money(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(printData.invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{money(printData.invoice.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--rb-border)]">
                <span>TOTAL</span>
                <span>{money(printData.invoice.total)}</span>
              </div>
              <div className="pt-2">Payment: {printData.invoice.paymentMethod}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
