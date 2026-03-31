import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import StatCard from '../components/StatCard';
import ExpenseRow from '../components/ExpenseRow';
import { fetchManagerExpenses, fetchManagerHistory, processExpenseAction, reportEmployee } from '../api';

export default function ManagerView({ activeUser, users, refreshNotifications }) {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [commentInput, setCommentInput] = useState({});
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const load = () => {
    fetchManagerExpenses().then(setPending);
    fetchManagerHistory().then(setHistory);
  };

  useEffect(() => { load(); }, [activeUser.id]);

  const totalValuePending = pending.reduce((acc, curr) => acc + Number(curr.display_amount), 0);

  const handleAction = async (expenseId, action) => {
    await processExpenseAction(expenseId, action, commentInput[expenseId] || '');
    setCommentInput(prev => ({ ...prev, [expenseId]: '' }));
    load();
    refreshNotifications();
  };

  const handleReport = async () => {
    if (!reportModal || !reportReason) return;
    await reportEmployee(reportModal, reportReason);
    setReportModal(null);
    setReportReason('');
    refreshNotifications();
  };

  const employees = users.filter(u => u.manager_id === activeUser.id);

  const btnStyle = (bg, text) => ({
    background: bg, color: text, border: 'none', borderRadius: '8px',
    padding: '8px 16px', fontFamily: FONTS.body, fontWeight: 600, cursor: 'pointer',
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '24px' }}>Manager Dashboard — {activeUser.name}</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <StatCard label="Awaiting Approval" value={pending.length} />
        <StatCard label="Resolved" value={history.length} />
        <StatCard label="Total Value Pending (₹)" value={`₹${totalValuePending.toLocaleString()}`} accent={COLORS.accentAlt} />
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Pending Approvals */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Pending Approvals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pending.length === 0 && <p style={{ fontFamily: FONTS.body, color: COLORS.border }}>No pending approvals.</p>}
            {pending.map(exp => (
              <div key={exp.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontFamily: FONTS.body, fontSize: '16px', color: COLORS.textPrimary }}>{exp.employee}</strong>
                    <div style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, marginTop: '4px' }}>
                      {exp.category} &middot; {exp.date}
                    </div>
                  </div>
                  <strong style={{ fontFamily: FONTS.body, fontSize: '18px', color: COLORS.textPrimary }}>₹{Number(exp.display_amount).toLocaleString()}</strong>
                </div>
                <p style={{ fontFamily: FONTS.body, fontSize: '15px', color: COLORS.textPrimary, marginBottom: '12px', marginTop: 0 }}>{exp.description}</p>
                <div style={{ marginBottom: '16px' }}>
                  {exp.receipt ?
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.accentAlt, fontWeight: 600 }}>✓ Receipt attached</span> :
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, fontWeight: 600 }}>✗ No receipt</span>
                  }
                </div>
                {/* Progress bar */}
                <div style={{ background: `${COLORS.border}30`, borderRadius: '4px', height: '6px', marginBottom: '16px' }}>
                  <div style={{ width: `${exp.progress}%`, background: COLORS.accentAlt, height: '100%', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Add a comment..." value={commentInput[exp.id] || ''}
                    onChange={e => setCommentInput({ ...commentInput, [exp.id]: e.target.value })}
                    style={{ fontFamily: FONTS.body, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', width: '100%', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction(exp.id, 'rejected')} style={btnStyle(COLORS.border, COLORS.cardBg)}>Reject</button>
                    <button onClick={() => handleAction(exp.id, 'approved')} style={btnStyle(COLORS.accentAlt, COLORS.textPrimary)}>Approve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Report Employee */}
          {employees.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '16px' }}>Report Employee</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {employees.map(emp => (
                  <button key={emp.id} onClick={() => setReportModal(emp.id)} style={{
                    background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '8px',
                    padding: '8px 16px', fontFamily: FONTS.body, fontSize: '13px', cursor: 'pointer', color: COLORS.textPrimary,
                  }}>
                    ⚠ {emp.name}
                  </button>
                ))}
              </div>
              {reportModal && (
                <div style={{ marginTop: '16px', background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '20px' }}>
                  <label style={{ fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.border }}>Reason</label>
                  <input type="text" value={reportReason} onChange={e => setReportReason(e.target.value)}
                    style={{ fontFamily: FONTS.body, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', width: '100%', outline: 'none', marginTop: '6px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setReportModal(null)} style={btnStyle('transparent', COLORS.border)}>Cancel</button>
                    <button onClick={handleReport} style={btnStyle(COLORS.accent, COLORS.textPrimary)}>Submit Report</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Decisions */}
        <div style={{ flex: 1, minWidth: '340px' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Recent Decisions</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.length === 0 && <p style={{ fontFamily: FONTS.body, color: COLORS.border }}>No history yet.</p>}
            {history.map(exp => <ExpenseRow key={exp.id} expense={exp} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
