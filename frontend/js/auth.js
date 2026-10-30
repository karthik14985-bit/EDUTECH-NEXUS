const auth = {
  saveSession(payload, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    const token = payload.token || payload.accessToken;
    const user = payload.user || payload;
    storage.setItem('edutechToken', token);
    storage.setItem('edutechUser', JSON.stringify(user));
    storage.setItem('nexus_token', token);
    storage.setItem('token', token);
    otherStorage.removeItem('edutechToken');
    otherStorage.removeItem('edutechUser');
    otherStorage.removeItem('nexus_token');
    otherStorage.removeItem('token');
  },
  clearSession() {
    localStorage.removeItem('edutechToken');
    localStorage.removeItem('edutechUser');
    sessionStorage.removeItem('edutechToken');
    sessionStorage.removeItem('edutechUser');
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('token');
  },
  token() {
    return sessionStorage.getItem('edutechToken') ||
           localStorage.getItem('edutechToken') ||
           localStorage.getItem('nexus_token') ||
           localStorage.getItem('token');
  },
  user() {
    try {
      return JSON.parse(sessionStorage.getItem('edutechUser') || localStorage.getItem('edutechUser') || 'null');
    } catch (_) {
      return null;
    }
  },
  getUser() {
    return this.user();
  },
  isAuthenticated() {
    return Boolean(this.token());
  },
  async getCurrentUser() {
    const result = await api.get('/auth/me');
    const storage = sessionStorage.getItem('edutechToken') ? sessionStorage : localStorage;
    storage.setItem('edutechUser', JSON.stringify(result.user));
    return result.user;
  },
  async requireLogin() {
    if (!this.token()) {
      const returnUrl = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = `login.html?returnUrl=${returnUrl}`;
      return null;
    }
    try {
      return await this.getCurrentUser();
    } catch (_) {
      this.clearSession();
      const returnUrl = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = `login.html?returnUrl=${returnUrl}`;
      return null;
    }
  },
  async requireAdmin() {
    const returnUrl = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    if (!this.token()) {
      location.replace(`admin-login.html?returnUrl=${returnUrl}`);
      return null;
    }

    try {
      const user = await this.getCurrentUser();
      if (user.role !== 'admin') {
        location.replace('dashboard.html');
        return null;
      }
      return user;
    } catch (_) {
      this.clearSession();
      location.replace(`admin-login.html?returnUrl=${returnUrl}`);
      return null;
    }
  },
  async logout() {
    const token = this.token();
    if (token && window.api) {
      try { await api.post('/auth/logout', {}); } catch (_) {}
    }
    this.clearSession();
    location.href = 'home.html';
  }
};
window.auth = auth;
