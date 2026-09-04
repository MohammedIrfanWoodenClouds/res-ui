export default function DateFilter({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-wrap gap-2 items-end mb-4">
      {['today', 'yesterday', 'week', 'month', 'custom'].map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => set({ preset: p })}
          className={`btn ${value.preset === p ? 'btn-primary' : 'btn-secondary'}`}
        >
          {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p[0].toUpperCase() + p.slice(1)}
        </button>
      ))}
      {value.preset === 'custom' && (
        <>
          <input
            type="date"
            className="input w-auto"
            value={value.from || ''}
            onChange={(e) => set({ from: e.target.value })}
          />
          <input
            type="date"
            className="input w-auto"
            value={value.to || ''}
            onChange={(e) => set({ to: e.target.value })}
          />
        </>
      )}
    </div>
  );
}

export function toQuery(filter) {
  const q = new URLSearchParams();
  if (filter.preset && filter.preset !== 'custom') q.set('preset', filter.preset);
  if (filter.preset === 'custom') {
    if (filter.from) q.set('from', filter.from);
    if (filter.to) q.set('to', filter.to);
  }
  return q.toString();
}
