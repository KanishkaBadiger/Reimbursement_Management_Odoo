const API = 'http://localhost:8000/api';

export async function fetchUsers() {
  const res = await fetch(`${API}/users`);
  return res.json();
}

export async function fetchExpenses(userId) {
  const url = userId ? `${API}/expenses?user_id=${userId}` : `${API}/expenses`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchAllExpenses() {
  const res = await fetch(`${API}/expenses/all`);
  return res.json();
}

export async function createExpense(data) {
  const res = await fetch(`${API}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchManagerExpenses(managerId) {
  const res = await fetch(`${API}/manager/expenses?manager_id=${managerId}`);
  return res.json();
}

export async function fetchManagerHistory(managerId) {
  const res = await fetch(`${API}/manager/history?manager_id=${managerId}`);
  return res.json();
}

export async function processExpenseAction(expenseId, action, comments) {
  const res = await fetch(`${API}/expenses/${expenseId}/action`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, comments }),
  });
  return res.json();
}

export async function reportEmployee(employeeId, reason) {
  const res = await fetch(`${API}/manager/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId, reason }),
  });
  return res.json();
}

export async function overrideExpense(expenseId, newStatus, adminComment) {
  const res = await fetch(`${API}/expenses/${expenseId}/override`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_status: newStatus, admin_comment: adminComment }),
  });
  return res.json();
}

export async function updateHierarchy(userId, role, managerId) {
  const res = await fetch(`${API}/users/${userId}/hierarchy`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, manager_id: managerId }),
  });
  return res.json();
}

export async function fetchNotifications(userId) {
  const res = await fetch(`${API}/notifications?user_id=${userId}`);
  return res.json();
}

export async function markNotificationRead(notifId) {
  const res = await fetch(`${API}/notifications/${notifId}/read`, { method: 'PATCH' });
  return res.json();
}

export async function fetchRules() {
  const res = await fetch(`${API}/rules`);
  return res.json();
}

export async function createRule(data) {
  const res = await fetch(`${API}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function toggleRule(ruleId, active) {
  const res = await fetch(`${API}/rules/${ruleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  return res.json();
}
