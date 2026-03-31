import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { fetchMe, fetchUsers, fetchNotifications, markNotificationRead } from './api';
import { COLORS, FONTS } from './styles/theme';
import Header from './components/Header';
import EmployeeView from './views/EmployeeView';
import ManagerView from './views/ManagerView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Expenses');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setActiveUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const [needsInit, setNeedsInit] = useState(false);

  async function loadData() {
    setLoading(true);
    setNeedsInit(false);
    try {
      const me = await fetchMe();
      if (me.is_new_signup) {
        setActiveUser(null);
        setNeedsInit(true);
        return;
      }
      setActiveUser(me);
      
      const notifs = await fetchNotifications();
      setNotifications(notifs);

      // Only fetch all users if the user is an Admin, otherwise backend returns 401 and signs them out!
      if (me.role === 'Admin') {
        const allUsers = await fetchUsers();
        setUsers(allUsers);
      }
      
    } catch (err) {
      console.error("Failed to load user data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const refreshNotifications = () => {
    fetchNotifications().then(setNotifications);
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading ReimburseOS...</div>;
  }

  if (!session || !activeUser) {
    return <LoginView onLoginSuccess={loadData} session={session} needsInit={needsInit} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pageBg, fontFamily: FONTS.body }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUser={activeUser}
        notifications={notifications}
        onMarkRead={(id) => markNotificationRead(id).then(refreshNotifications)}
      />
      
      {activeTab === 'Expenses' && <EmployeeView activeUser={activeUser} />}
      {activeTab === 'Approvals' && (activeUser.role === 'Manager' || activeUser.role === 'Admin') && <ManagerView activeUser={activeUser} users={users} refreshNotifications={refreshNotifications} />}
      {activeTab === 'Admin' && activeUser.role === 'Admin' && <AdminView activeUser={activeUser} users={users} setUsers={setUsers} refreshNotifications={refreshNotifications} />}
    </div>
  );
}
