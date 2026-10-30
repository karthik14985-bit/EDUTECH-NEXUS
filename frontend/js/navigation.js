document.addEventListener('DOMContentLoaded', async () => {
  const shellStyle = document.createElement('style');
  shellStyle.textContent = `
    .sidebar { width: 260px !important; }
    .main { margin-left: 260px !important; }
    @media (max-width: 850px) {
      .sidebar { width: 260px !important; }
      .main { margin-left: 0 !important; }
    }
  `;
  document.head.appendChild(shellStyle);
  document.querySelectorAll('[data-logout], a[href="logout"]').forEach(element => element.addEventListener('click', event => { event.preventDefault(); auth.logout(); }));
  const user = auth.token() ? await auth.requireLogin() : null;
  if (!user && auth.token()) return;
  document.querySelectorAll('[data-user-name]').forEach(element => { element.textContent = user?.fullName || ''; });
  document.querySelectorAll('[data-user-email]').forEach(element => { element.textContent = user?.email || ''; });
  document.querySelectorAll('[data-user-college]').forEach(element => { element.textContent = user?.college || ''; });
  document.querySelectorAll('[data-user-department]').forEach(element => { element.textContent = user?.department || ''; });
  document.querySelectorAll('[data-user-year]').forEach(element => { element.textContent = user?.year || ''; });
  const nameTargets = document.querySelectorAll('[data-user-name], #studentName, #sidebarName, #displayName');
  nameTargets.forEach(element => { if (user?.fullName) element.textContent = user.fullName; });
  const emailTarget = document.getElementById('displayEmail');
  if (emailTarget && user?.email) emailTarget.textContent = user.email;
  document.querySelectorAll('[data-user-xp]').forEach(element => { element.textContent = `${user?.xp || 0} XP`; });
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar a[href]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === current));
});
