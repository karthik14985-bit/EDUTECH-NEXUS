/**
 * EDUTECH NEXUS - Unified Admin Suite & CRUD Engine
 */

// Ensure FontAwesome & Fonts are loaded
if (!document.querySelector('link[href*="font-awesome"]')) {
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(fa);
}
if (!document.querySelector('link[href*="Space+Grotesk"]')) {
  const gf = document.createElement('link');
  gf.rel = 'stylesheet';
  gf.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap';
  document.head.appendChild(gf);
}

const adminResources = {
  students: {
    title: 'Students & Users',
    endpoint: '/admin/users',
    createEndpoint: '/admin/users',
    updateEndpoint: '/admin/users',
    deleteEndpoint: '/admin/users',
    fields: [
      ['fullName', 'Full Name'],
      ['username', 'Username'],
      ['email', 'Email Address', 'email'],
      ['userType', 'User Type Persona', 'select', 'student,staff,worker,other'],
      ['registerNumber', 'Register Number / Student ID'],
      ['password', 'Password (leave blank to keep unchanged)', 'password'],
      ['phone', 'Phone Number'],
      ['college', 'College / University / Organization'],
      ['department', 'Department / Branch'],
      ['designation', 'Designation / Job Role'],
      ['year', 'Academic Year'],
      ['city', 'City'],
      ['state', 'State'],
      ['xp', 'XP Points', 'number'],
      ['level', 'Current Level', 'number'],
      ['role', 'System Role', 'select', 'student,admin'],
      ['isActive', 'Account Status', 'select', 'true,false'],
      ['bio', 'Biography', 'textarea']
    ],
    columns: ['Name', 'Username', 'Email', 'User Type', 'Register #', 'Dept / Org', 'XP', 'Level', 'Status'],
    rows: u => [
      u.fullName || '-',
      u.username || '-',
      u.email || '-',
      `<span class="audit-badge" style="background:rgba(56,189,248,0.15);color:#38bdf8;">${u.userType || 'student'}</span>`,
      u.registerNumber || u.studentId || '-',
      `${u.department || u.designation || 'N/A'} • ${u.college || u.institution || u.company || 'N/A'}`,
      `${u.xp || 0} XP`,
      `Lvl ${u.level || 1}`,
      u.isActive !== false ? '<span style="color:#34d399; font-weight:600;">Active</span>' : '<span style="color:#f43f5e; font-weight:600;">Inactive</span>'
    ],
    edit: true,
    customActions: (item) => `
      <button class="btn ${item.isActive !== false ? 'secondary' : 'btn-success'}" data-status="${item._id}" style="font-size:11px; padding:6px 10px;">
        ${item.isActive !== false ? '<i class="fa-solid fa-user-slash"></i> Deactivate' : '<i class="fa-solid fa-user-check"></i> Activate'}
      </button>
    `
  },

  courses: {
    title: 'Courses',
    endpoint: '/admin/courses',
    createEndpoint: '/admin/courses',
    updateEndpoint: '/admin/courses',
    deleteEndpoint: '/admin/courses',
    fields: [
      ['title', 'Course Title'],
      ['category', 'Category (e.g. Artificial Intelligence, Web Development, Programming)'],
      ['instructor', 'Instructor Name'],
      ['duration', 'Duration (e.g. 8 weeks)'],
      ['difficulty', 'Difficulty Level', 'select', 'Beginner,Intermediate,Advanced'],
      ['xpReward', 'Completion XP Reward', 'number'],
      ['thumbnail', 'Thumbnail / Image URL'],
      ['status', 'Status', 'select', 'active,inactive'],
      ['description', 'Course Description', 'textarea'],
      ['syllabus', 'Syllabus Summary', 'textarea']
    ],
    columns: ['Course Title', 'Category', 'Instructor', 'Duration', 'Lessons', 'XP', 'Status'],
    rows: c => [
      c.title || '-',
      c.category || '-',
      c.instructor || '-',
      c.duration || '-',
      `${c.lessons ? c.lessons.length : 0} Lessons`,
      `${c.xpReward || 0} XP`,
      c.status === 'active' ? '<span style="color:#34d399;">Active</span>' : '<span style="color:#f59e0b;">Inactive</span>'
    ],
    edit: true,
    customActions: (item) => `
      <button class="btn secondary" data-manage-lessons="${item._id}" style="font-size:11px; padding:6px 10px;" title="Manage lessons & YouTube videos">
        <i class="fa-solid fa-play"></i> Lessons (${item.lessons ? item.lessons.length : 0})
      </button>
    `
  },

  internships: {
    title: 'Internships',
    endpoint: '/admin/internships',
    createEndpoint: '/admin/internships',
    updateEndpoint: '/admin/internships',
    deleteEndpoint: '/admin/internships',
    fields: [
      ['title', 'Internship Title'],
      ['company', 'Company Name'],
      ['category', 'Category / Domain'],
      ['duration', 'Duration (e.g. 3 Months)'],
      ['workMode', 'Work Mode', 'select', 'Remote,Hybrid,On-site'],
      ['location', 'Location (e.g. Chennai, India)'],
      ['type', 'Type', 'select', 'Free,Paid'],
      ['stipend', 'Stipend / Benefits (e.g. ₹15,000 / month)'],
      ['fee', 'Registration / Track Fee (0 for Free)', 'number'],
      ['deadline', 'Application Deadline', 'date'],
      ['companyWebsite', 'Official Company Website'],
      ['companyEmail', 'Inquiries Email'],
      ['eligibility', 'Eligibility Criteria'],
      ['applicationMethod', 'Application Method', 'select', 'Online Application Form,Direct Website,Email Submission'],
      ['companyLogo', 'Company Logo URL'],
      ['status', 'Status', 'select', 'active,inactive'],
      ['description', 'Role Description & Scope', 'textarea']
    ],
    columns: ['Title', 'Company', 'Mode', 'Type', 'Stipend / Fee', 'Location', 'Status'],
    rows: i => [
      i.title || '-',
      i.company || '-',
      i.workMode || i.mode || '-',
      `<span style="color:${i.type === 'Free' ? '#34d399' : '#38bdf8'}; font-weight:600;">${i.type || 'Free'}</span>`,
      i.type === 'Paid' ? `Fee: ₹${i.fee || i.totalFee || 0}` : (i.stipend || 'Competitive'),
      i.location || '-',
      i.status === 'active' ? '<span style="color:#34d399;">Active</span>' : '<span style="color:#f59e0b;">Inactive</span>'
    ],
    edit: true
  },

  companies: {
    title: 'Companies & Partners',
    endpoint: '/admin/companies',
    createEndpoint: '/admin/companies',
    updateEndpoint: '/admin/companies',
    deleteEndpoint: '/admin/companies',
    fields: [
      ['name', 'Company Name'],
      ['industry', 'Industry / Domain (e.g. IT Services, Cloud, AI)'],
      ['website', 'Official Website URL'],
      ['email', 'Official / Recruitment Email'],
      ['phone', 'Contact Telephone'],
      ['location', 'Headquarters / Locations'],
      ['companySize', 'Company Size (e.g. 100,000+ Employees)'],
      ['verificationStatus', 'Verification Status', 'select', 'Verified,Example Record,Pending'],
      ['logo', 'Company Logo URL'],
      ['about', 'Short Tagline / Summary'],
      ['description', 'Full Corporate Description', 'textarea']
    ],
    columns: ['Company Name', 'Industry', 'Location', 'Website', 'Size', 'Status'],
    rows: c => [
      `<strong>${c.name}</strong>`,
      c.industry || '-',
      c.location || '-',
      c.website ? `<a href="${c.website}" target="_blank" style="color:#38bdf8;text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visit</a>` : '-',
      c.companySize || '-',
      c.verificationStatus === 'Verified' 
        ? '<span style="color:#10b981;font-weight:600;"><i class="fa-solid fa-circle-check"></i> Verified</span>' 
        : '<span style="color:#f59e0b;"><i class="fa-solid fa-triangle-exclamation"></i> Example Record</span>'
    ],
    edit: true
  },

  'course-registrations': {
    title: 'Course Registrations & Enrollments',
    endpoint: '/admin/course-registrations',
    columns: ['Student Name', 'Course', 'User Type', 'Institution / Org', 'Department', 'Registered', 'Expires', 'Progress', 'Certificate'],
    rows: r => [
      `<strong>${r.fullName || r.studentId?.fullName || 'Student'}</strong>`,
      r.courseId?.title || r.course?.title || 'Technical Course',
      `<span class="audit-badge" style="background:rgba(128,101,255,0.15);color:#a694ff;">${r.userType || 'student'}</span>`,
      r.institution || r.company || r.studentId?.institution || '-',
      r.department || r.studentId?.department || '-',
      r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : '-',
      r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '-',
      `<div style="display:flex;align-items:center;gap:6px;"><div style="width:60px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;"><div style="width:${r.progress || 0}%;height:100%;background:${(r.progress || 0) >= 90 ? '#10b981' : '#38bdf8'};"></div></div><span>${r.progress || 0}%</span></div>`,
      r.certificateClaimed 
        ? '<span style="color:#10b981;font-weight:600;">✓ Claimed</span>' 
        : (r.certificateEligible ? '<span style="color:#fbbf24;">Eligible (≥90%)</span>' : '<span style="color:#8fa3bf;">In Progress</span>')
    ],
    edit: false
  },

  'internship-applications': {
    title: 'Internship Applications',
    endpoint: '/admin/internship-applications',
    columns: ['Applicant', 'Role', 'Company', 'Institution / Org', 'Resume', 'Social Links', 'Applied Date', 'Current Status', 'Update Status'],
    rows: a => [
      `<div><strong>${a.fullName || a.studentId?.fullName || 'Applicant'}</strong><div style="font-size:11px;color:#8fa3bf;">${a.email || a.studentId?.email || ''}</div></div>`,
      a.internshipId?.title || a.internship?.title || 'Internship',
      a.internshipId?.company || a.company || '-',
      `${a.institution || a.college || a.company || '-'} (${a.department || a.jobRole || '-'})`,
      a.resumeUrl ? `<a href="${a.resumeUrl}" target="_blank" style="color:#38bdf8;text-decoration:none;font-weight:600;"><i class="fa-solid fa-file-pdf"></i> View PDF</a>` : '<span style="color:#64748b;">None</span>',
      `<div style="display:flex;gap:8px;">${a.githubUrl ? `<a href="${a.githubUrl}" target="_blank" title="GitHub" style="color:#cbd5e1;"><i class="fa-brands fa-github"></i></a>` : ''} ${a.linkedinUrl ? `<a href="${a.linkedinUrl}" target="_blank" title="LinkedIn" style="color:#38bdf8;"><i class="fa-brands fa-linkedin"></i></a>` : ''}</div>`,
      new Date(a.appliedAt || a.createdAt).toLocaleDateString(),
      `<span class="audit-badge" style="background:${a.status === 'Selected' ? 'rgba(16,185,129,0.2);color:#34d399' : a.status === 'Under Review' ? 'rgba(56,189,248,0.2);color:#38bdf8' : a.status === 'Rejected' ? 'rgba(239,68,68,0.2);color:#f87171' : 'rgba(168,85,247,0.2);color:#c084fc'};">${a.status || 'Applied'}</span>`,
      `<select data-update-status="${a._id}" style="background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;">
        <option value="Applied" ${a.status === 'Applied' ? 'selected' : ''}>Applied</option>
        <option value="Under Review" ${a.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
        <option value="Shortlisted" ${a.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
        <option value="Interview" ${a.status === 'Interview' ? 'selected' : ''}>Interview</option>
        <option value="Selected" ${a.status === 'Selected' ? 'selected' : ''}>Selected</option>
        <option value="Rejected" ${a.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
      </select>`
    ],
    edit: false
  },

  certificates: {
    title: 'Issued Certificates',
    endpoint: '/admin/certificates',
    deleteEndpoint: '/admin/certificates',
    columns: ['Certificate ID', 'Recipient', 'Email', 'Course', 'Issued Date', 'XP Awarded', 'Verification', 'Action'],
    rows: c => [
      `<code style="color:#fbbf24; font-weight:700;">${c.certificateId || '-'}</code>`,
      c.user?.fullName || c.studentName || 'Student',
      c.user?.email || '-',
      c.course?.title || c.courseName || '-',
      c.completionDate ? new Date(c.completionDate).toLocaleDateString() : '-',
      `+${c.awardedXP || c.xpAwarded || 150} XP`,
      `<a href="verify-certificate.html?id=${encodeURIComponent(c.certificateId || '')}" target="_blank" style="color:#38bdf8; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Verify</a>`,
      `<button class="btn danger" data-revoke-cert="${c._id}" style="font-size:11px;padding:4px 8px;"><i class="fa-solid fa-ban"></i> Revoke</button>`
    ],
    edit: false
  },

  events: {
    title: 'Technical Events',
    endpoint: '/admin/events',
    createEndpoint: '/admin/events',
    updateEndpoint: '/admin/events',
    deleteEndpoint: '/admin/events',
    fields: [
      ['title', 'Event Title'],
      ['category', 'Category', 'select', 'College Events,Hackathons,Workshops,Seminars,Coding Competitions,Industry Events,Student Technology Events'],
      ['organizer', 'Organizer Name / Body'],
      ['date', 'Event Date', 'date'],
      ['time', 'Time (e.g. 10:00 AM)'],
      ['venue', 'Venue / Platform'],
      ['mode', 'Mode', 'select', 'Online,Offline,Hybrid'],
      ['registrationDeadline', 'Registration Deadline', 'date'],
      ['registrationLink', 'External Registration Link (Optional)'],
      ['xpReward', 'Participation XP', 'number'],
      ['status', 'Status', 'select', 'active,completed,upcoming'],
      ['description', 'Event Details & Rules', 'textarea']
    ],
    columns: ['Event Title', 'Category', 'Organizer', 'Date', 'Venue', 'Participants', 'XP', 'Status'],
    rows: e => [
      e.title || '-',
      e.category || '-',
      e.organizer || '-',
      e.date ? new Date(e.date).toLocaleDateString() : '-',
      `${e.venue || '-'} (${e.mode || 'Online'})`,
      `${e.participants ? e.participants.length : 0}`,
      `${e.xpReward || 0} XP`,
      e.status === 'active' ? '<span style="color:#34d399;">Active</span>' : '<span style="color:#a78bfa;">Upcoming</span>'
    ],
    edit: true
  },

  games: {
    title: 'Tech Games & Challenges',
    endpoint: '/admin/games',
    createEndpoint: '/admin/games',
    updateEndpoint: '/admin/games',
    deleteEndpoint: '/admin/games',
    fields: [
      ['title', 'Challenge Title'],
      ['gameType', 'Challenge Type', 'select', 'code-challenge,debugging,quiz,code-sprint,logic-master,bug-hunter,sql-quest,ai-arena,memory-pattern,web-design,cyber-defender,network-builder'],
      ['category', 'Category (e.g. Algorithms, JavaScript, Python)'],
      ['difficulty', 'Difficulty', 'select', 'Beginner,Intermediate,Advanced'],
      ['xpReward', 'XP Reward', 'number'],
      ['timeLimit', 'Time Limit (seconds)', 'number'],
      ['status', 'Status', 'select', 'active,inactive'],
      ['description', 'Problem Statement & Constraints', 'textarea']
    ],
    columns: ['Title', 'Type', 'Category', 'Difficulty', 'Questions', 'Completions', 'XP', 'Status'],
    rows: g => [
      g.title || '-',
      g.gameType || 'quiz',
      g.category || '-',
      g.difficulty || '-',
      g.questionCount ?? 0,
      g.completionCount ?? 0,
      `${g.xpReward || 0} XP`,
      g.status === 'active' ? '<span style="color:#34d399;">Active</span>' : '<span style="color:#f43f5e;">Inactive</span>'
    ],
    edit: true
  },

  discussions: {
    title: 'Community Discussions',
    endpoint: '/discussions',
    deleteEndpoint: '/discussions',
    columns: ['Title', 'Author', 'Category', 'Likes', 'Date'],
    rows: d => [
      d.title || '-',
      d.author?.fullName || 'Anonymous',
      d.category || 'General',
      d.likes ? d.likes.length : 0,
      d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'
    ],
    edit: false
  },

  clubs: {
    title: 'Technology Clubs',
    endpoint: '/admin/clubs',
    createEndpoint: '/admin/clubs',
    updateEndpoint: '/admin/clubs',
    deleteEndpoint: '/admin/clubs',
    fields: [
      ['name', 'Club Name'],
      ['category', 'Domain / Track (e.g. AI, Web, Cloud)'],
      ['maxMembers', 'Max Member Capacity', 'number'],
      ['status', 'Status', 'select', 'active,inactive'],
      ['description', 'Club Vision and Activities', 'textarea']
    ],
    columns: ['Club Name', 'Category', 'Members', 'Capacity', 'Status'],
    rows: cl => [
      cl.name || '-',
      cl.category || '-',
      `${cl.members ? cl.members.length : 0} enrolled`,
      cl.maxMembers || 100,
      cl.status === 'active' ? '<span style="color:#34d399;">Active</span>' : '<span style="color:#f59e0b;">Inactive</span>'
    ],
    edit: true
  },

  messages: {
    title: 'Platform Messages',
    endpoint: '/admin/messages',
    deleteEndpoint: '/admin/messages',
    columns: ['Sender', 'Receiver', 'Subject', 'Message Snippet', 'Sent At', 'Status'],
    rows: m => [
      m.sender?.fullName || 'System',
      m.receiver?.fullName || 'Student',
      m.subject || 'Direct Message',
      (m.message || '').slice(0, 40) + '...',
      m.createdAt ? new Date(m.createdAt).toLocaleString() : '-',
      m.read ? '<span style="color:#34d399;">Read</span>' : '<span style="color:#38bdf8;">Unread</span>'
    ],
    edit: false
  },

  leaderboard: {
    title: 'Global Student Leaderboard',
    endpoint: '/leaderboard',
    columns: ['Rank', 'Student Name', 'Username', 'Department', 'College', 'Level', 'XP Points'],
    rows: (u, idx) => [
      idx === 0 ? '🥇 Rank 1' : idx === 1 ? '🥈 Rank 2' : idx === 2 ? '🥉 Rank 3' : `Rank ${idx + 1}`,
      u.fullName || '-',
      `@${u.username || 'user'}`,
      u.department || 'General',
      u.college || 'N/A',
      `Level ${u.level || 1}`,
      `<strong style="color:#f59e0b;">${(u.xp || 0).toLocaleString()} XP</strong>`
    ],
    edit: false
  },

  activity: {
    title: 'Audit Logs & Administrative Actions',
    endpoint: '/admin/audit-logs',
    columns: ['Administrator', 'Action', 'Target Resource', 'Target ID', 'Timestamp'],
    rows: l => [
      l.admin?.fullName || 'System Admin',
      `<span style="color:${l.action === 'create' ? '#34d399' : l.action === 'delete' ? '#f43f5e' : '#38bdf8'}; font-weight:700; text-transform:uppercase; font-size:11px;">${l.action}</span>`,
      `<code style="background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">${l.targetType || 'entity'}</code>`,
      `#${l.targetId ? String(l.targetId).slice(-6) : '-'}`,
      l.timestamp || l.createdAt ? new Date(l.timestamp || l.createdAt).toLocaleString() : '-'
    ],
    edit: false
  }
};

let adminUser = null;
const byId = id => document.getElementById(id);

function toast(message, error = false) {
  const node = document.createElement('div');
  node.className = `toast${error ? ' error' : ''}`;
  node.innerHTML = `${error ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>'} ${message}`;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3500);
}

function nav(page) {
  const navItems = [
    ['admin-dashboard.html', 'Dashboard', '<i class="fa-solid fa-chart-pie"></i>'],
    ['admin-students.html', 'Users & Students', '<i class="fa-solid fa-users"></i>'],
    ['admin-courses.html', 'Courses & Lessons', '<i class="fa-solid fa-book-open"></i>'],
    ['admin-course-registrations.html', 'Course Registrations', '<i class="fa-solid fa-clipboard-user"></i>'],
    ['admin-certificates.html', 'Certificates', '<i class="fa-solid fa-certificate"></i>'],
    ['admin-internships.html', 'Internships', '<i class="fa-solid fa-briefcase"></i>'],
    ['admin-companies.html', 'Companies & Partners', '<i class="fa-solid fa-building"></i>'],
    ['admin-internship-applications.html', 'Applications Tracking', '<i class="fa-solid fa-file-signature"></i>'],
    ['admin-events.html', 'Events', '<i class="fa-solid fa-calendar-days"></i>'],
    ['admin-games.html', 'Games', '<i class="fa-solid fa-gamepad"></i>'],
    ['admin-discussions.html', 'Discussions', '<i class="fa-solid fa-comments"></i>'],
    ['admin-clubs.html', 'Clubs', '<i class="fa-solid fa-people-group"></i>'],
    ['admin-messages.html', 'Messages', '<i class="fa-solid fa-envelope"></i>'],
    ['admin-leaderboard.html', 'Leaderboard', '<i class="fa-solid fa-trophy"></i>'],
    ['admin-activity.html', 'Audit Trail', '<i class="fa-solid fa-clock-rotate-left"></i>'],
    ['admin-settings.html', 'Settings', '<i class="fa-solid fa-sliders"></i>']
  ];

  return `
    <aside class="admin-sidebar">
      <div class="brand">
        EDUTECH NEXUS
        <small>ADMIN CONTROL CENTER</small>
      </div>
      <nav class="admin-nav">
        ${navItems.map(([href, label, icon]) => `
          <a class="${page === href ? 'active' : ''}" href="${href}">
            ${icon} &nbsp;${label}
          </a>
        `).join('')}
        <a class="logout" href="#" data-admin-logout>
          <i class="fa-solid fa-arrow-right-from-bracket"></i> &nbsp;Logout
        </a>
      </nav>
    </aside>
  `;
}

function layout(page, title, subtitle, body) {
  document.body.innerHTML = `
    <div class="admin-shell">
      ${nav(page)}
      <main class="admin-main">
        <header class="topbar">
          <div>
            <div class="eyebrow"><i class="fa-solid fa-shield-halved"></i> EDUTECH NEXUS / ADMIN SUITE</div>
            <h1>${title}</h1>
            <p>${subtitle}</p>
          </div>
          <div class="user-chip" id="admin-user"><i class="fa-solid fa-circle-user"></i> Loading administrator...</div>
        </header>
        ${body}
      </main>
    </div>
  `;

  byId('admin-user').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${adminUser ? `${adminUser.fullName} · Administrator` : 'Administrator'}`;
  document.querySelector('[data-admin-logout]').onclick = e => {
    e.preventDefault();
    auth.logout();
  };
}

async function initAdmin() {
  adminUser = await auth.requireAdmin();
  return !!adminUser;
}

function inputField(field, value = '') {
  const [key, label, type, options] = field;
  if (type === 'textarea') {
    return `<label class="full" style="display:grid; gap:6px; margin-bottom:12px;">
      <span style="font-size:12px; color:#b9c8dc; font-weight:600;">${label}</span>
      <textarea name="${key}" rows="4" style="background:#081626; color:#fff; border:1px solid var(--line); border-radius:8px; padding:10px;">${value || ''}</textarea>
    </label>`;
  }
  if (type === 'select') {
    return `<label style="display:grid; gap:6px; margin-bottom:12px;">
      <span style="font-size:12px; color:#b9c8dc; font-weight:600;">${label}</span>
      <select name="${key}" style="background:#081626; color:#fff; border:1px solid var(--line); border-radius:8px; padding:10px;">
        ${options.split(',').map(o => `<option value="${o}" ${String(value) === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </label>`;
  }
  return `<label style="display:grid; gap:6px; margin-bottom:12px;">
    <span style="font-size:12px; color:#b9c8dc; font-weight:600;">${label}</span>
    <input name="${key}" type="${type || 'text'}" value="${value ?? ''}" ${key === 'title' || key === 'name' || key === 'fullName' ? 'required' : ''} style="background:#081626; color:#fff; border:1px solid var(--line); border-radius:8px; padding:10px;">
  </label>`;
}

function formModal(resource, item, resourceKey) {
  const fields = resource.fields || [];
  byId('modal').innerHTML = `
    <div class="modal-card">
      <div class="modal-head" style="margin-bottom:18px;">
        <h2 style="margin:0; font-family:'Space Grotesk'; font-size:20px;">${item ? 'Edit' : 'Add New'} ${resource.title.replace(/s$/, '')}</h2>
        <button type="button" data-close style="background:none; border:none; color:#8fa3bf; font-size:24px; cursor:pointer;">&times;</button>
      </div>
      <form id="resource-form" class="form-grid">
        ${fields.map(f => inputField(f, item?.[f[0]])).join('')}
        <div class="full actions" style="margin-top:16px; display:flex; gap:12px; justify-content:flex-end;">
          <button class="btn secondary" type="button" data-close>Cancel</button>
          <button class="btn" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
        </div>
      </form>
    </div>
  `;
  byId('modal').hidden = false;

  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => byId('modal').hidden = true);

  byId('resource-form').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    for (const f of fields) {
      if (f[2] === 'number') data[f[0]] = Number(data[f[0]] || 0);
      if (f[0] === 'isActive') data.isActive = data.isActive === 'true';
    }
    // Clean blank password on update
    if (item && !data.password) {
      delete data.password;
    }

    try {
      const endpoint = item ? (resource.updateEndpoint || resource.endpoint) : (resource.createEndpoint || resource.endpoint);
      if (item) {
        await api.put(`${endpoint}/${item._id}`, data);
      } else {
        await api.post(endpoint, data);
      }
      byId('modal').hidden = true;
      toast('Record saved successfully!');
      loadResource(resourceKey);
    } catch (error) {
      toast(error.message, true);
    }
  };
}

// Modal for managing lessons of a course
async function openLessonManagerModal(courseId, resourceKey) {
  try {
    const res = await api.get(`/courses/${courseId}`);
    if (!res.success || !res.course) throw new Error(res.message || 'Course not found');

    const course = res.course;
    const lessons = course.lessons || [];

    byId('modal').innerHTML = `
      <div class="modal-card" style="max-width:850px;max-height:90vh;overflow-y:auto;">
        <div class="modal-head" style="margin-bottom:18px;">
          <div>
            <h2 style="margin:0; font-family:'Space Grotesk'; font-size:20px;">Manage Course Lessons</h2>
            <div style="font-size:13px;color:#38bdf8;margin-top:2px;">${course.title}</div>
          </div>
          <button type="button" data-close style="background:none; border:none; color:#8fa3bf; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <!-- Add New Lesson Form -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:10px;padding:18px;margin-bottom:24px;">
          <h4 style="font-size:15px;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-plus" style="color:#10b981;"></i> Add New Lesson
          </h4>
          <form id="add-lesson-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="grid-column:1/-1;">
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">Lesson Title *</label>
              <input type="text" id="lesson-title" required placeholder="e.g. Lesson 9: Advanced Neural Architectures" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
            </div>

            <!-- Video Delivery Format Selector -->
            <div>
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">Video Delivery Type *</label>
              <select id="lesson-video-type" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
                <option value="youtube">YouTube Embed (URL / Video ID)</option>
                <option value="local">Local Video File (MP4/WebM Upload)</option>
                <option value="url">External Video URL (Direct MP4/WebM)</option>
              </select>
            </div>

            <div>
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">Duration</label>
              <input type="text" id="lesson-duration" value="20 mins" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
            </div>

            <!-- YouTube Input Group -->
            <div id="group-youtube" style="grid-column:1/-1;">
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">YouTube URL or Video ID</label>
              <input type="text" id="lesson-youtube" placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
            </div>

            <!-- Local Video Upload Group -->
            <div id="group-local" style="grid-column:1/-1;display:none;">
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">Upload Local Video File (MP4, WebM)</label>
              <div style="display:flex;gap:10px;align-items:center;">
                <input type="file" id="lesson-file-input" accept="video/mp4,video/webm,video/quicktime" style="background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:6px 10px;flex:1;">
                <button type="button" id="btn-upload-local-video" class="btn secondary" style="white-space:nowrap;padding:8px 14px;">
                  <i class="fa-solid fa-cloud-arrow-up"></i> Upload
                </button>
              </div>
              <input type="hidden" id="lesson-video-file">
              <div id="upload-status" style="font-size:12px;margin-top:6px;color:#38bdf8;"></div>
            </div>

            <!-- External Video URL Group -->
            <div id="group-url" style="grid-column:1/-1;display:none;">
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">External Direct Video Stream URL</label>
              <input type="url" id="lesson-video-url" placeholder="https://example.com/videos/lesson.mp4" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
            </div>

            <div style="grid-column:1/-1;">
              <label style="font-size:12px;color:#b9c8dc;display:block;margin-bottom:4px;">Short Description</label>
              <input type="text" id="lesson-desc" placeholder="Overview of the lesson objectives and topics" style="width:100%;background:#081626;color:#fff;border:1px solid var(--line);border-radius:6px;padding:8px 10px;">
            </div>
            <div style="grid-column:1/-1;text-align:right;">
              <button type="submit" class="btn" style="padding:8px 18px;font-size:13px;">
                <i class="fa-solid fa-plus"></i> Save Lesson
              </button>
            </div>
          </form>
        </div>

        <!-- Existing Lessons List with Reordering -->
        <h4 style="font-size:15px;color:#fff;margin-bottom:12px;">Existing Lessons (${lessons.length})</h4>
        <div id="admin-lessons-list" style="display:flex;flex-direction:column;gap:10px;">
          ${lessons.length === 0 ? '<div style="color:var(--muted);text-align:center;padding:20px;">No lessons created yet.</div>' : lessons.map((l, idx) => {
            const vType = l.videoType || (l.videoFile ? 'local' : (l.videoUrl ? 'url' : 'youtube'));
            let badge = '<span style="color:#f43f5e;"><i class="fa-brands fa-youtube"></i> YouTube</span>';
            if (vType === 'local') badge = '<span style="color:#10b981;"><i class="fa-solid fa-file-video"></i> Local MP4</span>';
            else if (vType === 'url') badge = '<span style="color:#38bdf8;"><i class="fa-solid fa-link"></i> External URL</span>';

            return `
              <div style="background:#081626;border:1px solid var(--line);border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <button type="button" class="btn secondary" data-move-up="${idx}" style="padding:4px 8px;font-size:11px;" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
                  <button type="button" class="btn secondary" data-move-down="${idx}" style="padding:4px 8px;font-size:11px;" ${idx === lessons.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
                </div>
                <div style="flex:1;">
                  <strong style="color:#fff;font-size:14px;">#${idx + 1} - ${l.title}</strong>
                  <div style="font-size:12px;color:#8fa3bf;margin-top:2px;display:flex;gap:12px;align-items:center;">
                    <span>${badge}</span>
                    <span><i class="fa-regular fa-clock"></i> ${l.duration || '15 mins'}</span>
                    ${l.videoFile ? `<span style="font-size:11px;color:#64748b;">${l.videoFile}</span>` : ''}
                  </div>
                </div>
                <div>
                  <button class="btn danger" data-del-lesson="${l._id}" style="font-size:11px;padding:5px 10px;">
                    <i class="fa-solid fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:20px;border-top:1px solid var(--line);padding-top:14px;text-align:right;">
          <button class="btn secondary" type="button" data-close>Close</button>
        </div>
      </div>
    `;

    byId('modal').hidden = false;
    document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => byId('modal').hidden = true);

    // Dynamic Video Delivery Type Toggle
    const vTypeSelect = byId('lesson-video-type');
    const grpYt = byId('group-youtube');
    const grpLoc = byId('group-local');
    const grpUrl = byId('group-url');

    vTypeSelect.onchange = () => {
      const val = vTypeSelect.value;
      grpYt.style.display = val === 'youtube' ? 'block' : 'none';
      grpLoc.style.display = val === 'local' ? 'block' : 'none';
      grpUrl.style.display = val === 'url' ? 'block' : 'none';
    };

    // Upload Local Video File Handler
    byId('btn-upload-local-video').onclick = async () => {
      const fileInput = byId('lesson-file-input');
      const statusDiv = byId('upload-status');
      if (!fileInput.files || !fileInput.files[0]) {
        toast('Please select a video file first (MP4 or WebM).', true);
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('video', file);

      statusDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading video to /videos/uploads/...';

      try {
        const token = localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');
        const uploadRes = await fetch(`${window.EDUTECH_API_URL || '/api'}/admin/upload-video`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await uploadRes.json();
        if (!data.success) throw new Error(data.message || 'Upload failed');

        byId('lesson-video-file').value = data.videoFile;
        statusDiv.innerHTML = `<span style="color:#10b981;">✓ Uploaded: ${data.videoFile} (${Math.round(data.size / (1024*1024) * 10)/10} MB)</span>`;
        toast('Local video uploaded successfully!');
      } catch (err) {
        statusDiv.innerHTML = `<span style="color:#f43f5e;">Upload failed: ${err.message}</span>`;
        toast(err.message, true);
      }
    };

    // Reorder Handlers
    byId('modal').querySelectorAll('[data-move-up]').forEach(btn => {
      btn.onclick = async () => {
        const idx = Number(btn.dataset.moveUp);
        if (idx <= 0) return;
        const newOrder = [...lessons];
        const temp = newOrder[idx - 1];
        newOrder[idx - 1] = newOrder[idx];
        newOrder[idx] = temp;
        try {
          await api.put(`/admin/courses/${courseId}/reorder-lessons`, { lessonIds: newOrder.map(l => l._id) });
          toast('Lessons reordered successfully.');
          openLessonManagerModal(courseId, resourceKey);
        } catch (e) {
          toast(e.message, true);
        }
      };
    });

    byId('modal').querySelectorAll('[data-move-down]').forEach(btn => {
      btn.onclick = async () => {
        const idx = Number(btn.dataset.moveDown);
        if (idx >= lessons.length - 1) return;
        const newOrder = [...lessons];
        const temp = newOrder[idx + 1];
        newOrder[idx + 1] = newOrder[idx];
        newOrder[idx] = temp;
        try {
          await api.put(`/admin/courses/${courseId}/reorder-lessons`, { lessonIds: newOrder.map(l => l._id) });
          toast('Lessons reordered successfully.');
          openLessonManagerModal(courseId, resourceKey);
        } catch (e) {
          toast(e.message, true);
        }
      };
    });

    // Delete lesson handler
    byId('modal').querySelectorAll('[data-del-lesson]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Are you sure you want to remove this lesson?')) return;
        try {
          await api.delete(`/admin/courses/${courseId}/lessons/${btn.dataset.delLesson}`);
          toast('Lesson deleted successfully.');
          openLessonManagerModal(courseId, resourceKey);
        } catch (err) {
          toast(err.message, true);
        }
      };
    });

    // Add lesson submit handler
    byId('add-lesson-form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const vType = vTypeSelect.value;
        let ytVal = byId('lesson-youtube').value.trim();
        if (ytVal.includes('v=')) ytVal = ytVal.split('v=')[1].split('&')[0];
        if (ytVal.includes('youtu.be/')) ytVal = ytVal.split('youtu.be/')[1].split('?')[0];

        const videoFile = byId('lesson-video-file').value.trim();
        const videoUrl = byId('lesson-video-url').value.trim();

        await api.post(`/admin/courses/${courseId}/lessons`, {
          title: byId('lesson-title').value.trim(),
          videoType: vType,
          youtubeVideoId: vType === 'youtube' ? ytVal : undefined,
          videoFile: vType === 'local' ? videoFile : undefined,
          videoUrl: vType === 'url' ? videoUrl : undefined,
          duration: byId('lesson-duration').value.trim() || '20 mins',
          description: byId('lesson-desc').value.trim(),
          content: 'Comprehensive lesson curriculum and notes.'
        });

        toast('New lesson added successfully!');
        openLessonManagerModal(courseId, resourceKey);
        loadResource(resourceKey);
      } catch (err) {
        toast(err.message, true);
      }
    };

  } catch (err) {
    toast(err.message, true);
  }
}

async function loadResource(key) {
  const resource = adminResources[key];
  if (!resource) return;

  const tableContainer = byId('table');
  tableContainer.innerHTML = '<div class="empty" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading records from MongoDB...</div>';

  try {
    const result = await api.get(resource.endpoint);
    const list = result[key] || result.users || result.students || result.courses || result.internships || result.companies || result.applications || result.registrations || result.enrollments || result.events || result.games || result.certificates || result.clubs || result.discussions || result.messages || result.logs || result.leaderboard || [];
    
    const search = (byId('search')?.value || '').toLowerCase();
    const filtered = list.filter(item => JSON.stringify(item).toLowerCase().includes(search));

    if (!filtered.length) {
      tableContainer.innerHTML = '<div class="empty" style="text-align:center; padding:30px;">No matching records found in MongoDB.</div>';
      byId('count').textContent = '0 records';
      return;
    }

    byId('count').textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

    const rows = filtered.map((item, index) => {
      const renderedCols = resource.rows(item, index).map(val => `<td>${val}</td>`).join('');
      const customActionHtml = resource.customActions ? resource.customActions(item) : '';
      const editButton = resource.edit ? `<button class="btn secondary" data-edit="${item._id}" style="font-size:11px; padding:6px 10px;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>` : '';
      const deleteButton = resource.deleteEndpoint ? `<button class="btn danger" data-delete="${item._id}" style="font-size:11px; padding:6px 10px;"><i class="fa-solid fa-trash"></i> Delete</button>` : '';

      return `
        <tr>
          ${renderedCols}
          <td class="actions" style="white-space:nowrap;">
            ${customActionHtml}
            ${editButton}
            ${deleteButton}
          </td>
        </tr>
      `;
    }).join('');

    tableContainer.innerHTML = `
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              ${resource.columns.map(c => `<th>${c}</th>`).join('')}
              ${resource.edit || resource.deleteEndpoint || resource.customActions ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    // Bind edit/delete handlers
    filtered.forEach(item => {
      const editBtn = tableContainer.querySelector(`[data-edit="${item._id}"]`);
      if (editBtn) editBtn.onclick = () => formModal(resource, item, key);

      // Lesson manager
      const lessonBtn = tableContainer.querySelector(`[data-manage-lessons="${item._id}"]`);
      if (lessonBtn) lessonBtn.onclick = () => openLessonManagerModal(item._id, key);

      // Certificate Revoke
      const revokeBtn = tableContainer.querySelector(`[data-revoke-cert="${item._id}"]`);
      if (revokeBtn) {
        revokeBtn.onclick = async () => {
          if (!confirm(`Are you sure you want to revoke certificate #${item.certificateId}? This will invalidate public verification.`)) return;
          try {
            await api.delete(`/admin/certificates/${item._id}`);
            toast('Certificate successfully revoked.');
            loadResource(key);
          } catch (err) {
            toast(err.message, true);
          }
        };
      }

      // Application status change listener
      const statusSelect = tableContainer.querySelector(`[data-update-status="${item._id}"]`);
      if (statusSelect) {
        statusSelect.onchange = async () => {
          const newStatus = statusSelect.value;
          try {
            await api.put(`/admin/internship-applications/${item._id}/status`, { status: newStatus });
            toast(`Application status updated to "${newStatus}"!`);
            loadResource(key);
          } catch (err) {
            toast(err.message, true);
          }
        };
      }

      const statusBtn = tableContainer.querySelector(`[data-status="${item._id}"]`);
      if (statusBtn) {
        statusBtn.onclick = async () => {
          try {
            const nextStatus = item.isActive === false ? true : false;
            await api.patch(`/admin/users/${item._id}/status`, { isActive: nextStatus });
            toast(`User ${nextStatus ? 'activated' : 'deactivated'} successfully!`);
            loadResource(key);
          } catch (e) {
            toast(e.message, true);
          }
        };
      }

      const delBtn = tableContainer.querySelector(`[data-delete="${item._id}"]`);
      if (delBtn) {
        delBtn.onclick = async () => {
          if (!confirm(`Are you sure you want to permanently delete this record? This action cannot be undone.`)) return;
          try {
            await api.delete(`${resource.deleteEndpoint || resource.endpoint}/${item._id}`);
            toast('Record deleted successfully.');
            loadResource(key);
          } catch (error) {
            toast(error.message, true);
          }
        };
      }
    });

  } catch (error) {
    tableContainer.innerHTML = `<div class="empty" style="color:#f43f5e;"><i class="fa-solid fa-circle-exclamation"></i> Failed to load data: ${error.message}</div>`;
  }
}

async function resourcePage(key) {
  if (!await initAdmin()) return;
  const r = adminResources[key];
  if (!r) return;

  const addButton = r.fields ? `
    <button class="btn" id="addBtn" style="font-size:13px;">
      <i class="fa-solid fa-plus"></i> Add ${r.title.replace(/s$/, '')}
    </button>
  ` : '';

  layout(
    `admin-${key}.html`,
    r.title,
    `Complete management and real-time MongoDB administration for ${r.title.toLowerCase()}.`,
    `
      <div class="panel">
        <div class="actions" style="margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <input type="search" id="search" placeholder="Search ${r.title.toLowerCase()}..." style="background:#081626; color:#fff; border:1px solid var(--line); border-radius:8px; padding:10px 14px; min-width:260px;">
            <span id="count" style="font-size:12px; color:#8fa3bf; font-weight:600;">0 records</span>
          </div>
          <div>
            ${addButton}
          </div>
        </div>
        <div id="table"></div>
      </div>
      <div class="modal" id="modal" hidden></div>
    `
  );

  if (byId('addBtn')) {
    byId('addBtn').onclick = () => formModal(r, null, key);
  }

  byId('search').oninput = () => loadResource(key);
  loadResource(key);
}

// Router for admin subpages
document.addEventListener('DOMContentLoaded', async () => {
  const page = location.pathname.split('/').pop();
  if (page === 'admin-dashboard.html' || (page === 'dashboard.html' && location.pathname.includes('/admin/'))) {
    return;
  }

  const key = page.replace('admin-', '').replace('.html', '');
  if (adminResources[key]) {
    resourcePage(key);
  }
});
