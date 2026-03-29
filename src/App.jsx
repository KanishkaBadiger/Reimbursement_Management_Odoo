import React, { useState } from 'react';
import { COLORS, FONTS } from './styles/theme';
import { SEEDED_EXPENSES, SEEDED_RULES } from './constants/data';
import Header from './components/Header';
import EmployeeView from './views/EmployeeView';
import ManagerView from './views/ManagerView';
import AdminView from './views/AdminView';

export default function App() {
  const [activeRole, setActiveRole] = useState('Employee');
  const [expenses, setExpenses] = useState(SEEDED_EXPENSES);
  const [rules, setRules] = useState(SEEDED_RULES);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pageBg, fontFamily: FONTS.body }}>
      <Header activeRole={activeRole} setActiveRole={setActiveRole} />
      {activeRole === 'Employee' && <EmployeeView expenses={expenses} setExpenses={setExpenses} />}
      {activeRole === 'Manager'  && <ManagerView  expenses={expenses} setExpenses={setExpenses} />}
      {activeRole === 'Admin'    && <AdminView    expenses={expenses} rules={rules} setRules={setRules} />}
    </div>
  );
}
