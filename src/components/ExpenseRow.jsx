import React from 'react';
import { COLORS, FONTS } from '../styles/theme';
import Badge from './Badge';

export default function ExpenseRow({ expense }) {
  return (
    <div style={{
      background: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: FONTS.body, fontWeight: 500, color: COLORS.textPrimary, fontSize: '15px' }}>
          {expense.description}
        </span>
        <span style={{ fontFamily: FONTS.body, color: COLORS.border, fontSize: '13px' }}>
          {expense.employee && `${expense.employee} · `}{expense.category} · {expense.date}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.textPrimary }}>
          ₹{Number(expense.display_amount).toLocaleString()}
        </span>
        <Badge status={expense.status} />
      </div>
    </div>
  );
}
