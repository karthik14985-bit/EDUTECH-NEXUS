/**
 * EDUTECH NEXUS — Student Portal Client Core
 * Handles authentication enforcement, unified futuristic sidebar & topbar,
 * live user state, and live XP/leaderboard sync.
 */

const studentNavLinks = [
  { href: 'dashboard.html', label: 'Dashboard', icon: 'fa-solid fa-house' },
  { href: 'courses.html', label: 'Certificate Courses', icon: 'fa-solid fa-graduation-cap' },
  { href: 'internship.html', label: 'Internships', icon: 'fa-solid fa-briefcase' },
  { href: 'my-internships.html', label: 'My Internships', icon: 'fa-solid fa-file-signature' },
  { href: 'events.html', label: 'Technical Events', icon: 'fa-solid fa-calendar-star' },
  { href: 'games.html', label: 'Tech Games', icon: 'fa-solid fa-gamepad' },
  { href: 'certificate.html', label: 'Certificates', icon: 'fa-solid fa-award' },
  { href: 'discussion.html', label: 'Discussion', icon: 'fa-solid fa-comments' },
  { href: 'leaderboard.html', label: 'Leaderboard', icon: 'fa-solid fa-trophy' },
  { href: 'messages.html', label: 'Messages', icon: 'fa-solid fa-envelope' },
  { href: 'clubs.html', label: 'Technology Clubs', icon: 'fa-solid fa-users-gear' },
  { href: 'notifications.html', label: 'Notifications', icon: 'fa-solid fa-bell' },
  { href: 'myprofile.html', label: 'My Profile', icon: 'fa-solid fa-user-astronaut' },
  { href: 'settings.html', label: 'Settings', icon: 'fa-solid fa-gear' }
];

let currentUser = null;

// Universal Toast Function
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#1e293b';
  const border = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6c4cff';
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';

  toast.style.cssText = `
    background: ${bg};
    border: 1px solid ${border};
    color: #fff;
    padding: 12px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Render Unified Student Layout Shell
window.renderStudentLayout = async function(activePage, pageTitle, pageSubtitle, options = {}) {
  const isPublicPage = activePage === 'courses.html' || activePage === 'course-details.html' || options.allowPublic;

  if (isPublicPage && !auth.isAuthenticated()) {
    currentUser = null;
  } else {
    try {
      currentUser = await auth.requireLogin();
      if (!currentUser && !isPublicPage) return null;
    } catch (_) {
      currentUser = null;
      if (!isPublicPage) return null;
    }
  }

  const currentFile = location.pathname.split('/').pop() || activePage;

  // Insert Ambient Background if missing
  if (!document.querySelector('.ambient-bg')) {
    const bg = document.createElement('div');
    bg.className = 'ambient-bg';
    bg.innerHTML = `
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>
    `;
    document.body.prepend(bg);
  }

  // Sidebar Component
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'app-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo-icon">EN</div>
      <div class="sidebar-brand-text">
        <h2>EDUTECH NEXUS</h2>
        <span>Student Platform</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-category">Main Menu</div>
      ${studentNavLinks.map(link => {
        const isActive = currentFile === link.href || (activePage && activePage === link.href);
        return `
          <a href="${link.href}" class="nav-item ${isActive ? 'active' : ''}">
            <i class="${link.icon}"></i>
            <span>${link.label}</span>
          </a>
        `;
      }).join('')}
    </nav>
    <div class="sidebar-footer">
      ${currentUser ? `
        <div class="user-mini-profile">
          <div class="user-avatar-mini">
            ${currentUser.profileImageUrl ? `<img src="${currentUser.profileImageUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">` : (currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U')}
          </div>
          <div class="user-info-mini">
            <div class="user-name-mini">${currentUser.fullName || 'Student'}</div>
            <div class="user-xp-mini"><i class="fa-solid fa-bolt"></i> <span id="sidebar-user-xp">${currentUser.xp || 0} XP · Lvl ${currentUser.level || 1}</span></div>
          </div>
        </div>
        <button class="btn-logout" id="sidebar-logout-btn">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      ` : `
        <div class="user-mini-profile">
          <div class="user-avatar-mini" style="background:#1e293b;color:#38bdf8;">
            <i class="fa-solid fa-user"></i>
          </div>
          <div class="user-info-mini">
            <div class="user-name-mini">Guest Learner</div>
            <div class="user-xp-mini"><span style="color:#94a3b8;">Browse Mode</span></div>
          </div>
        </div>
        <a class="btn-logout" href="login.html" style="text-decoration:none;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-right-to-bracket"></i>
          <span>Sign In</span>
        </a>
      `}
    </div>
  `;

  // Attach Sidebar Logout if logged in
  const logoutBtn = sidebar.querySelector('#sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      auth.logout();
    };
  }

  // Topbar Component
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="mobile-menu-btn" id="mobile-toggle-btn" aria-label="Toggle Navigation">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="topbar-breadcrumb">
        EDUTECH NEXUS / <span>${pageTitle}</span>
      </div>
    </div>
    <div class="topbar-right">
      ${currentUser ? `
        <div class="live-xp-chip" title="Your live experience points and level">
          <i class="fa-solid fa-bolt"></i>
          <span id="topbar-user-xp">${currentUser.xp || 0} XP</span>
          <span class="nexus-badge badge-purple" style="padding:2px 8px;font-size:11px;">Level ${currentUser.level || 1}</span>
        </div>
        <a href="myprofile.html" style="text-decoration:none;">
          <div class="user-avatar-mini" style="cursor:pointer;" title="View Profile">
            ${currentUser.profileImageUrl ? `<img src="${currentUser.profileImageUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">` : (currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U')}
          </div>
        </a>
      ` : `
        <a href="login.html" class="btn-nexus btn-nexus-primary" style="padding:8px 16px;font-size:13px;display:flex;align-items:center;gap:6px;text-decoration:none;">
          <i class="fa-solid fa-right-to-bracket"></i> Sign In / Register
        </a>
      `}
    </div>
  `;

  // Mount layout
  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';
  appContainer.appendChild(sidebar);

  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'main-wrapper';
  mainWrapper.appendChild(topbar);

  // Content Container
  const contentArea = document.createElement('main');
  contentArea.className = 'content-area';
  contentArea.innerHTML = `
    <div class="page-header">
      <div>
        <h1>${pageTitle}</h1>
        ${pageSubtitle ? `<p>${pageSubtitle}</p>` : ''}
      </div>
      <div id="page-header-actions"></div>
    </div>
    <div id="page-content"></div>
  `;
  mainWrapper.appendChild(contentArea);
  appContainer.appendChild(mainWrapper);

  // Move existing content into #page-content if any existed
  const originalBodyChildren = Array.from(document.body.children);
  document.body.innerHTML = '';
  document.body.appendChild(appContainer);

  // Mobile menu toggle handler
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      sidebar.classList.toggle('open');
    };
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  return { currentUser, pageContent: document.getElementById('page-content'), headerActions: document.getElementById('page-header-actions') };
};

// Function to refresh current user XP dynamically
window.refreshUserXP = async function() {
  try {
    const updated = await auth.getCurrentUser();
    currentUser = updated;
    const topbarXp = document.getElementById('topbar-user-xp');
    if (topbarXp) topbarXp.textContent = `${updated.xp || 0} XP`;
    const sidebarXp = document.getElementById('sidebar-user-xp');
    if (sidebarXp) sidebarXp.textContent = `${updated.xp || 0} XP · Lvl ${updated.level || 1}`;
    return updated;
  } catch (_) {
    return null;
  }
};
