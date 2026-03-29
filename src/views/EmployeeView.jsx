import React, { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import StatCard from '../components/StatCard';
import ExpenseRow from '../components/ExpenseRow';
import { RATES_TO_INR, deriveStatus } from '../constants/data';

export default function EmployeeView({ expenses, setExpenses }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('Travel');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const currentUser = "Arjun Mehta";
  const userExpenses = expenses.filter(e => e.employee === currentUser);
  
  const totalClaims = userExpenses.length;
  const approvedClaims = userExpenses.filter(e => e.status === 'approved').length;
  const pendingClaims = userExpenses.filter(e => e.status === 'pending').length;
  const totalReimbursed = userExpenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + curr.displayAmount, 0);

  const handleFileUpload = (e) => {
    if (!e.target.files.length) return;
    setOcrLoading(true);
    setSuccessMsg('');
    setTimeout(() => {
      const generatedAmount = Math.floor(Math.random() * (6500 - 1200 + 1) + 1200);
      setAmount(generatedAmount);
      
      const categoryDescMap = {
        'Travel': 'Flight to Delhi — IndiGo',
        'Meals': 'Team lunch at The Yellow Chilli',
        'Software': 'Adobe Creative Cloud subscription',
        'Office': 'Stationery and printer cartridges',
        'Other': 'Miscellaneous office expense'
      };
      
      setDescription(categoryDescMap[category] || categoryDescMap['Other']);
      setOcrLoading(false);
      setSuccessMsg('✓ OCR complete — fields auto-filled');
      setTimeout(() => setSuccessMsg(''), 2000);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ocrLoading) return;
    const displayAmount = Number(amount) * (RATES_TO_INR[currency] || 1);
    const newExpense = {
      id: Date.now(),
      employee: currentUser,
      category,
      amount: Number(amount),
      currency,
      displayAmount,
      date,
      description,
      receipt: true,
      receiptFile: null,
      comments: "",
      status: "pending",
      approvalSteps: [
        { role: "Manager", approver: "Sanjay Rao", status: "pending" },
        { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
      ]
    };
    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDescription('');
    setDate('');
    setCategory('Travel');
    setCurrency('INR');
    setSuccessMsg('✓ Expense submitted successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const inputStyle = {
    fontFamily: FONTS.body, padding: '10px 14px', borderRadius: '8px', 
    border: `1px solid ${COLORS.border}`, background: 'transparent', width: '100%',
    color: COLORS.textPrimary, outline: 'none'
  };
  const labelStyle = { fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.border, marginBottom: '6px', display: 'block' };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '24px' }}>Welcome, {currentUser}</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Total Claims" value={totalClaims} />
        <StatCard label="Approved" value={approvedClaims} />
        <StatCard label="Pending" value={pendingClaims} />
        <StatCard label="Total Reimbursed (₹)" value={`₹${totalReimbursed.toLocaleString()}`} accent={COLORS.accentAlt} />
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px' }}>
            <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Submit New Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Amount</label>
                  <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} disabled={ocrLoading} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle} disabled={ocrLoading}>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} disabled={ocrLoading}>
                    <option value="Travel">Travel</option>
                    <option value="Meals">Meals</option>
                    <option value="Software">Software</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={inputStyle} disabled={ocrLoading} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" required value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} disabled={ocrLoading} />
              </div>

              <div>
                <label style={labelStyle}>Receipt Upload (Provides OCR auto-fill)</label>
                <input type="file" accept="image/*, application/pdf" onChange={handleFileUpload} style={{...inputStyle, padding: '8px'}} disabled={ocrLoading} />
                {ocrLoading && <p style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.border, marginTop: '8px' }}>Reading receipt...</p>}
              </div>

              <button type="submit" disabled={ocrLoading} style={{
                background: COLORS.accent,
                color: COLORS.textPrimary,
                borderRadius: '8px',
                border: 'none',
                padding: '12px',
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: '15px',
                cursor: ocrLoading ? 'not-allowed' : 'pointer',
                opacity: ocrLoading ? 0.6 : 1,
                marginTop: '10px'
              }}>
                Submit Expense
              </button>
              {successMsg && <p style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.accentAlt, fontWeight: 600 }}>{successMsg}</p>}
            </form>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Your Expense History</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {userExpenses.map(exp => (
              <ExpenseRow key={exp.id} expense={exp} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
