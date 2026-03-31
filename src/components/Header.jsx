import React, { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import { supabase } from '../supabaseClient';

export default function Header({ activeTab, setActiveTab, activeUser, notifications, onMarkRead }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = ['Expenses'];
  if (activeUser?.role === 'Manager' || activeUser?.role === 'Admin') tabs.push('Approvals');
  if (activeUser?.role === 'Admin') tabs.push('Admin');

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: `1px solid ${COLORS.border}`, position: 'relative' }}>
      <h1 style={{ fontFamily: FONTS.heading, margin: 0, color: COLORS.textPrimary, fontSize: '22px' }}>ReimburseOS</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginRight: '20px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: isActive ? COLORS.accent : 'transparent',
                color: isActive ? COLORS.textPrimary : COLORS.border,
                border: 'none', padding: '8px 16px', borderRadius: '8px',
                fontFamily: FONTS.body, fontWeight: isActive ? 500 : 400, cursor: 'pointer',
              }}>
                {tab}
              </button>
            );
          })}
        </div>

        {/* Current User */}
        <div style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.textPrimary, borderRight: `1px solid ${COLORS.border}`, paddingRight: '16px' }}>
          <span style={{ fontWeight: 600 }}>{activeUser?.name}</span>
          <span style={{ color: COLORS.border, marginLeft: '6px' }}>({activeUser?.role})</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifs(!showNotifs)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', position: 'relative',
          }}>
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-6px',
                background: COLORS.accent, color: COLORS.textPrimary,
                fontSize: '10px', fontWeight: 700, borderRadius: '50%',
                width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</span>
            )}
          </button>
          
          {showNotifs && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '6px',
              background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '10px',
              width: '320px', maxHeight: '360px', overflowY: 'auto', zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, fontFamily: FONTS.heading, fontWeight: 700, fontSize: '14px' }}>
                Notifications
              </div>
              {notifications.length === 0 && (
                <p style={{ padding: '20px 16px', fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, textAlign: 'center' }}>No notifications</p>
              )}
              {notifications.map(n => (
                <div key={n.id} onClick={() => !n.read && onMarkRead(n.id)} style={{
                  padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}20`,
                  background: n.read ? 'transparent' : `${COLORS.accent}30`, cursor: n.read ? 'default' : 'pointer',
                }}>
                  <p style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.textPrimary, margin: 0 }}>{n.message}</p>
                  <p style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.border, margin: '4px 0 0' }}>{n.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Logout */}
        <button onClick={handleLogout} style={{
          background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: '8px',
          padding: '6px 14px', fontFamily: FONTS.body, fontSize: '13px', cursor: 'pointer', color: COLORS.textPrimary,
        }}>
          Logout
        </button>
      </div>
    </header>
  );
}
