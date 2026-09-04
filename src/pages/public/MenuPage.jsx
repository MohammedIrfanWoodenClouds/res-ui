import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { money, mediaUrl } from '../../utils/format';
import { useToast } from '../../components/Toast';
import { StatusBadge } from '../../components/ui';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://res-api.13.232.129.80.nip.io/api',
});

const STEPS = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

function statusIndex(status) {
  if (status === 'CANCELLED') return -1;
  return STEPS.indexOf(status);
}

function inclPrice(price, taxPercent) {
  return Number(price) + (Number(price) * Number(taxPercent || 0)) / 100;
}

function loadTracked(slug) {
  try {
    const raw = localStorage.getItem(`qr-track:${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTracked(slug, payload) {
  localStorage.setItem(`qr-track:${slug}`, JSON.stringify(payload));
}

export default function PublicMenu() {
  const { slug } = useParams();
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [cartStep, setCartStep] = useState('cart'); // cart | review
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [placed, setPlaced] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [showTrack, setShowTrack] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/public/menu/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Menu not found'));
  }, [slug]);

  useEffect(() => {
    const saved = loadTracked(slug);
    if (saved?.orderNumber) setTrackInput(saved.orderNumber);
  }, [slug]);

  useEffect(() => {
    if (!tracking?.order?.orderNumber) return undefined;
    if (['COMPLETED', 'CANCELLED'].includes(tracking.order.status)) return undefined;

    const poll = async () => {
      try {
        const r = await api.get(`/public/orders/${slug}/${tracking.order.orderNumber}`);
        setTracking(r.data);
      } catch {
        // ignore
      }
    };
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [slug, tracking?.order?.orderNumber, tracking?.order?.status]);

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

  const selectedTableName =
    data?.tables?.find((t) => String(t._id) === String(tableId))?.name || '';

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) - 1) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const openCart = () => {
    setCartStep('cart');
    setShowCart(true);
  };

  const goReview = () => {
    if (orderType === 'DINE_IN' && !tableId) {
      setError('Please select a table');
      return;
    }
    setError('');
    setCartStep('review');
  };

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
      setTracking(r.data);
      saveTracked(slug, {
        orderNumber: r.data.order.orderNumber,
        orderId: r.data.order._id,
      });
      setCart({});
      setShowCart(false);
      setCartStep('cart');
      push(`Order #${r.data.order.orderNumber} · ${money(r.data.order.total)}`, {
        title: 'Order placed successfully',
        type: 'success',
        duration: 5000,
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not place order');
      push(e.response?.data?.message || 'Could not place order', {
        title: 'Order failed',
        type: 'warning',
        duration: 5000,
      });
    } finally {
      setBusy(false);
    }
  };

  const trackOrder = async (orderNumber) => {
    const num = String(orderNumber || trackInput).trim().replace(/^#/, '');
    if (!num) {
      setError('Enter your order number');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await api.get(`/public/orders/${slug}/${num}`, {
        params: customerPhone ? { phone: customerPhone } : undefined,
      });
      setTracking(r.data);
      setPlaced(null);
      setShowTrack(true);
      saveTracked(slug, { orderNumber: r.data.order.orderNumber, orderId: r.data.order._id });
    } catch (e) {
      setError(e.response?.data?.message || 'Order not found');
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) {
    return <div className="min-h-screen grid place-items-center p-6 text-slate-600">{error}</div>;
  }
  if (!data) return <div className="min-h-screen grid place-items-center">Loading menu…</div>;

  if (showTrack && tracking) {
    const idx = statusIndex(tracking.order.status);
    return (
      <div className="min-h-screen bg-[var(--rb-bg)] p-4">
        <div className="max-w-md mx-auto card p-5">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold">Track Order</h2>
              <p className="text-sm text-slate-500">{tracking.restaurant?.name}</p>
            </div>
            <StatusBadge label={tracking.order.status} />
          </div>
          <div className="text-sm space-y-1 mb-4">
            <div className="flex justify-between">
              <span>Order</span>
              <span className="font-semibold">#{tracking.order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span>
                {tracking.order.orderType === 'DINE_IN'
                  ? `Table ${tracking.order.tableName}`
                  : 'Takeaway'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">{money(tracking.order.total)}</span>
            </div>
          </div>

          {tracking.order.status === 'CANCELLED' ? (
            <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm mb-4">
              This order was cancelled.
              {tracking.order.cancelReason ? ` Reason: ${tracking.order.cancelReason}` : ''}
            </div>
          ) : (
            <ol className="space-y-3 mb-5">
              {STEPS.map((step, i) => {
                const done = idx >= i;
                const current = idx === i;
                return (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold ${
                        done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      } ${current ? 'ring-2 ring-emerald-300' : ''}`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <div>
                      <div className={`font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step === 'NEW'
                          ? 'Order received'
                          : step === 'CONFIRMED'
                            ? 'Confirmed'
                            : step === 'PREPARING'
                              ? 'Preparing'
                              : step === 'READY'
                                ? 'Ready'
                                : 'Completed'}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="border-t border-[var(--rb-border)] pt-3 mb-4 space-y-2 text-sm">
            {(tracking.items || []).map((i) => (
              <div key={i._id} className="flex justify-between">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>{money(i.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowTrack(false);
                setPlaced(null);
              }}
            >
              Back to menu
            </button>
            <button className="btn btn-secondary" onClick={() => trackOrder(tracking.order.orderNumber)}>
              Refresh status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-[var(--rb-bg)]">
        <div className="card p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold">Order Placed</h2>
          <p className="mt-2 text-slate-500">Order #{placed.order.orderNumber}</p>
          <p className="mt-4 font-semibold text-lg">{money(placed.order.total)}</p>
          <button
            className="btn btn-primary mt-6 w-full"
            onClick={() => {
              setTracking(placed);
              setShowTrack(true);
            }}
          >
            Track Order
          </button>
          <button className="btn btn-secondary mt-2 w-full" onClick={() => setPlaced(null)}>
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
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{data.restaurant.name}</h1>
            <p className="text-sm text-slate-500">{data.restaurant.address}</p>
          </div>
          <button
            className="btn btn-secondary text-xs whitespace-nowrap"
            onClick={() => {
              const saved = loadTracked(slug);
              if (saved?.orderNumber) {
                trackOrder(saved.orderNumber);
              } else {
                setTracking(null);
                setShowTrack(true);
              }
            }}
          >
            Track order
          </button>
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
              {cat.items.map((item) => {
                const withGst = inclPrice(item.price, item.taxPercent);
                return (
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
                      <div className="text-xs text-slate-500 mt-0.5">
                        GST {Number(item.taxPercent || 0)}%
                        {Number(item.taxPercent) > 0 ? ` · ${money(withGst)} incl.` : ''}
                      </div>
                    </div>
                    <button className="btn btn-primary self-center" onClick={() => add(item._id)}>
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {count > 0 && !showCart && (
        <div className="fixed bottom-4 inset-x-0 px-4 z-20">
          <button
            className="btn btn-primary w-full max-w-3xl mx-auto py-3 shadow-lg flex justify-between"
            onClick={openCart}
          >
            <span>View Cart ({count})</span>
            <span>{money(total)}</span>
          </button>
        </div>
      )}

      {showTrack && !tracking && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Track your order</h3>
              <button className="text-slate-400" onClick={() => { setShowTrack(false); setError(''); }}>
                ✕
              </button>
            </div>
            <input
              className="input mb-3"
              placeholder="Order number (e.g. 00001)"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button className="btn btn-primary w-full" disabled={busy} onClick={() => trackOrder()}>
              {busy ? 'Looking up…' : 'Track Order'}
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-auto p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{cartStep === 'review' ? 'Review order' : 'Your Cart'}</h3>
              <button
                className="text-slate-400"
                onClick={() => {
                  setShowCart(false);
                  setCartStep('cart');
                  setError('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 text-xs mb-4">
              <span className={`px-2 py-1 rounded-full ${cartStep === 'cart' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>
                1. Cart
              </span>
              <span className={`px-2 py-1 rounded-full ${cartStep === 'review' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>
                2. Review
              </span>
            </div>

            {cartStep === 'cart' && (
              <>
                <div className="space-y-3 text-sm mb-4">
                  {cartLines.map((l) => (
                    <div key={l.item._id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{l.item.name}</div>
                        <div className="text-slate-500">
                          {money(l.lineSubtotal)} + GST {l.item.taxPercent}% = {money(l.lineTotal)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="icon-btn icon-btn-toggle" onClick={() => dec(l.item._id)}>
                          -
                        </button>
                        <span className="w-6 text-center font-semibold">{l.qty}</span>
                        <button className="icon-btn icon-btn-edit" onClick={() => add(l.item._id)}>
                          +
                        </button>
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
                    <select className="select" value={tableId} onChange={(e) => setTableId(e.target.value)}>
                      <option value="">Select table</option>
                      {data.tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    className="input"
                    placeholder="Your name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Phone (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Special instructions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="text-sm space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>{money(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <button
                  disabled={count < 1 || (orderType === 'DINE_IN' && !tableId)}
                  className="btn btn-primary w-full py-3"
                  onClick={goReview}
                >
                  Review Order
                </button>
              </>
            )}

            {cartStep === 'review' && (
              <>
                <div className="rounded-xl bg-slate-50 border border-[var(--rb-border)] p-3 text-sm mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium">
                      {orderType === 'DINE_IN' ? `Dine-in · Table ${selectedTableName}` : 'Takeaway'}
                    </span>
                  </div>
                  {(customerName || customerPhone) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer</span>
                      <span className="font-medium">
                        {customerName} {customerPhone}
                      </span>
                    </div>
                  )}
                  {notes && (
                    <div>
                      <div className="text-slate-500">Notes</div>
                      <div className="font-medium">{notes}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {cartLines.map((l) => (
                    <div key={l.item._id} className="flex justify-between border-b border-[var(--rb-border)] py-2">
                      <div>
                        <div className="font-medium">
                          {l.item.name} × {l.qty}
                        </div>
                        <div className="text-xs text-slate-500">GST {l.item.taxPercent}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{money(l.lineTotal)}</div>
                        <div className="text-xs text-slate-500">incl. {money(l.lineTax)} GST</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>{money(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn btn-secondary py-3" onClick={() => setCartStep('cart')}>
                    Back
                  </button>
                  <button className="btn btn-primary py-3" disabled={busy} onClick={placeOrder}>
                    {busy ? 'Placing…' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
