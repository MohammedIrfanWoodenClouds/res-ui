export function money(n) {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function apiOrigin() {
  const base = import.meta.env.VITE_API_URL || 'https://res-api.13.232.129.80.nip.io/api';
  return base.replace(/\/api\/?$/, '');
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${apiOrigin()}${path}`;
}

export function todayInput() {
  return new Date().toISOString().slice(0, 10);
}
