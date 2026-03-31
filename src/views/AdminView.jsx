import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { fetchAllExpenses, fetchRules, createRule, toggleRule, overrideExpense, updateHierarchy, fetchUsers, createUser } from '../api';

export default function AdminView({ activeUser, users, setUsers, refreshNotifications }) {
  const [expenses, setExpenses] = useState([]);
  const [rules, setRules] = useState([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState('percentage');
  const [newRuleThreshold, setNewRuleThreshold] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('');
  
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Employee');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editManagerId, setEditManagerId] = useState('');

  function generateReadablePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd + '!';
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);
    const emailUsed = newEmpEmail.trim();
    try {
      const pwd = generateReadablePassword();
      const res = await createUser({
        email: emailUsed,
        password: pwd,
        name: newEmpName,
        department: newEmpDept,
        role: newEmpRole
      });
      setInviteResult({ ...res, temp_password: pwd, used_email: emailUsed });
      const refreshed = await fetchUsers();
      setUsers(refreshed);
      setNewEmpEmail('');
      setNewEmpName('');
      setNewEmpDept('');
    } catch (err) {
      alert("Failed to create user: " + err.message);
    } finally {
      setInviting(false);
    }
  };

  const load = () => {
    fetchAllExpenses().then(setExpenses);
    fetchRules().then(setRules);
  };

  useEffect(() => { load(); }, []);

  const totalEmployees = users.length;
  const allExpensesCount = expenses.length;
  const totalClaimed = expenses.reduce((acc, curr) => acc + Number(curr.display_amount), 0);
  const totalApproved = expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + Number(curr.display_amount), 0);

  const handleToggleRule = async (id, current) => {
    await toggleRule(id, !current);
    load();
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRuleName) return;
    let valueStr = `Threshold: ₹${newRuleThreshold || 0}`;
    if (newRuleCategory) valueStr += ` | Category: ${newRuleCategory}`;
    await createRule({
      name: newRuleName,
      type: newRuleType,
      value_str: valueStr,
      threshold: Number(newRuleThreshold) || 0,
      category: newRuleCategory || null,
      approver_role: 'Admin',
    });
    setNewRuleName('');
    setNewRuleThreshold('');
    setNewRuleCategory('');
    load();
  };

  const handleOverride = async (expenseId, newStatus) => {
    await overrideExpense(expenseId, newStatus, `Admin override by ${activeUser.name}`);
    load();
    refreshNotifications();
  };

  const handleSaveHierarchy = async () => {
    if (!editingUser) return;
    await updateHierarchy(editingUser, editRole || undefined, editManagerId ? Number(editManagerId) : undefined);
    const refreshed = await fetchUsers();
    setUsers(refreshed);
    setEditingUser(null);
  };

  const sortedAudit = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const tableHeaderStyle = {
    fontFamily: FONTS.body, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    color: COLORS.border, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 16px', textAlign: 'left',
  };
  const tableCellStyle = {
    fontFamily: FONTS.body, fontSize: '14px', color: COLORS.textPrimary, padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}40`,
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginBottom: '24px' }}>Admin Control Panel</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <StatCard label="Total Personnel" value={totalEmployees} />
        <StatCard label="All Expenses" value={allExpensesCount} />
        <StatCard label="Total Claimed (₹)" value={`₹${totalClaimed.toLocaleString()}`} />
        <StatCard label="Total Approved (₹)" value={`₹${totalApproved.toLocaleString()}`} accent={COLORS.accentAlt} />
      </div>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {/* Rules Manager */}
        <div style={{ flex: 1, minWidth: '340px', background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Approval Rules Manager</h3>
          <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Rule Name" value={newRuleName} onChange={e => setNewRuleName(e.target.value)}
                style={{ flex: 2, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}
              />
              <select value={newRuleType} onChange={e => setNewRuleType(e.target.value)}
                style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}
              >
                <option value="percentage">Amount Threshold</option><option value="specific">Category Lock</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(newRuleType === 'percentage' || newRuleType === 'hybrid') && (
                <input type="number" placeholder="Threshold ₹ (e.g. 5000)" value={newRuleThreshold} onChange={e => setNewRuleThreshold(e.target.value)}
                  style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}
                />
              )}
              {(newRuleType === 'specific' || newRuleType === 'hybrid') && (
                <select value={newRuleCategory} onChange={e => setNewRuleCategory(e.target.value)}
                  style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}
                >
                  <option value="">Select Category</option>
                  <option value="Travel">Travel</option><option value="Meals">Meals</option><option value="Software">Software</option><option value="Office">Office</option><option value="Other">Other</option>
                </select>
              )}
              <button type="submit" style={{ background: COLORS.accent, border: 'none', color: COLORS.textPrimary, padding: '10px 20px', borderRadius: '8px', fontFamily: FONTS.body, fontWeight: 600, cursor: 'pointer' }}>Add</button>
            </div>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}40`, paddingBottom: '12px' }}>
                <div>
                  <strong style={{ fontFamily: FONTS.body, color: COLORS.textPrimary, fontSize: '15px' }}>{rule.name}</strong>
                  <div style={{ fontFamily: FONTS.body, color: COLORS.border, fontSize: '12px', marginTop: '4px' }}>
                    {rule.type === 'percentage' && `Amount > ₹${Number(rule.threshold || 0).toLocaleString()} → requires Admin`}
                    {rule.type === 'specific' && `Category: ${rule.category || 'Any'} → always requires Admin`}
                    {rule.type === 'hybrid' && `${rule.category || 'Any'} + Amount > ₹${Number(rule.threshold || 0).toLocaleString()} → requires Admin`}
                  </div>
                </div>
                <button onClick={() => handleToggleRule(rule.id, rule.active)} style={{
                  width: '46px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
                  background: rule.active ? COLORS.accentAlt : 'transparent',
                  border: rule.active ? 'none' : `1px solid ${COLORS.border}`,
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', position: 'absolute', top: rule.active ? '3px' : '2px', transition: 'all 0.3s',
                    left: rule.active ? '24px' : '2px', background: rule.active ? COLORS.cardBg : COLORS.border,
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Onboarding */}
        <div style={{ flex: 1, minWidth: '340px', background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Invite Employee</h3>
          <form onSubmit={handleInviteEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input type="text" required placeholder="Full Name" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} style={{ width: '100%', fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <input type="email" required placeholder="Email Address" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} style={{ width: '100%', fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" required placeholder="Department" value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)} style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }} />
              <select value={newEmpRole} onChange={e => setNewEmpRole(e.target.value)} style={{ flex: 1, fontFamily: FONTS.body, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: 'transparent', outline: 'none' }}>
                <option value="Employee">Employee</option><option value="Manager">Manager</option><option value="Admin">Admin</option>
              </select>
            </div>
            <button disabled={inviting} type="submit" style={{ background: COLORS.accent, border: 'none', color: COLORS.textPrimary, padding: '10px 20px', borderRadius: '8px', fontFamily: FONTS.body, fontWeight: 600, cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1 }}>
              {inviting ? 'Inviting...' : 'Send Invite'}
            </button>
            {inviteResult && (
              <div style={{ marginTop: '10px', padding: '16px', background: `${COLORS.accentAlt}20`, borderRadius: '8px', border: `1px solid ${COLORS.accentAlt}50` }}>
                <p style={{ margin: 0, fontFamily: FONTS.body, fontSize: '14px', color: COLORS.textPrimary, fontWeight: 700 }}>✓ User created successfully!</p>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, minWidth: '70px' }}>Email:</span>
                    <code style={{ background: COLORS.cardBg, padding: '4px 8px', borderRadius: '4px', fontSize: '13px', flex: 1 }}>{inviteResult.used_email}</code>
                    <button onClick={() => copyToClipboard(inviteResult.used_email)} style={{ background: COLORS.accent, border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: FONTS.body, fontSize: '11px', fontWeight: 600 }}>Copy</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.border, minWidth: '70px' }}>Password:</span>
                    <code style={{ background: COLORS.cardBg, padding: '4px 8px', borderRadius: '4px', fontSize: '13px', flex: 1, letterSpacing: '1px' }}>{inviteResult.temp_password}</code>
                    <button onClick={() => copyToClipboard(inviteResult.temp_password)} style={{ background: COLORS.accent, border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: FONTS.body, fontSize: '11px', fontWeight: 600 }}>Copy</button>
                  </div>
                </div>
                <p style={{ margin: '8px 0 0', fontFamily: FONTS.body, fontSize: '11px', color: COLORS.border }}>Share these credentials securely with the employee.</p>
              </div>
            )}
          </form>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {/* Users & Roles */}
        <div style={{ flex: 1, minWidth: '340px', background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '30px', overflowX: 'auto' }}>
          <h3 style={{ fontFamily: FONTS.heading, color: COLORS.textPrimary, marginTop: 0, marginBottom: '20px' }}>Users & Hierarchy</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Dept</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Manager</th>
                <th style={tableHeaderStyle}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const mgr = users.find(m => m.id === u.manager_id);
                const isEditing = editingUser === u.id;
                return (
                  <tr key={u.id}>
                    <td style={{ ...tableCellStyle, fontWeight: 600 }}>{u.name}</td>
                    <td style={tableCellStyle}>{u.department}</td>
                    <td style={tableCellStyle}>
                      {isEditing ? (
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ fontFamily: FONTS.body, padding: '4px', borderRadius: '4px', border: `1px solid ${COLORS.border}` }}>
                          <option value="Employee">Employee</option><option value="Manager">Manager</option><option value="Admin">Admin</option><option value="Director">Director</option>
                        </select>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          background: u.role === 'Admin' ? COLORS.border : (u.role === 'Manager' ? COLORS.accentAlt : COLORS.accent),
                          color: u.role === 'Admin' ? COLORS.cardBg : COLORS.textPrimary,
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        }}>{u.role}</span>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      {isEditing ? (
                        <select value={editManagerId} onChange={e => setEditManagerId(e.target.value)} style={{ fontFamily: FONTS.body, padding: '4px', borderRadius: '4px', border: `1px solid ${COLORS.border}` }}>
                          <option value="">None</option>
                          {users.filter(m => m.id !== u.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      ) : (mgr?.name || '—')}
                    </td>
                    <td style={tableCellStyle}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleSaveHierarchy} style={{ background: COLORS.accentAlt, border: 'none', color: COLORS.textPrimary, padding: '4px 10px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                          <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.border, padding: '4px 10px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingUser(u.id); setEditRole(u.role); setEditManagerId(u.manager_id || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Audit with Override */}
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
              <th style={tableHeaderStyle}>Progress</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Override</th>
            </tr>
          </thead>
          <tbody>
            {sortedAudit.map(exp => (
              <tr key={exp.id}>
                <td style={tableCellStyle}>{exp.date}</td>
                <td style={{ ...tableCellStyle, fontWeight: 600 }}>{exp.employee}</td>
                <td style={tableCellStyle}>{exp.category}</td>
                <td style={tableCellStyle}>{exp.description}</td>
                <td style={{ ...tableCellStyle, fontWeight: 700 }}>₹{Number(exp.display_amount).toLocaleString()}</td>
                <td style={tableCellStyle}>
                  <div style={{ background: `${COLORS.border}30`, borderRadius: '4px', height: '6px', width: '60px' }}>
                    <div style={{ width: `${exp.progress}%`, background: COLORS.accentAlt, height: '100%', borderRadius: '4px' }} />
                  </div>
                </td>
                <td style={tableCellStyle}><Badge status={exp.status} /></td>
                <td style={tableCellStyle}>
                  {exp.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOverride(exp.id, 'approved')} style={{ background: COLORS.accentAlt, border: 'none', color: COLORS.textPrimary, padding: '4px 10px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>✓</button>
                      <button onClick={() => handleOverride(exp.id, 'rejected')} style={{ background: COLORS.border, border: 'none', color: COLORS.cardBg, padding: '4px 10px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>✗</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
