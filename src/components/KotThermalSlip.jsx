import { money } from '../utils/format';

/**
 * Thermal KOT slip (80mm). Call printKot() after mount/update.
 */
export default function KotThermalSlip({ restaurant, order, items, kot, visible = false }) {
  if (!order) return null;

  const kotNo = kot?.kotNumber || '—';
  const lines = kot?.items?.length
    ? kot.items
    : (items || []).map((i) => ({ name: i.name, quantity: i.quantity }));

  return (
    <div
      id="kot-print"
      className={visible ? 'kot-thermal' : 'kot-thermal kot-thermal-hidden'}
      aria-hidden={!visible}
    >
      <div className="kot-thermal-inner">
        <div className="kot-center kot-bold kot-lg">{restaurant?.name || 'Kitchen'}</div>
        <div className="kot-center kot-muted">KITCHEN ORDER TICKET</div>
        <div className="kot-sep" />
        <div className="kot-row">
          <span>KOT #</span>
          <span className="kot-bold">{kotNo}</span>
        </div>
        <div className="kot-row">
          <span>Order #</span>
          <span className="kot-bold">{order.orderNumber}</span>
        </div>
        <div className="kot-row">
          <span>Type</span>
          <span>{order.orderType === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY'}</span>
        </div>
        {order.orderType === 'DINE_IN' && (
          <div className="kot-row">
            <span>Table</span>
            <span className="kot-bold kot-lg">{order.tableName || '-'}</span>
          </div>
        )}
        <div className="kot-row">
          <span>Time</span>
          <span>
            {new Date(kot?.createdAt || order.updatedAt || order.createdAt).toLocaleString()}
          </span>
        </div>
        {(order.customerName || order.customerPhone) && (
          <div className="kot-row">
            <span>Customer</span>
            <span>
              {order.customerName} {order.customerPhone}
            </span>
          </div>
        )}
        <div className="kot-sep" />
        <div className="kot-bold" style={{ marginBottom: 6 }}>
          ITEMS
        </div>
        {lines.map((line, idx) => (
          <div key={idx} className="kot-item">
            <span className="kot-bold">
              {line.quantity} × {line.name}
            </span>
          </div>
        ))}
        {order.notes && (
          <>
            <div className="kot-sep" />
            <div className="kot-bold">NOTES</div>
            <div>{order.notes}</div>
          </>
        )}
        <div className="kot-sep" />
        <div className="kot-center kot-muted">*** END OF KOT ***</div>
        <div className="kot-center kot-muted" style={{ marginTop: 4, fontSize: 10 }}>
          {money(order.total)} · do not show to guest
        </div>
      </div>
    </div>
  );
}

export function printKotSlip() {
  // Allow layout paint then print
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        resolve();
      }, 150);
    });
  });
}
