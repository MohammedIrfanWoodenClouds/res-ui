import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { money, todayInput } from '../../utils/format';
import { Icon, Modal, PageHeader, SearchInput } from '../../components/ui';

export default function Salaries() {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [empForm, setEmpForm] = useState({
    name: '',
    phone: '',
    designation: '',
    monthlySalary: '',
    joiningDate: todayInput(),
  });
  const [payForm, setPayForm] = useState({
    employeeId: '',
    month: '',
    salary: '',
    paid: '',
    paymentDate: todayInput(),
    paymentMethod: 'Bank',
  });
  const [empOpen, setEmpOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [e, p] = await Promise.all([
      client.get('/salaries/employees'),
      client.get('/salaries'),
    ]);
    setEmployees(e.data);
    setPayments(p.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) => p.employeeName?.toLowerCase().includes(q) || p.month?.toLowerCase().includes(q)
    );
  }, [payments, search]);

  const addEmployee = async (e) => {
    e.preventDefault();
    await client.post('/salaries/employees', empForm);
    setEmpForm({ name: '', phone: '', designation: '', monthlySalary: '', joiningDate: todayInput() });
    setEmpOpen(false);
    await load();
  };

  const onEmployeePick = (id) => {
    const emp = employees.find((x) => x._id === id);
    setPayForm({
      ...payForm,
      employeeId: id,
      salary: emp?.monthlySalary || '',
      paid: emp?.monthlySalary || '',
    });
  };

  const savePayment = async (e) => {
    e.preventDefault();
    await client.post('/salaries', payForm);
    setPayForm({
      employeeId: '',
      month: '',
      salary: '',
      paid: '',
      paymentDate: todayInput(),
      paymentMethod: 'Bank',
    });
    setPayOpen(false);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Salaries"
        subtitle="Employees and salary payments"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setEmpOpen(true)}>
              Add Employee
            </button>
            <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
              <Icon name="plus" size={16} /> Add Payment
            </button>
          </>
        }
      />

      <div className="card p-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search payments..." />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card table-wrap">
          <div className="px-4 py-3 border-b border-[var(--rb-border)] font-semibold">Employees</div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id}>
                  <td className="font-medium">{e.name}</td>
                  <td>{e.designation}</td>
                  <td>{money(e.monthlySalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card table-wrap">
          <div className="px-4 py-3 border-b border-[var(--rb-border)] font-semibold">Payments</div>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">{p.employeeName}</td>
                  <td>{p.month}</td>
                  <td>{money(p.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {empOpen && (
        <Modal
          title="Add Employee"
          onClose={() => setEmpOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEmpOpen(false)}>Cancel</button>
              <button form="emp-form" className="btn btn-primary">Save</button>
            </>
          }
        >
          <form id="emp-form" onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Employee name" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} required />
            <input className="input" placeholder="Phone" value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} />
            <input className="input" placeholder="Designation" value={empForm.designation} onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })} />
            <input className="input" placeholder="Monthly salary" type="number" value={empForm.monthlySalary} onChange={(e) => setEmpForm({ ...empForm, monthlySalary: e.target.value })} required />
            <input type="date" className="input sm:col-span-2" value={empForm.joiningDate} onChange={(e) => setEmpForm({ ...empForm, joiningDate: e.target.value })} />
          </form>
        </Modal>
      )}

      {payOpen && (
        <Modal
          title="Salary Payment"
          onClose={() => setPayOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setPayOpen(false)}>Cancel</button>
              <button form="pay-form" className="btn btn-primary">Save</button>
            </>
          }
        >
          <form id="pay-form" onSubmit={savePayment} className="grid sm:grid-cols-2 gap-3">
            <select className="select" value={payForm.employeeId} onChange={(e) => onEmployeePick(e.target.value)} required>
              <option value="">Employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
            <input className="input" placeholder="Month e.g. September 2026" value={payForm.month} onChange={(e) => setPayForm({ ...payForm, month: e.target.value })} required />
            <input className="input" type="number" placeholder="Salary" value={payForm.salary} onChange={(e) => setPayForm({ ...payForm, salary: e.target.value })} required />
            <input className="input" type="number" placeholder="Paid" value={payForm.paid} onChange={(e) => setPayForm({ ...payForm, paid: e.target.value })} required />
            <input type="date" className="input" value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} required />
            <select className="select" value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
              {['Bank', 'Cash', 'UPI', 'Other'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </form>
        </Modal>
      )}
    </div>
  );
}
