import React from 'react';
import { COLORS, FONTS } from '../styles/theme';

export default function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '12px',
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <span style={{ fontFamily: FONTS.body, fontSize: '14px', color: COLORS.border, fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: FONTS.body, fontSize: '28px', color: accent || COLORS.textPrimary, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
