import React, { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';

export default function Header({ activeRole, setActiveRole, activeUser, setActiveUser, users, notifications, onMarkRead }) {
  const roles = ['Employee', 'Manager', 'Admin'];
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const usersForRole = users.filter(u => u.role === activeRole);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: `1px solid ${COLORS.border}`, position: 'relative' }}>
      <h1 style={{ fontFamily: FONTS.heading, margin: 0, color: COLORS.textPrimary, fontSize: '22px' }}>ReimburseOS</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {roles.map(role => {
            const isActive = activeRole === role;
            return (
              <button key={role} onClick={() => setActiveRole(role)} style={{
                background: isActive ? COLORS.accent : 'transparent',
                color: isActive ? COLORS.textPrimary : COLORS.border,
                border: 'none', padding: '8px 16px', borderRadius: '8px',
                fontFamily: FONTS.body, fontWeight: isActive ? 500 : 400, cursor: 'pointer',
              }}>
                {role}
              </button>
            );
          })}
        </div>

        {/* User Picker */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }} style={{
            background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: '8px',
            padding: '6px 14px', fontFamily: FONTS.body, fontSize: '13px', cursor: 'pointer', color: COLORS.textPrimary,
          }}>
            👤 {activeUser?.name || 'Select'}
          </button>
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '6px',
              background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '10px',
              minWidth: '200px', zIndex: 100, overflow: 'hidden',
            }}>
              {usersForRole.map(u => (
                <button key={u.id} onClick={() => { setActiveUser(u); setShowUserMenu(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                  background: u.id === activeUser?.id ? COLORS.accent : 'transparent',
                  border: 'none', borderBottom: `1px solid ${COLORS.border}40`,
                  fontFamily: FONTS.body, fontSize: '13px', cursor: 'pointer', color: COLORS.textPrimary,
                }}>
                  {u.name} <span style={{ fontSize: '11px', color: COLORS.border }}>({u.department})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }} style={{
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
      </div>
    </header>
  );
}
