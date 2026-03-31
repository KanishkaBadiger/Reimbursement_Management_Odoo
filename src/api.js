import { supabase } from './supabaseClient';

const API = 'http://localhost:8000/api';

async function authFetch(endpoint, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  
  // Only throw an error, do not aggressively sign out so Supabase can naturally attempt to refresh tokens without wiping the session.
  if (res.status >= 400 && res.status < 600) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      console.warn("Received 401 from backend, but preventing aggressive logout to avoid rate-limit loops.");
    }
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  
  return res.json();
}

export async function fetchMe() {
  return authFetch('/users/me');
}

export async function initCompany(data) {
  return authFetch('/auth/init', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchUsers() {
  return authFetch('/users');
}

export async function createUser(data) {
  return authFetch('/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchExpenses() {
  return authFetch('/expenses');
}

export async function fetchAllExpenses() {
  return authFetch('/expenses/all');
}

export async function createExpense(data) {
  return authFetch('/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchManagerExpenses() {
  return authFetch('/manager/expenses');
}

export async function fetchManagerHistory() {
  return authFetch('/manager/history');
}

export async function processExpenseAction(expenseId, action, comments) {
  return authFetch(`/expenses/${expenseId}/action`, {
    method: 'PATCH',
    body: JSON.stringify({ action, comments }),
  });
}

export async function reportEmployee(employeeId, reason) {
  return authFetch('/manager/report', {
    method: 'POST',
    body: JSON.stringify({ employee_id: employeeId, reason }),
  });
}

export async function overrideExpense(expenseId, newStatus, adminComment) {
  return authFetch(`/expenses/${expenseId}/override`, {
    method: 'PATCH',
    body: JSON.stringify({ new_status: newStatus, admin_comment: adminComment }),
  });
}

export async function updateHierarchy(userId, role, managerId) {
  return authFetch(`/users/${userId}/hierarchy`, {
    method: 'PATCH',
    body: JSON.stringify({ role, manager_id: managerId }),
  });
}

export async function fetchNotifications() {
  return authFetch('/notifications');
}

export async function markNotificationRead(notifId) {
  return authFetch(`/notifications/${notifId}/read`, { method: 'PATCH' });
}

export async function fetchRules() {
  return authFetch('/rules');
}

export async function createRule(data) {
  return authFetch('/rules', { method: 'POST', body: JSON.stringify(data) });
}

export async function toggleRule(ruleId, active) {
  return authFetch(`/rules/${ruleId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}
