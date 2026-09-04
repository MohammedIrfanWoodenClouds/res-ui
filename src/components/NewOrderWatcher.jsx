import { useEffect, useRef } from 'react';
import client from '../api/client';
import { useToast } from './Toast';
import { money } from '../utils/format';

export default function NewOrderWatcher() {
  const { push } = useToast();
  const seenRef = useRef(null);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    const unlock = () => {
      audioUnlocked.current = true;
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { data } = await client.get('/orders?status=NEW');
        if (cancelled) return;
        const orders = Array.isArray(data) ? data : [];
        const ids = new Set(orders.map((o) => o._id));

        if (seenRef.current === null) {
          seenRef.current = ids;
          return;
        }

        const fresh = orders.filter((o) => !seenRef.current.has(o._id));
        for (const order of fresh) {
          const where =
            order.orderType === 'DINE_IN'
              ? `Table ${order.tableName || '-'}`
              : 'Takeaway';
          push(`#${order.orderNumber} · ${where} · ${money(order.total)}`, {
            title: 'New QR order received',
            type: 'warning',
            duration: 10000,
          });
          try {
            if (audioUnlocked.current && window.AudioContext) {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              gain.gain.value = 0.04;
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
            }
          } catch {
            // ignore audio errors
          }
        }

        const next = new Set(seenRef.current);
        ids.forEach((id) => next.add(id));
        seenRef.current = next.size > 200 ? ids : next;
      } catch {
        // ignore polling errors
      }
    };

    check();
    const t = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [push]);

  return null;
}
