function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) { container = document.createElement('div'); container.id = 'toast-container'; Object.assign(container.style, { position: 'fixed', right: '20px', bottom: '20px', zIndex: '9999' }); document.body.appendChild(container); }
  const toast = document.createElement('div'); toast.textContent = message; Object.assign(toast.style, { background: type === 'error' ? '#b94a62' : '#173353', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: '10px', padding: '12px 16px', marginTop: '8px', boxShadow: '0 8px 30px rgba(0,0,0,.3)' }); container.appendChild(toast); setTimeout(() => toast.remove(), 3500);
}
window.showToast = showToast;
