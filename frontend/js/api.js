window.EDUTECH_API_URL = window.EDUTECH_API_URL || `http://${window.location.hostname || 'localhost'}:5000/api`;
const API_BASE_URL = window.EDUTECH_API_URL;

const api = {
  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = window.auth ? auth.token() : (sessionStorage.getItem('edutechToken') || localStorage.getItem('edutechToken'));
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    let payload = {};
    try { payload = await response.json(); } catch (_) { /* non-JSON response */ }
    if (response.status === 401) {
      const isAdminPage = /^\/admin(?:-|\/|$)/i.test(location.pathname);
      const isLoginPage = /\/(?:admin-)?login\.html$/i.test(location.pathname);
      if (!options.optionalAuth && !isLoginPage && !location.pathname.endsWith('/courses.html') && !location.pathname.endsWith('/course-details.html')) {
        if (window.auth) auth.clearSession();
        const returnUrl = encodeURIComponent(location.pathname.split('/').pop() + location.search);
        location.replace(`${isAdminPage ? 'admin-login.html' : 'login.html'}?returnUrl=${returnUrl}`);
      }
    }
    if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
    return payload;
  },
  get(path, options = {}) { return this.request(path, { ...options, method: 'GET' }); },
  post(path, data, options = {}) { return this.request(path, { ...options, method: 'POST', body: JSON.stringify(data) }); },
  put(path, data, options = {}) { return this.request(path, { ...options, method: 'PUT', body: JSON.stringify(data) }); },
  patch(path, data, options = {}) { return this.request(path, { ...options, method: 'PATCH', body: JSON.stringify(data) }); },
  delete(path, options = {}) { return this.request(path, { ...options, method: 'DELETE' }); }
};
window.api = api;
