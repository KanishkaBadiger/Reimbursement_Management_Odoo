import React from 'react';
import { COLORS, FONTS } from '../styles/theme';

export default function Badge({ status }) {
  let bg, text;
  if (status === 'pending') {
    bg = COLORS.accent;
    text = COLORS.textPrimary;
  } else if (status === 'approved') {
    bg = COLORS.accentAlt;
    text = COLORS.textPrimary;
  } else if (status === 'rejected') {
    bg = COLORS.border;
    text = COLORS.cardBg;
  }

  return (
    <span style={{
      background: bg,
      color: text,
      fontFamily: FONTS.body,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: '20px',
      textTransform: 'uppercase',
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
}
