import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand, Icon } from '../components/ui';

const links = [
  ['Dashboard', '/super-admin', 'dashboard'],
  ['Restaurants', '/super-admin/restaurants', 'store'],
];

export default function SuperAdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[var(--rb-bg)]">
      <aside className="hidden md:flex w-60 flex-col bg-[var(--rb-navy)] text-white p-4">
        <div className="px-2 mb-8">
          <Brand light />
        </div>
        <nav className="flex-1">
          {links.map(([label, to, icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/super-admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={icon} size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left mt-auto border-0 bg-transparent cursor-pointer"
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
              <div className="text-sm font-semibold">Super Admin</div>
              <div className="text-xs text-[var(--rb-muted)]">{user?.email}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
              SA
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <div className="md:hidden flex gap-2 overflow-x-auto mb-4">
            {links.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/super-admin'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm border ${isActive ? 'bg-[var(--rb-blue)] text-white border-transparent' : 'bg-white'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <button onClick={logout} className="text-sm text-red-600 px-3">
              Logout
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
