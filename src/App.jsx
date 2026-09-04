import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import Restaurants from './pages/super-admin/Restaurants';
import Dashboard from './pages/restaurant/Dashboard';
import Menu from './pages/restaurant/Menu';
import Orders from './pages/restaurant/Orders';
import Kot from './pages/restaurant/Kot';
import Billing from './pages/restaurant/Billing';
import Purchases from './pages/restaurant/Purchases';
import Expenses from './pages/restaurant/Expenses';
import Salaries from './pages/restaurant/Salaries';
import Settings from './pages/restaurant/Settings';
import PublicMenu from './pages/public/MenuPage';
import ReportsIndex, {
  ReportsLayout,
  SalesReport,
  ItemSalesReport,
  PurchaseReport,
  ExpenseReport,
  SalaryReport,
  PnlReport,
} from './pages/restaurant/Reports';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === 'SUPER_ADMIN' ? '/super-admin/restaurants' : '/app'}
        replace
      />
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />

      <Route
        path="/super-admin"
        element={
          <Guard role="SUPER_ADMIN">
            <SuperAdminLayout />
          </Guard>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="restaurants" element={<Restaurants />} />
      </Route>

      <Route
        path="/app"
        element={
          <Guard role="RESTAURANT">
            <RestaurantLayout />
          </Guard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="kot" element={<Kot />} />
        <Route path="billing" element={<Billing />} />
        <Route path="menu" element={<Menu />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="salaries" element={<Salaries />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<ReportsLayout />}>
          <Route index element={<ReportsIndex />} />
          <Route path="sales" element={<SalesReport />} />
          <Route path="item-sales" element={<ItemSalesReport />} />
          <Route path="purchases" element={<PurchaseReport />} />
          <Route path="expenses" element={<ExpenseReport />} />
          <Route path="salaries" element={<SalaryReport />} />
          <Route path="pnl" element={<PnlReport />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
