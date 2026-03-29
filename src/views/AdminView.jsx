import React, { useState } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export default function AdminView({ expenses, rules, setRules }) {
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState('percentage');

  const totalEmployees = 7;
  const allExpensesCount = expenses.length;
  const totalClaimed = expenses.reduce((acc, curr) => acc + curr.displayAmount, 0);
  const totalApproved = expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + curr.displayAmount, 0);

  const handleToggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleName) return;
    
    let valueStr = "Custom Rule";
    if (newRuleType === 'percentage') valueStr = "Percentage threshold";
    else if (newRuleType === 'specific') valueStr = "Specific manager";
    else if (newRuleType === 'hybrid') valueStr = "Multiple conditions";

    const newRule = {
      id: Date.now(),
      name: newRuleName,
      type: newRuleType,
      value: valueStr,
      active: true
    };
    setRules([newRule, ...rules]);
    setNewRuleName('');
  };

  const USERS = [
    { name: "Arjun Mehta", dept: "Engineering", role: "Employee", manager: "Sanjay Rao" },
    { name: "Priya Sharma", dept: "Design", role: "Employee", manager: "Sanjay Rao" },
    { name: "Riya Desai", dept: "Marketing", role: "Employee", manager: "Sanjay Rao" },
    { name: "Vikram Nair", dept: "Finance", role: "Employee", manager: "Sanjay Rao" },
    { name: "Sneha Joshi", dept: "Operations", role: "Employee", manager: "Sanjay Rao" },
    { name: "Sanjay Rao", dept: "Management", role: "Manager", manager: "Board" },
    { name: "Neha Kulkarni", dept: "Finance", role: "Admin", manager: "Board" }
  ];

  const sortedAudit = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const tableHeaderStyle = {
    fontFamily: FONTS.body, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    color: COLORS.border, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 16px', textAlign: 'left'
  };
  const tableCellStyle = {
    fontFamily: FONTS.body, fontSize: '14px', color: COLORS.textPrimary, padding: '16px', borderBottom: `1px solid ${COLORS.border}40`
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '24px' }}>Admin Control Panel</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Total Personnel" value={totalEmployees} />
        <StatCard label="All Expenses" value={allExpensesCount} />
        <StatCard label="Total Claimed (₹)" value={`₹${totalClaimed.toLocaleString()}`} />
        <StatCard label="Total Approved (₹)" value={`₹${totalApproved.toLocaleString()}`} accent={COLORS.accentAlt} />
      </div>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        
        {/* Rules Manager */}
        <div style={{ flex: 1, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Approval Rules Manager</h3>
          
          <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Rule Name" 
              value={newRuleName} 
              onChange={e => setNewRuleName(e.target.value)}
              style={{ flex: 2, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }} 
            />
            <select 
              value={newRuleType} 
              onChange={e => setNewRuleType(e.target.value)}
              style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}
            >
              <option value="percentage">Percentage</option>
              <option value="specific">Specific</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <button type="submit" style={{ background: COLORS.accent, border: 'none', color: COLORS.textPrimary, padding: '0 20px', borderRadius: '8px', fontFamily: FONTS.body, fontWeight: 600, cursor: 'pointer' }}>
              Add
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}40`, paddingBottom: '12px' }}>
                <div>
                  <strong style={{ fontFamily: FONTS.body, color: COLORS.textPrimary, fontSize: '15px' }}>{rule.name}</strong>
                  <div style={{ fontFamily: FONTS.body, color: COLORS.border, fontSize: '12px', marginTop: '4px' }}>
                    Type: {rule.type} &middot; {rule.value}
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleRule(rule.id)}
                  style={{
                    width: '46px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
                    background: rule.active ? COLORS.accentAlt : 'transparent',
                    border: rule.active ? 'none' : `1px solid ${COLORS.border}`
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', position: 'absolute', top: rule.active ? '3px' : '2px', transition: 'all 0.3s',
                    left: rule.active ? '24px' : '2px',
                    background: rule.active ? COLORS.cardBg : COLORS.border
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Users & Roles Table */}
        <div style={{ flex: 1, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px', overflowX: 'auto' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Users & Roles</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Department</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Manager</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((u, i) => (
                <tr key={i}>
                  <td style={{...tableCellStyle, fontWeight: 600}}>{u.name}</td>
                  <td style={tableCellStyle}>{u.dept}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      display: 'inline-block',
                      background: u.role === 'Admin' ? COLORS.border : (u.role === 'Manager' ? COLORS.accentAlt : COLORS.accent),
                      color: u.role === 'Admin' ? COLORS.cardBg : COLORS.textPrimary,
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase'
                    }}>{u.role}</span>
                  </td>
                  <td style={tableCellStyle}>{u.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Full Audit Table */}
      <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>System Audit Log</h3>
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Employee</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Amount (₹)</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedAudit.map(exp => (
              <tr key={exp.id}>
                <td style={tableCellStyle}>{exp.date}</td>
                <td style={{...tableCellStyle, fontWeight: 600}}>{exp.employee}</td>
                <td style={tableCellStyle}>{exp.category}</td>
                <td style={tableCellStyle}>{exp.description}</td>
                <td style={{...tableCellStyle, fontWeight: 700}}>₹{exp.displayAmount.toLocaleString()}</td>
                <td style={tableCellStyle}><Badge status={exp.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
