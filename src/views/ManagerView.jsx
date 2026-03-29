import React, { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import StatCard from '../components/StatCard';
import ExpenseRow from '../components/ExpenseRow';
import { deriveStatus } from '../constants/data';

export default function ManagerView({ expenses, setExpenses }) {
  const [commentInput, setCommentInput] = useState({});

  const allPending = expenses.filter(e => e.status === 'pending');
  const awaitingApproval = allPending.length;
  const approvedThisMonth = expenses.filter(e => e.status === 'approved').length;
  const totalValuePending = allPending.reduce((acc, curr) => acc + curr.displayAmount, 0);

  const handleAction = (expenseId, action) => {
    const updatedExpenses = expenses.map(exp => {
      if (exp.id === expenseId) {
        const stepIndex = exp.approvalSteps.findIndex(s => s.status === 'pending');
        if (stepIndex !== -1) {
          const newSteps = [...exp.approvalSteps];
          newSteps[stepIndex] = { ...newSteps[stepIndex], status: action };
          const newStatus = deriveStatus(newSteps);
          return {
            ...exp,
            approvalSteps: newSteps,
            status: newStatus,
            comments: commentInput[expenseId] || exp.comments
          };
        }
      }
      return exp;
    });
    setExpenses(updatedExpenses);
    setCommentInput(prev => ({ ...prev, [expenseId]: '' }));
  };

  const recentDecisions = expenses.filter(e => e.status !== 'pending');

  const btnStyle = (bg, text) => ({
    background: bg, color: text, border: 'none', borderRadius: '8px', 
    padding: '8px 16px', fontFamily: FONTS.body, fontWeight: 600, cursor: 'pointer'
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '24px' }}>Manager Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Awaiting Approval" value={awaitingApproval} />
        <StatCard label="Approved This Month" value={approvedThisMonth} />
        <StatCard label="Total Value Pending (₹)" value={`₹${totalValuePending.toLocaleString()}`} accent={COLORS.accentAlt} />
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Pending Approvals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allPending.length === 0 && <p style={{fontFamily: FONTS.body, color: COLORS.border}}>No pending approvals.</p>}
            {allPending.map(exp => (
              <div key={exp.id} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontFamily: FONTS.body, fontSize: '16px', color: COLORS.textPrimary }}>{exp.employee}</strong>
                    <div style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, marginTop: '4px' }}>
                      {exp.category} &middot; {exp.date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontFamily: FONTS.body, fontSize: '18px', color: COLORS.textPrimary }}>₹{exp.displayAmount.toLocaleString()}</strong>
                  </div>
                </div>
                
                <p style={{ fontFamily: FONTS.body, fontSize: '15px', color: COLORS.textPrimary, marginBottom: '16px', marginTop: 0 }}>
                  {exp.description}
                </p>
                
                <div style={{ marginBottom: '20px' }}>
                  {exp.receipt ? 
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.accentAlt, fontWeight: 600 }}>✓ Receipt attached</span> :
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, fontWeight: 600 }}>✗ No receipt</span>
                  }
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={commentInput[exp.id] || ''}
                    onChange={e => setCommentInput({...commentInput, [exp.id]: e.target.value})}
                    style={{
                      fontFamily: FONTS.body, padding: '10px 14px', borderRadius: '8px', 
                      border: `1px solid ${COLORS.border}`, background: 'transparent', width: '100%',
                      outline: 'none'
                    }} 
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction(exp.id, 'rejected')} style={btnStyle(COLORS.border, COLORS.cardBg)}>
                      Reject
                    </button>
                    <button onClick={() => handleAction(exp.id, 'approved')} style={btnStyle(COLORS.accentAlt, COLORS.textPrimary)}>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Recent Decisions</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentDecisions.map(exp => <ExpenseRow key={exp.id} expense={exp} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
