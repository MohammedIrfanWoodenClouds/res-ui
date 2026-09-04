export function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case 'store':
      return (
        <svg {...props}>
          <path d="M3 9l1-4h16l1 4" />
          <path d="M4 9v10h16V9" />
          <path d="M9 19v-6h6v6" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 14.5-4 16 0" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...props}>
          <path d="M9 5h11" />
          <path d="M9 12h11" />
          <path d="M9 19h11" />
          <path d="M4 5h.01" />
          <path d="M4 12h.01" />
          <path d="M4 19h.01" />
        </svg>
      );
    case 'kot':
      return (
        <svg {...props}>
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );
    case 'billing':
      return (
        <svg {...props}>
          <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'purchases':
      return (
        <svg {...props}>
          <path d="M6 6h15l-1.5 9h-12z" />
          <circle cx="9" cy="20" r="1" />
          <circle cx="17" cy="20" r="1" />
          <path d="M6 6L5 3H2" />
        </svg>
      );
    case 'expenses':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'salaries':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c2-4 14-4 16 0" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16V10" />
          <path d="M13 16V7" />
          <path d="M18 16v-4" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      );
    case 'key':
      return (
        <svg {...props}>
          <circle cx="8" cy="15" r="4" />
          <path d="M11 12l9-9" />
          <path d="M17 3l4 4" />
        </svg>
      );
    case 'utensils':
      return (
        <svg {...props}>
          <path d="M4 3v8a2 2 0 0 0 2 2h0v8" />
          <path d="M8 3v7" />
          <path d="M12 3v7" />
          <path d="M16 3c2 2 3 4 3 7v11" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatusBadge({ active, label }) {
  if (label) {
    const map = {
      Active: 'badge-green',
      Inactive: 'badge-red',
      NEW: 'badge-blue',
      CONFIRMED: 'badge-blue',
      PREPARING: 'badge-amber',
      READY: 'badge-green',
      COMPLETED: 'badge-green',
      CANCELLED: 'badge-red',
      Paid: 'badge-green',
      Pending: 'badge-amber',
      Partial: 'badge-blue',
      CREATED: 'badge-blue',
    };
    return <span className={`badge ${map[label] || 'badge-slate'}`}>{label}</span>;
  }
  return (
    <span className={`badge ${active ? 'badge-green' : 'badge-red'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--rb-border)]">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" className="text-slate-400 hover:text-slate-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--rb-border)] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--rb-muted)] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative min-w-[220px] flex-1 max-w-md">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon name="search" size={16} />
      </span>
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function Brand({ light = false }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-lg ${light ? 'text-white' : 'text-[var(--rb-navy)]'}`}>
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${light ? 'bg-blue-500' : 'bg-[var(--rb-blue)]'} text-white`}
      >
        <Icon name="utensils" size={18} />
      </span>
      RestoBill
    </div>
  );
}
