# EDUTECH NEXUS
> **"Learn • Participate • Compete • Connect • Grow"**

EDUTECH NEXUS is a production-grade, full-stack student technology and career development ecosystem built with Node.js, Express, MongoDB, Mongoose, and a high-performance Vanilla HTML5/CSS3/JavaScript frontend with a dark futuristic technology theme.

---

## 1. Project Overview

EDUTECH NEXUS empowers students to:
- **Learn Skills:** Enroll in technology certificate courses with structured lessons, saved progress, and an interactive video player.
- **Earn Verified Certificates:** Track progress towards 90%+ completion to unlock unique, cryptographically identifiable certificates (`EN-CERT-2026-XXXXXX`) that are publicly verifiable.
- **Gain XP & Level Up:** Earn XP dynamically through a centralized transaction ledger for course registration, lesson completion, games, events, and certificates.
- **Live Top 3 Leaderboard:** Real-time top 3 student ranking dynamically querying MongoDB sorted by XP with automatic 15-second polling.
- **Internships:** Explore curated technical internship opportunities (with Free/Paid badges and demo payment flow).
- **Technical Events:** Discover hackathons, workshops, and coding competitions with official external registration integration.
- **Video Lesson Player:** Responsive HTML5 player with custom controls and an explicit course/lesson-to-local-video manifest. Lessons without a verified locally hosted video and redistribution license are clearly reported as unavailable; third-party embeds are not used in the course player.
- **Community:** Tech Clubs, Peer Discussions with nested replies and likes, and Direct Messaging between students.
- **Admin Control Center:** Complete CRUD suite, student account activation/deactivation, dynamic XP reward rule configuration, audit logging, and 7 Chart.js analytics graphs.

---

## 2. Technologies

### Frontend
- **Core:** HTML5, CSS3, Vanilla ES6+ JavaScript
- **Typography & Icons:** Google Fonts (*Space Grotesk*, *Inter*), Font Awesome 6.4
- **Design System:** Dark Futuristic Aesthetic, Glassmorphism, Neon Glow Accents, Gradient Borders, Responsive Layouts
- **Data Visualization:** Chart.js 4.x

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs password hashing (cost factor 12)
- **Security:** Helmet, CORS with strict origin validation, Rate Limiting, Input Validation (`express-validator`), Sanitization
- **Services:** Centralized XP Ledger (`xpService.js`), Audit Trail Logger (`auditService.js`), Nodemailer Mock / SMTP (`emailService.js`)

---

## 3. Folder Structure

```text
EDUTECH System/
├── frontend/
│   ├── index.html                 # Platform landing & hero page
│   ├── home.html                  # Main marketing & module showcase
│   ├── register.html              # Multi-field student registration
│   ├── login.html                 # Dual email/username secure login
│   ├── dashboard.html             # Student dashboard & Live Top 3 Leaderboard
│   ├── courses.html               # Course catalog with filters
│   ├── course-details.html        # Course syllabus & 30-day enrollment
│   ├── lessons.html               # Interactive lesson player & progress tracker
│   ├── certificate.html           # 90%+ progress certificate claim & print modal
│   ├── verify-certificate.html    # Public verification portal (EN-CERT-2026-...)
│   ├── internship.html            # Internship catalog with Free/Paid filters
│   ├── internship-details.html    # Application submission & demo payment modal
│   ├── events.html                # Technical events & hackathon listings
│   ├── event-details.html         # Event schedule & registration
│   ├── games.html                 # Searchable, filterable PlayZone catalog
│   ├── tech-quiz.html             # Shared question runner with instant feedback
│   ├── code-challenge.html        # Code editor, 10m timer, & test runner
│   ├── debugging-game.html        # Bug fixing arena & assertion checker
│   ├── discussion.html            # Community forums, replies, & likes
│   ├── leaderboard.html           # Global rankings & Top 3 podium
│   ├── messages.html              # Student-to-student inbox & composer
│   ├── clubs.html                 # Tech clubs join/leave interface
│   ├── myprofile.html             # Profile editor & student stats
│   ├── notifications.html         # Live notifications & alerts
│   ├── settings.html              # Password change & notification settings
│   ├── forgot-password.html       # Secure password reset request
│   ├── reset-password.html        # Token-based password renewal
│   ├── admin-dashboard.html       # Admin command center & 7 Chart.js graphs
│   ├── admin-students.html        # Admin student user management CRUD
│   ├── admin-courses.html         # Admin course management CRUD
│   ├── admin-lessons.html         # Admin lesson & video upload CRUD
│   ├── admin-certificates.html    # Admin certificate ledger & revoking
│   ├── admin-internships.html     # Admin internship postings & applications
│   ├── admin-events.html          # Admin technical events CRUD
│   ├── admin-games.html           # Admin challenge question CRUD
│   ├── admin-discussions.html     # Admin discussion moderation
│   ├── admin-clubs.html           # Admin club management
│   ├── admin-messages.html        # Admin message audit
│   ├── admin-leaderboard.html     # Admin leaderboard view
│   ├── admin-activity.html        # Admin audit logs & security events
│   ├── admin-settings.html        # Admin global XP reward rules editor
│   ├── admin/
│   │   └── dashboard.html         # Dedicated /admin/dashboard.html route
│   ├── css/
│   │   ├── nexus-core.css         # Futuristic dark design system
│   │   ├── admin.css              # Admin suite styles
│   │   └── admin-enhancements.css # Admin polish & charts styling
│   └── js/
│       ├── api.js                 # Unified fetch API client
│       ├── auth.js                # Session, JWT, & role guard utilities
│       ├── auth-forms.js          # Login & registration logic
│       ├── nexus-student.js       # Student sidebar, stats, & live polling
│       └── admin.js               # Admin CRUD engine & modal forms
│
├── backend/
│   ├── server.js                  # Express application & REST API endpoints
│   ├── seed.js                    # MongoDB database seed script
│   ├── config/
│   │   └── db.js                  # Mongoose connection configuration
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & role authorization
│   │   └── roleMiddleware.js      # Role-based access guards (student/admin)
│   ├── models/
│   │   ├── User.js                # Student & admin accounts
│   │   ├── Course.js              # Courses & embedded lesson syllabi
│   │   ├── CourseRegistration.js  # 30-day enrollment, progress, & eligibility
│   │   ├── Certificate.js         # Issued credentials (EN-CERT-2026-XXXXXX)
│   │   ├── Internship.js          # Internship opportunities
│   │   ├── InternshipRegistration.js # Applications & payment statuses
│   │   ├── Event.js               # Technical events & external tags
│   │   ├── EventRegistration.js   # Event sign-ups
│   │   ├── Game.js                # Code & debugging challenges
│   │   ├── GameResult.js          # Challenge submissions & scores
│   │   ├── Discussion.js          # Forum threads & like records
│   │   ├── Reply.js               # Thread comments
│   │   ├── Club.js                # Technology clubs
│   │   ├── Message.js             # Direct messages
│   │   ├── AIConversation.js      # Persistent AI session messages
│   │   ├── XPTransaction.js       # Immutable XP credit/debit ledger
│   │   ├── XPConfig.js            # Admin-tunable XP reward values
│   │   ├── Notification.js        # In-app student alerts
│   │   ├── PasswordResetToken.js  # Expiring password reset tokens
│   │   ├── AuditLog.js            # Admin action audit trail
│   │   └── UserActivity.js        # Student activity telemetry
│   ├── routes/
│   │   └── aiRoutes.js            # Secure server-side AI chat router
│   ├── services/
│   │   ├── xpService.js           # Centralized XP awarder & level formula
│   │   ├── auditService.js        # Admin operation logger
│   │   └── emailService.js        # Password reset emailer & dev console logger
│   ├── .env                       # Backend environment configuration
│   └── package.json               # Backend dependencies & scripts
│
├── .env                           # Root environment file
├── package.json                   # Root workspace scripts
└── README.md                      # Documentation
```

### Course lesson video mapping

`frontend/js/course-video-map.js` lists distinct official YouTube embeds for the 43 lessons across all five certificate courses. Each entry preserves the existing lesson title and records the verified YouTube title, creator, duration, and embed URL. The lesson page uses YouTube's official player; generated local clips in `frontend/videos/` are not used by this mapping.

On application startup, `backend/services/initDefaults.js` also repairs the repeated legacy title on the seven existing Nexus Cloud Labs internship records. It changes only their titles, preserving their IDs and application references.

---

## 4. MongoDB Setup

1. **Local MongoDB Instance:**
   - Ensure MongoDB is installed and running on `localhost:27017`.
   - Default connection string:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/edutech_nexus
     ```

2. **MongoDB Atlas (Cloud):**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Configure a database user with read/write access.
   - Whitelist your current IP or allow `0.0.0.0/0` in Network Access.
   - Update `MONGODB_URI` in `.env` and `backend/.env`:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/edutech_nexus?retryWrites=true&w=majority
     ```

---

## 5. Environment Variables

Create or update `.env` (in root) and `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edutech_nexus
JWT_SECRET=edutech-nexus-local-development-secret-change-before-deployment
CLIENT_URL=http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000,http://127.0.0.1:3000

# Local administrator credentials (keep the password private)
ADMIN_EMAIL=adminedutech001@gmail.com
ADMIN_PASSWORD=replace_with_a_unique_local_admin_password

# Default Demo Student Credentials (Seed Script)
STUDENT_EMAIL=student@edutechnexus.com
STUDENT_PASSWORD=Student@123

# Optional AI Mentor Configuration (OpenAI, Groq, or OpenRouter)
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

---

## 6. Installation

From the project root:

```bash
# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 7. Seed Database

Populate initial records (5 students, 1 admin, 3 courses with 7-lesson curriculums, 3 internships, 3 technical events, 2 tech games, clubs, discussions, and XP ledger):

```bash
npm run seed
```
*(Or from the `backend/` folder: `node seed.js`. Backend initialization synchronizes the 11 PlayZone games and their question sets.)*

---

## 8. Start Backend

Start the Node.js Express server:

```bash
npm start
```
*(For development with auto-reload: `npm run dev`)*

The server starts at:
```text
http://localhost:5000
```
*Note: The backend also serves all static files from `frontend/` automatically.*

---

## 9. Open Frontend

You have two options to run the frontend:

1. **Integrated Server (Recommended):**
   Simply open your browser to:
   ```text
   http://localhost:5000/
   ```
   or
   ```text
   http://localhost:5000/home.html
   ```

2. **VS Code Live Server (Alternative):**
   - Right-click `frontend/index.html` or `frontend/home.html` in VS Code and select **Open with Live Server** (Port `5500` or `3000`).
   - The frontend automatically detects port 5000 for backend API calls.

---

## 10. Admin Login Setup

- **Admin Login Route:** Access `/admin-login.html` (the shared `/login.html` also supports administrators).
- **Admin Dashboard:** A successful admin login opens `/admin-dashboard.html` (also available at `/admin/dashboard`).
- **Credentials:** The default account email is `adminedutech001@gmail.com` and username is `admin`. Set a unique local password with `ADMIN_PASSWORD` in `backend/.env`; do not commit that file or share the password.
- **Local password reset:** From the project root, run `npm run admin:reset-password --prefix backend` in an interactive terminal. Enter and confirm a new password (at least 12 characters and no more than 72 UTF-8 bytes); input is masked. The command updates only the matching admin email, username, and role, saves the setting in the ignored `backend/.env`, and hashes it with bcrypt. It requires the configured MongoDB connection and will not reset an in-memory fallback database. Remove any process-level `ADMIN_PASSWORD` override before running it. Do not use a development password in a deployed environment.
- **Role Detection:** Login verifies the backend account and routes by its database `role` field.
- **Security:** Admin routes (`/api/admin/*`) require both a valid JWT and the `requireAdmin` role guard on the backend. Any unauthorized student token receives `HTTP 403 Forbidden`.

---

## 11. Certificate-Course Video Playback

The Certificate Course lesson page uses the official YouTube iframe player and the explicit course/lesson mapping in `frontend/js/course-video-map.js`. Selecting a lesson tears down the previous iframe before loading that lesson's distinct video. The official YouTube controls, captions, and fullscreen support are retained.

All **43 lessons** have distinct YouTube IDs. Browser checks confirmed that each official embed rendered the mapped video title and duration. Automated playback could not be verified: the player remained at 0:00 in the test session, so the report does not claim successful playback. The official YouTube player remains responsible for playback and its required branding.

The complete 43-lesson inventory, video creators, YouTube URLs, durations, embed checks, and playback-test status are in [VIDEO-REPORT.md](frontend/videos/VIDEO-REPORT.md).

The separate Admin Lesson editor retains its existing media-management options for other lesson records. Those options are not used by the Certificate Course player. Course access, progress tracking, XP awards, and certificate generation remain unchanged.

---

## 12. Deployment Instructions

### Backend (Render, Railway, or VPS)
1. Push repository to GitHub.
2. In Render/Railway, create a new **Web Service** pointing to the repository.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A high-entropy cryptographic secret.
   - `CLIENT_URL`: Your production frontend domain (e.g., `https://edutech-nexus.vercel.app`).
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
7. Run the seed script once in the deployed terminal:
   ```bash
   node seed.js
   ```

### Frontend (Vercel, Netlify, or AWS S3/CloudFront)
1. Deploy the `frontend/` folder as a static site.
2. If hosting frontend and backend on separate domains, set `window.EDUTECH_API_URL = 'https://your-backend-service.onrender.com/api';` in `frontend/js/api.js`.

---

## 13. Core Verification & Testing Matrix

| Feature | Verified Behavior |
| :--- | :--- |
| **Authentication** | Dual login by Username or Email; passwords hashed with bcrypt; role-based redirection. |
| **Live Top 3 Leaderboard** | Top 3 students queried from MongoDB (`GET /api/leaderboard/top3`); polls automatically every 15s. |
| **Course 30-Day Expiry** | Enrollment automatically calculates `expiryDate = registrationDate + 30 days`; access expires if past date. |
| **Progress & Certificate** | Each lesson awards +20 XP; progress bar updates dynamically; 90%+ completion unlocks Claim Certificate. |
| **Certificate Verification** | Public portal (`/verify-certificate.html?id=EN-CERT-2026-XXXXXX`) verifies student credential authenticity. |
| **Centralized XP Ledger** | Every XP award is recorded in `XPTransaction` collection; level formula: `Math.floor(xp / 250) + 1`. |
| **Internship Demo Flow** | Example corporate records (TCS, Infosys, Zoho) marked with disclaimers; demo fee payment modal. |
| **Tech Games** | 11 active games: Tech Quiz, Debugging Game, Code Sprint, SQL Quest, Cyber Defender, Bug Hunter, AI Arena, Network Builder, Web Design Challenge, Logic Master, and Memory & Pattern. Quiz-style games use server-validated answer feedback, locked selections, and attempt-safe XP awards; user code and SQL are not executed on the production server. |
| **Admin Analytics** | 8 real MongoDB stat cards; 7 dynamic Chart.js visualizations loading from `/api/admin/reports`. |
| **Admin CRUD** | Authorized game management includes type/status controls plus per-game active question and completion counts. |
