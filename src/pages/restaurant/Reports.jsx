import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import client from '../../api/client';
import DateFilter, { toQuery } from '../../components/DateFilter';
import { PageHeader } from '../../components/ui';
import { money } from '../../utils/format';

const tabs = [
  ['Sales', 'sales'],
  ['Item Sales', 'item-sales'],
  ['Purchases', 'purchases'],
  ['Expenses', 'expenses'],
  ['Salaries', 'salaries'],
  ['P&L', 'pnl'],
];

export function ReportsLayout() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Operational reports and P&L" />
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(([label, path]) => (
          <NavLink
            key={path}
            to={`/app/reports/${path}`}
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

function useReport(endpoint) {
  const [filter, setFilter] = useState({ preset: 'month', from: '', to: '' });
  const [data, setData] = useState(null);
  useEffect(() => {
    const q = toQuery(filter);
    client.get(`/reports/${endpoint}?${q}`).then((r) => setData(r.data)).catch(() => {});
  }, [endpoint, filter]);
  return { filter, setFilter, data };
}

export function SalesReport() {
  const { filter, setFilter, data } = useReport('sales');
  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      {data && (
        <>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {[
              ['Gross Sales', money(data.summary.grossSales)],
              ['Discount', money(data.summary.discount)],
              ['Tax', money(data.summary.tax)],
              ['Net Sales', money(data.summary.netSales)],
              ['Orders', data.summary.numberOfOrders],
              ['Avg Order', money(data.summary.averageOrderValue)],
            ].map(([a, b]) => (
              <div key={a} className="card p-4">
                <div className="text-xs text-slate-500">{a}</div>
                <div className="font-bold mt-1 text-lg">{b}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <h4 className="font-semibold mb-2">By Payment Method</h4>
              {data.byPaymentMethod.map((r) => (
                <div key={r.method} className="flex justify-between text-sm py-2 border-b border-[var(--rb-border)]">
                  <span>{r.method}</span>
                  <span className="font-medium">{money(r.amount)}</span>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <h4 className="font-semibold mb-2">By Order Type</h4>
              {data.byOrderType.map((r) => (
                <div key={r.type} className="flex justify-between text-sm py-2 border-b border-[var(--rb-border)]">
                  <span>{r.type}</span>
                  <span className="font-medium">{money(r.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.invoiceNumber}</td>
                    <td>{r.type}</td>
                    <td>{money(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function ItemSalesReport() {
  const { filter, setFilter, data } = useReport('item-sales');
  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows || []).map((r) => (
              <tr key={r.item}>
                <td className="font-medium">{r.item}</td>
                <td>{r.qty}</td>
                <td>{money(r.sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PurchaseReport() {
  const { filter, setFilter, data } = useReport('purchases');
  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      <p className="mb-3 font-semibold">Total: {money(data?.total)}</p>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows || []).map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.supplierName}</td>
                <td>{money(r.total)}</td>
                <td>{r.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExpenseReport() {
  const { filter, setFilter, data } = useReport('expenses');
  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h4 className="font-semibold mb-2">By Category</h4>
          {(data?.byCategory || []).map((r) => (
            <div key={r.category} className="flex justify-between text-sm py-2 border-b border-[var(--rb-border)]">
              <span>{r.category}</span>
              <span className="font-medium">{money(r.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3">
            <span>Total</span>
            <span>{money(data?.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SalaryReport() {
  const { filter, setFilter, data } = useReport('salaries');
  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month</th>
              <th>Salary</th>
              <th>Paid</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows || []).map((r) => (
              <tr key={r.id}>
                <td>{r.employee}</td>
                <td>{r.month}</td>
                <td>{money(r.salary)}</td>
                <td>{money(r.paid)}</td>
                <td>{money(r.pending)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PnlReport() {
  const { filter, setFilter, data } = useReport('pnl');
  const chartRows = data
    ? [
        ['Sales', data.revenue.sales],
        ['Purchases', data.expenses.purchases || 0],
        ['Salaries', data.expenses.salaries || 0],
        [
          'Other',
          Math.max(
            0,
            (data.expenses.totalExpenses || 0) -
              (data.expenses.purchases || 0) -
              (data.expenses.salaries || 0)
          ),
        ],
      ]
    : [];
  const max = Math.max(1, ...chartRows.map((r) => r[1]));

  return (
    <div>
      <DateFilter value={filter} onChange={setFilter} />
      {data && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="text-xl font-bold">{data.label}</h3>
            <p className="text-sm text-slate-500 mb-4">
              {new Date(data.from).toLocaleDateString()} — {new Date(data.to).toLocaleDateString()}
            </p>
            <div className="mb-4">
              <div className="font-semibold mb-2">Revenue</div>
              <div className="flex justify-between text-sm border-b border-[var(--rb-border)] py-2">
                <span>Sales</span>
                <span>{money(data.revenue.sales)}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Expenses</div>
              {Object.entries(data.expenses)
                .filter(([k]) => k !== 'totalExpenses')
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-[var(--rb-border)] py-2 capitalize">
                    <span>{k}</span>
                    <span>{money(v)}</span>
                  </div>
                ))}
              <div className="flex justify-between font-semibold py-2">
                <span>Total Expenses</span>
                <span>{money(data.expenses.totalExpenses)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-[var(--rb-border)] pt-3 text-emerald-700">
              <span>NET PROFIT</span>
              <span>{money(data.netProfit)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Operational P&L only — not formal accounting.</p>
          </div>
          <div className="card p-6">
            <h4 className="font-semibold mb-4">Overview</h4>
            <div className="space-y-3">
              {chartRows.map(([label, value]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{money(value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--rb-blue)]"
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsIndex() {
  const loc = useLocation();
  if (loc.pathname === '/app/reports') {
    return <p className="text-slate-500">Choose a report above.</p>;
  }
  return null;
}
