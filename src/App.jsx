import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from './styles/theme';
import { fetchUsers, fetchExpenses, fetchAllExpenses, fetchRules, fetchNotifications, markNotificationRead } from './api';
import Header from './components/Header';
import EmployeeView from './views/EmployeeView';
import ManagerView from './views/ManagerView';
import AdminView from './views/AdminView';

export default function App() {
  const [activeRole, setActiveRole] = useState('Employee');
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load users on mount
  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      // Default to first Employee
      const emp = data.find(u => u.role === 'Employee');
      if (emp) setActiveUser(emp);
    });
  }, []);

  // When role changes, switch to first user of that role
  useEffect(() => {
    if (!users.length) return;
    const match = users.find(u => u.role === activeRole);
    if (match) setActiveUser(match);
  }, [activeRole, users]);

  // Load notifications for active user
  useEffect(() => {
    if (!activeUser) return;
    fetchNotifications(activeUser.id).then(setNotifications);
  }, [activeUser]);

  const refreshNotifications = () => {
    if (activeUser) fetchNotifications(activeUser.id).then(setNotifications);
  };

  if (!activeUser) return null;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pageBg, fontFamily: FONTS.body }}>
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        users={users}
        notifications={notifications}
        onMarkRead={(id) => markNotificationRead(id).then(refreshNotifications)}
      />
      {activeRole === 'Employee' && <EmployeeView activeUser={activeUser} />}
      {activeRole === 'Manager'  && <ManagerView  activeUser={activeUser} users={users} refreshNotifications={refreshNotifications} />}
      {activeRole === 'Admin'    && <AdminView    activeUser={activeUser} users={users} setUsers={setUsers} refreshNotifications={refreshNotifications} />}
    </div>
  );
}
