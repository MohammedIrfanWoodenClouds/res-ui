import { money } from '../utils/format';

export default function InvoiceThermalSlip({ restaurant, invoice, payment }) {
  if (!invoice) return null;

  return (
    <div id="invoice-print" className="kot-thermal">
      <div className="kot-thermal-inner">
        <div className="kot-center kot-bold kot-lg">{restaurant?.name || 'Restaurant'}</div>
        {restaurant?.address && <div className="kot-center kot-muted">{restaurant.address}</div>}
        {restaurant?.phone && <div className="kot-center kot-muted">Ph: {restaurant.phone}</div>}
        <div className="kot-center kot-muted" style={{ marginTop: 4 }}>
          TAX INVOICE
        </div>
        <div className="kot-sep" />

        <div className="kot-row">
          <span>Invoice</span>
          <span className="kot-bold">{invoice.invoiceNumber}</span>
        </div>
        <div className="kot-row">
          <span>Date</span>
          <span>{new Date(invoice.createdAt).toLocaleString()}</span>
        </div>
        <div className="kot-row">
          <span>Type</span>
          <span>{invoice.orderType === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY'}</span>
        </div>
        {invoice.orderType === 'DINE_IN' && invoice.tableName && (
          <div className="kot-row">
            <span>Table</span>
            <span className="kot-bold">{invoice.tableName}</span>
          </div>
        )}
        {(invoice.customerName || invoice.customerPhone) && (
          <div className="kot-row">
            <span>Customer</span>
            <span>
              {invoice.customerName} {invoice.customerPhone}
            </span>
          </div>
        )}

        <div className="kot-sep" />
        <div className="kot-bold" style={{ marginBottom: 4 }}>
          ITEMS
        </div>
        {(invoice.lines || []).map((l, idx) => (
          <div key={idx} style={{ marginBottom: 6 }}>
            <div className="kot-bold">{l.itemName}</div>
            <div className="kot-row">
              <span>
                {l.quantity} x {Number(l.unitPrice).toFixed(2)}
                {l.taxPercent ? ` (T${l.taxPercent}%)` : ''}
              </span>
              <span className="kot-bold">{Number(l.lineTotal).toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="kot-sep" />
        <div className="kot-row">
          <span>Subtotal</span>
          <span>{money(invoice.subtotal)}</span>
        </div>
        <div className="kot-row">
          <span>Tax</span>
          <span>{money(invoice.taxTotal)}</span>
        </div>
        <div className="kot-sep" />
        <div className="kot-row kot-bold kot-lg">
          <span>TOTAL</span>
          <span>{money(invoice.total)}</span>
        </div>
        <div className="kot-row" style={{ marginTop: 4 }}>
          <span>Payment</span>
          <span className="kot-bold">
            {invoice.paymentMethod || payment?.method || '—'}
          </span>
        </div>

        <div className="kot-sep" />
        <div className="kot-center kot-muted">Thank you! Visit again</div>
        <div className="kot-center kot-muted">*** END OF BILL ***</div>
      </div>
    </div>
  );
}

export function printInvoiceSlip() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        resolve();
      }, 150);
    });
  });
}
