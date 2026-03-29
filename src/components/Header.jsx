import React from 'react';
import { COLORS, FONTS } from '../styles/theme';

export default function Header({ activeRole, setActiveRole }) {
  const roles = ['Employee', 'Manager', 'Admin'];

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: `1px solid ${COLORS.border}` }}>
      <h1 style={{ fontFamily: FONTS.heading, margin: 0, color: COLORS.textPrimary }}>ReimburseOS</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        {roles.map(role => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              style={{
                background: isActive ? COLORS.accent : 'transparent',
                color: isActive ? COLORS.textPrimary : COLORS.border,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: FONTS.body,
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {role}
            </button>
          )
        })}
      </div>
    </header>
  );
}
