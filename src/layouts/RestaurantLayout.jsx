import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand, Icon } from '../components/ui';
import { useEffect, useState } from 'react';
import client from '../api/client';

const links = [
  ['Dashboard', '/app', 'dashboard', true],
  ['Orders', '/app/orders', 'orders', false],
  ['KOT', '/app/kot', 'kot', false],
  ['Billing', '/app/billing', 'billing', false],
  ['Menu', '/app/menu', 'menu', false],
  ['Purchases', '/app/purchases', 'purchases', false],
  ['Expenses', '/app/expenses', 'expenses', false],
  ['Salaries', '/app/salaries', 'salaries', false],
  ['Reports', '/app/reports/sales', 'reports', false],
  ['Settings', '/app/settings', 'settings', false],
];

export default function RestaurantLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [name, setName] = useState('Restaurant');

  useEffect(() => {
    client
      .get('/menu/profile')
      .then((r) => setName(r.data.name || 'Restaurant'))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex bg-[var(--rb-bg)]">
      <aside className="hidden md:flex w-60 flex-col bg-[var(--rb-navy)] text-white p-4">
        <div className="px-2 mb-8">
          <Brand light />
          <div className="text-xs text-slate-400 mt-2 px-1 truncate">{name}</div>
        </div>
        <nav className="flex-1 overflow-auto">
          {links.map(([label, to, icon, end]) => {
            const active =
              label === 'Reports'
                ? location.pathname.startsWith('/app/reports')
                : end
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={!!end}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <Icon name={icon} size={18} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left mt-2 border-0 bg-transparent cursor-pointer"
        >
          <Icon name="logout" size={18} />
          Logout
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-[var(--rb-border)] px-4 md:px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-[var(--rb-muted)]">{user?.email}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
              R
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="md:hidden flex gap-2 overflow-x-auto mb-4 pb-1">
            {links.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => {
                  const active =
                    label === 'Reports'
                      ? location.pathname.startsWith('/app/reports')
                      : isActive;
                  return `whitespace-nowrap rounded-lg px-3 py-2 text-xs border ${active ? 'bg-[var(--rb-blue)] text-white border-transparent' : 'bg-white'}`;
                }}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
