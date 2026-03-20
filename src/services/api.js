import axios from 'axios';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach auth token ───────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('barkahflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ── Response interceptor — handle 401 / errors ────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('barkahflow_token');
      localStorage.removeItem('barkahflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export const authService = {
  login:          (username, password) => api.post('/auth/login',   { username, password }),
  logout:         ()                   => api.post('/auth/logout'),
  me:             ()                   => api.get('/auth/me'),
  changePassword: (data)               => api.put('/auth/change-password', data),
};

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════
export const userService = {
  getAll:    ()           => api.get('/users'),
  getById:   (id)         => api.get(`/users/${id}`),
  create:    (data)       => api.post('/users', data),
  update:    (id, data)   => api.put(`/users/${id}`, data),
  delete:    (id)         => api.delete(`/users/${id}`),
  resetPwd:  (id, pwd)    => api.put(`/users/${id}/reset-password`, { password: pwd }),
  toggleStatus: (id)      => api.put(`/users/${id}/toggle-status`),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — PR
// ══════════════════════════════════════════════════════════════════════════════
export const prService = {
  getAll:    (params)     => api.get('/purchase/pr', { params }),
  getById:   (id)         => api.get(`/purchase/pr/${id}`),
  create:    (data)       => api.post('/purchase/pr', data),
  update:    (id, data)   => api.put(`/purchase/pr/${id}`, data),
  delete:    (id)         => api.delete(`/purchase/pr/${id}`),
  forward:   (id)         => api.put(`/purchase/pr/${id}/forward`),
  approve:   (id, note)   => api.put(`/purchase/pr/${id}/approve`, { note }),
  reject:    (id, reason) => api.put(`/purchase/pr/${id}/reject`,  { reason }),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — RFQ / Supplier Quotation
// ══════════════════════════════════════════════════════════════════════════════
export const rfqService = {
  getAll:    (params)     => api.get('/purchase/rfq', { params }),
  getById:   (id)         => api.get(`/purchase/rfq/${id}`),
  create:    (data)       => api.post('/purchase/rfq', data),
  update:    (id, data)   => api.put(`/purchase/rfq/${id}`, data),
  delete:    (id)         => api.delete(`/purchase/rfq/${id}`),
  send:      (id)         => api.post(`/purchase/rfq/${id}/send`),
  addQuote:  (id, data)   => api.post(`/purchase/rfq/${id}/quotes`, data),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — Quotation Comparison
// ══════════════════════════════════════════════════════════════════════════════
export const qcService = {
  getAll:    (params)     => api.get('/purchase/qc', { params }),
  getById:   (id)         => api.get(`/purchase/qc/${id}`),
  create:    (data)       => api.post('/purchase/qc', data),
  update:    (id, data)   => api.put(`/purchase/qc/${id}`, data),
  award:     (id, data)   => api.put(`/purchase/qc/${id}/award`, data),
  post:      (id)         => api.put(`/purchase/qc/${id}/post`),
  generatePO:(id)         => api.post(`/purchase/qc/${id}/generate-po`),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — Purchase Orders
// ══════════════════════════════════════════════════════════════════════════════
export const poService = {
  getAll:    (params)     => api.get('/purchase/po', { params }),
  getById:   (id)         => api.get(`/purchase/po/${id}`),
  create:    (data)       => api.post('/purchase/po', data),
  update:    (id, data)   => api.put(`/purchase/po/${id}`, data),
  delete:    (id)         => api.delete(`/purchase/po/${id}`),
  forward:   (id)         => api.put(`/purchase/po/${id}/forward`),
  approve:   (id, note)   => api.put(`/purchase/po/${id}/approve`, { note }),
  reject:    (id, reason) => api.put(`/purchase/po/${id}/reject`,  { reason }),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — GRN
// ══════════════════════════════════════════════════════════════════════════════
export const grnService = {
  getAll:    (params)     => api.get('/purchase/grn', { params }),
  getById:   (id)         => api.get(`/purchase/grn/${id}`),
  create:    (data)       => api.post('/purchase/grn', data),
  update:    (id, data)   => api.put(`/purchase/grn/${id}`, data),
  complete:  (id)         => api.put(`/purchase/grn/${id}/complete`),
};

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASE — Direct Purchase
// ══════════════════════════════════════════════════════════════════════════════
export const directPurchaseService = {
  getAll:    (params)     => api.get('/purchase/direct', { params }),
  getById:   (id)         => api.get(`/purchase/direct/${id}`),
  create:    (data)       => api.post('/purchase/direct', data),
  update:    (id, data)   => api.put(`/purchase/direct/${id}`, data),
  delete:    (id)         => api.delete(`/purchase/direct/${id}`),
  post:      (id)         => api.put(`/purchase/direct/${id}/post`),
};

// ══════════════════════════════════════════════════════════════════════════════
// SUPPLIERS
// ══════════════════════════════════════════════════════════════════════════════
export const supplierService = {
  getAll:    (params)     => api.get('/suppliers', { params }),
  getById:   (id)         => api.get(`/suppliers/${id}`),
  create:    (data)       => api.post('/suppliers', data),
  update:    (id, data)   => api.put(`/suppliers/${id}`, data),
  delete:    (id)         => api.delete(`/suppliers/${id}`),
  getLedger: (id, params) => api.get(`/suppliers/${id}/ledger`, { params }),
  toggleStatus: (id)      => api.put(`/suppliers/${id}/toggle-status`),
};

// ══════════════════════════════════════════════════════════════════════════════
// MATERIALS (previously Products)
// ══════════════════════════════════════════════════════════════════════════════
export const materialService = {
  getAll:    (params)     => api.get('/materials', { params }),
  getById:   (id)         => api.get(`/materials/${id}`),
  create:    (data)       => api.post('/materials', data),
  update:    (id, data)   => api.put(`/materials/${id}`, data),
  delete:    (id)         => api.delete(`/materials/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ══════════════════════════════════════════════════════════════════════════════
export const inventoryService = {
  getAll:         (params) => api.get('/inventory', { params }),
  getMovements:   (params) => api.get('/inventory/movements', { params }),
  adjustStock:    (data)   => api.post('/inventory/adjust', data),
};

// ══════════════════════════════════════════════════════════════════════════════
// INBOX / APPROVALS
// ══════════════════════════════════════════════════════════════════════════════
export const inboxService = {
  getAll:    (params)     => api.get('/inbox', { params }),
  approve:   (id, note)   => api.put(`/inbox/${id}/approve`, { note }),
  reject:    (id, reason) => api.put(`/inbox/${id}/reject`,  { reason }),
  markRead:  (id)         => api.put(`/inbox/${id}/read`),
};

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
export const notificationService = {
  getAll:    ()    => api.get('/notifications'),
  markRead:  (id)  => api.put(`/notifications/${id}/read`),
  markAllRead: ()  => api.put('/notifications/mark-all-read'),
};

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ══════════════════════════════════════════════════════════════════════════════
export const activityService = {
  getAll:  (params) => api.get('/activity-log', { params }),
  log:     (data)   => api.post('/activity-log', data),
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPANY
// ══════════════════════════════════════════════════════════════════════════════
export const companyService = {
  get:    ()       => api.get('/company'),
  update: (data)   => api.put('/company', data),
  uploadLogo: (formData) => api.post('/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════════
export const reportService = {
  supplierLedger:       (params) => api.get('/reports/supplier-ledger',       { params }),
  monthlyPurchase:      (params) => api.get('/reports/monthly-purchase',      { params }),
  purchaseSummary:      (params) => api.get('/reports/purchase-summary',      { params }),
  downloadExcel:        (type, params) => api.get(`/reports/${type}/excel`,   { params, responseType: 'blob' }),
  downloadPDF:          (type, params) => api.get(`/reports/${type}/pdf`,     { params, responseType: 'blob' }),
};

// ══════════════════════════════════════════════════════════════════════════════
// HR (for department fetch)
// ══════════════════════════════════════════════════════════════════════════════
export const hrService = {
  getDepartments: () => api.get('/hr/departments'),
  getEmployees:   (params) => api.get('/hr/employees', { params }),
};

// ══════════════════════════════════════════════════════════════════════════════
// APPROVAL STRATEGY
// ══════════════════════════════════════════════════════════════════════════════
export const approvalService = {
  getAll:    ()           => api.get('/approval-strategies'),
  getById:   (id)         => api.get(`/approval-strategies/${id}`),
  create:    (data)       => api.post('/approval-strategies', data),
  update:    (id, data)   => api.put(`/approval-strategies/${id}`, data),
  delete:    (id)         => api.delete(`/approval-strategies/${id}`),
};

export default api;
