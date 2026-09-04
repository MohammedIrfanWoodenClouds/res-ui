import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { money, mediaUrl } from '../../utils/format';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default function PublicMenu() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/public/menu/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Menu not found'));
  }, [slug]);

  const itemsByCategory = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.categories
      .map((cat) => ({
        ...cat,
        items: data.items.filter(
          (i) =>
            String(i.categoryId) === String(cat._id) &&
            (!q || i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
        ),
      }))
      .filter((c) => c.items.length);
  }, [data, search]);

  const visibleCategories = useMemo(() => {
    if (activeCat === 'all') return itemsByCategory;
    return itemsByCategory.filter((c) => c._id === activeCat);
  }, [itemsByCategory, activeCat]);

  const cartLines = useMemo(() => {
    if (!data) return [];
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = data.items.find((i) => i._id === id);
        if (!item || qty < 1) return null;
        const lineSubtotal = item.price * qty;
        const lineTax = lineSubtotal * (item.taxPercent / 100);
        return { item, qty, lineSubtotal, lineTax, lineTotal: lineSubtotal + lineTax };
      })
      .filter(Boolean);
  }, [cart, data]);

  const subtotal = cartLines.reduce((s, l) => s + l.lineSubtotal, 0);
  const tax = cartLines.reduce((s, l) => s + l.lineTax, 0);
  const total = subtotal + tax;
  const count = cartLines.reduce((s, l) => s + l.qty, 0);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) - 1) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const placeOrder = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await api.post(`/public/orders/${slug}`, {
        orderType,
        tableId: orderType === 'DINE_IN' ? tableId : undefined,
        customerName,
        customerPhone,
        notes,
        items: cartLines.map((l) => ({ menuItemId: l.item._id, quantity: l.qty })),
      });
      setPlaced(r.data);
      setCart({});
      setShowCart(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not place order');
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) {
    return <div className="min-h-screen grid place-items-center p-6 text-slate-600">{error}</div>;
  }
  if (!data) return <div className="min-h-screen grid place-items-center">Loading menu…</div>;

  if (placed) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-[var(--rb-bg)]">
        <div className="card p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold">Order Placed</h2>
          <p className="mt-2 text-slate-500">Order #{placed.order.orderNumber}</p>
          <p className="mt-4 font-semibold text-lg">{money(placed.order.total)}</p>
          <button className="btn btn-primary mt-6 w-full" onClick={() => setPlaced(null)}>
            Order more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--rb-bg)] pb-28">
      <header className="bg-white border-b border-[var(--rb-border)] p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {data.restaurant.logo && (
            <img src={mediaUrl(data.restaurant.logo)} alt="" className="w-12 h-12 rounded-xl object-cover" />
          )}
          <div>
            <h1 className="text-xl font-bold">{data.restaurant.name}</h1>
            <p className="text-sm text-slate-500">{data.restaurant.address}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-3">
          <input
            className="input"
            placeholder="Search menu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-w-3xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            className={`btn whitespace-nowrap ${activeCat === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveCat('all')}
          >
            All
          </button>
          {data.categories.map((c) => (
            <button
              key={c._id}
              className={`btn whitespace-nowrap ${activeCat === c._id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveCat(c._id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {visibleCategories.map((cat) => (
          <section key={cat._id}>
            <h2 className="font-bold text-lg mb-3">{cat.name}</h2>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <div key={item._id} className="card p-3 flex gap-3">
                  {item.image ? (
                    <img src={mediaUrl(item.image)} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-slate-500 line-clamp-2">{item.description}</div>
                    <div className="mt-1 font-bold text-[var(--rb-blue)]">{money(item.price)}</div>
                  </div>
                  <button className="btn btn-primary self-center" onClick={() => add(item._id)}>
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {count > 0 && !showCart && (
        <div className="fixed bottom-4 inset-x-0 px-4 z-20">
          <button
            className="btn btn-primary w-full max-w-3xl mx-auto py-3 shadow-lg flex justify-between"
            onClick={() => setShowCart(true)}
          >
            <span>View Cart ({count})</span>
            <span>{money(total)}</span>
          </button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Your Cart</h3>
              <button className="text-slate-400" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm mb-4">
              {cartLines.map((l) => (
                <div key={l.item._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{l.item.name}</div>
                    <div className="text-slate-500">{money(l.lineTotal)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="icon-btn icon-btn-toggle" onClick={() => dec(l.item._id)}>-</button>
                    <span className="w-6 text-center font-semibold">{l.qty}</span>
                    <button className="icon-btn icon-btn-edit" onClick={() => add(l.item._id)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn ${orderType === 'DINE_IN' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setOrderType('DINE_IN')}
                >
                  Dine In
                </button>
                <button
                  type="button"
                  className={`btn ${orderType === 'TAKEAWAY' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setOrderType('TAKEAWAY')}
                >
                  Takeaway
                </button>
              </div>
              {orderType === 'DINE_IN' && (
                <select className="select" value={tableId} onChange={(e) => setTableId(e.target.value)} required>
                  <option value="">Select table</option>
                  {data.tables.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
              <input className="input" placeholder="Your name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <input className="input" placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <input className="input" placeholder="Special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="text-sm space-y-1 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{money(tax)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{money(total)}</span></div>
            </div>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              disabled={busy || (orderType === 'DINE_IN' && !tableId)}
              className="btn btn-primary w-full py-3"
              onClick={placeOrder}
            >
              {busy ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
