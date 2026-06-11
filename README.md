# MUCOSA Attendance Management & Digital Membership System

Digital Membership ID, QR Verification, and Attendance Management System for the Makerere University Computing Students Association.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL (via XAMPP) + Prisma ORM
- **Authentication**: NextAuth.js v5 (credentials provider)
- **UI**: shadcn/ui components + Tailwind CSS v3
- **QR Scanner**: html5-qrcode (in-browser camera)
- **QR Generator**: qrcode
- **Charts**: Recharts

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **XAMPP** ([download](https://www.apachefriends.org/)) — provides MySQL and phpMyAdmin

---

## Setup — Step by Step

### 1. Install dependencies

```bash
npm install
```

### 2. Start XAMPP and MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** and **MySQL**
3. Wait for both to turn green

### 3. Create the database

Open your browser and go to **http://localhost/phpmyadmin**

1. Click **New** in the left sidebar
2. Enter `mucosa_attendance` as the database name
3. Choose `utf8mb4_general_ci` as the collation
4. Click **Create**

The database is now ready.

### 4. Configure environment variables

The `.env` file is already set up for XAMPP's default MySQL credentials:

```
DATABASE_URL="mysql://root:@localhost:3306/mucosa_attendance"
```

> XAMPP's MySQL root user has **no password by default** — the URL above uses an empty password. If you've set a MySQL password, update it: `mysql://root:your_password@localhost:3306/mucosa_attendance`

Also generate a secure `AUTH_SECRET` for NextAuth:

```bash
npx auth secret
```

### 5. Push the database schema

```bash
npx prisma db push
```

This creates all the tables (User, Event, AttendanceRecord, Badge, Certificate, etc.) in your MySQL database. You can verify them in phpMyAdmin afterward.

### 6. (Optional) Seed demo data

To explore the system with sample members, events, attendance records, badges, and points:

```bash
npx prisma db seed
```

Make sure `SEED_ENABLED=true` is in your `.env` file.

### 7. Start the development server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Demo Accounts

After running the seed, log in with any of these accounts. **All passwords: `password123`**

| Role | Email | Access |
|------|-------|--------|
| Super Admin | `admin@mucosa.ac.ug` | Full system access — manage events, scan QR codes, issue certificates, view insights |
| President | `president@mucosa.ac.ug` | Executive access — manage events, scan QR codes, view dashboards |
| General Secretary | `secretary@mucosa.ac.ug` | Executive access — manage events, scan QR codes, view dashboards |
| Member | `john.mugisha@mucosa.ac.ug` | Member dashboard — digital ID, attendance, badges, leaderboard |
| Member | `sarah.achieng@mucosa.ac.ug` | Member dashboard |
| Member | `agnes.kirabo@mucosa.ac.ug` | Member dashboard (Year 1 student) |

20 member accounts are seeded — all follow the pattern `firstname.lastname@mucosa.ac.ug`.

---

## Removing Seed Data Before Deploying

> **Important**: Seed data is for demo purposes only. Remove it before deploying to production.

### Option A: Reset the entire database (recommended)

```bash
npx prisma migrate reset
```

Then push a fresh schema:

```bash
npx prisma db push
```

### Option B: Delete via phpMyAdmin

1. Open **http://localhost/phpmyadmin**
2. Select the `mucosa_attendance` database
3. Select all tables, choose **Drop** from the dropdown
4. Re-run `npx prisma db push`

### Option C: Prevent re-seeding

Set `SEED_ENABLED=false` in `.env`. The seed script checks this flag and skips if it's not `true`. This prevents accidental re-seeding but doesn't remove existing data.

---

## Features

### Member Experience
- **Digital Membership ID** — personalized card with QR code embedded
- **QR Check-In** — scan your digital ID at any MUCOSA event
- **Attendance Dashboard** — track your attendance score and history
- **Points System** — earn points for attending events (10–40 pts per event)
- **Leaderboard** — see how you rank among peers each semester
- **Badges** — earn achievements like Attendance Champion, Innovation Contributor
- **Certificates** — download professional certificates
- **Notifications** — in-app reminders and achievement alerts

### Executive Tools
- **Event Management** — create Friday Sessions, Workshops, Hackathons, and more
- **QR Scanner** — scan member QR codes via phone/tablet camera to record attendance
- **Real-Time Dashboard** — live attendance metrics and analytics
- **Member Management** — view all members, roles, and statuses
- **Badge Engine** — define and award digital badges
- **Certificate Issuance** — generate certificates with verification QR codes
- **Rewards Engine** — auto-evaluate members for semester awards
- **Executive Insights** — data-driven recommendations from attendance patterns
- **Semester Reports** — export top performers and statistics to CSV

### Attendance Scanning Flow
- **Green** — "Attendance Successfully Recorded" (valid member, first check-in)
- **Orange** — "Attendance Already Recorded" (member already checked in)
- **Red** — "Invalid Membership" (QR not recognized or membership inactive)

---

## Attendance Score Formula

```
Attendance Score = (Events Attended / Total Events Held) × 100
```

| Score | Rating |
|-------|--------|
| 90%+ | Excellent Participation |
| 70–89% | Good Participation |
| 50–69% | Needs Improvement |
| Below 50% | Poor Attendance |

---

## Points System

| Event Category | Points |
|----------------|--------|
| Friday Session | 10 |
| Workshop | 15 |
| Community Event | 15 |
| Leadership Activity | 20 |
| Research Participation | 25 |
| Hackathon | 30 |
| Innovation Challenge | 40 |

Points are awarded automatically when a member's QR code is scanned at an event.

---

## Authorized Roles for QR Scanning

Only these roles can scan member QR codes and record attendance:

- President
- Vice President
- General Secretary
- Assistant General Secretary
- Speaker
- Technical Directors
- Super Admin

---

## Project Structure

```
src/
├── proxy.ts             # Route protection (replaces middleware)
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Member-facing pages
│   │   └── dashboard/
│   │       ├── profile/       # Digital ID card + QR code
│   │       ├── attendance/    # Attendance history & score
│   │       ├── badges/        # Earned badges
│   │       ├── certificates/  # Downloadable certificates
│   │       ├── leaderboard/   # Full leaderboard
│   │       └── notifications/ # In-app notifications
│   ├── (admin)/         # Executive/admin pages
│   │   └── admin/
│   │       ├── events/        # Event CRUD
│   │       ├── events/[id]/scan/  # QR scanner
│   │       ├── attendance/    # All attendance records
│   │       ├── members/       # Member management
│   │       ├── badges/        # Badge definitions
│   │       ├── certificates/  # Certificate issuance
│   │       ├── rewards/       # Rewards engine
│   │       ├── insights/      # Executive insights
│   │       ├── semester-report/  # End-of-semester reports
│   │       └── notifications/ # Send notifications
│   ├── api/             # API routes
│   └── verify/[code]/   # Public certificate verification
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Navigation, sidebar, header
│   └── dashboard/       # Digital ID card component
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client singleton
│   ├── utils.ts         # Shared utilities
│   └── constants.ts     # Points, roles, labels
prisma/
├── schema.prisma        # Database models
└── seed.ts              # Demo data seeder
```

---

## Troubleshooting

### "Can't connect to MySQL server"
Make sure XAMPP's MySQL is running (green indicator in XAMPP Control Panel).

### "Access denied for user 'root'"
If you've set a MySQL root password, update `DATABASE_URL` in `.env`:
```
DATABASE_URL="mysql://root:your_password@localhost:3306/mucosa_attendance"
```

### "Unknown database 'mucosa_attendance'"
You haven't created the database yet. Go to http://localhost/phpmyadmin and create it (Step 3 above).

### Port 3000 already in use
```bash
npx kill-port 3000
npm run dev
```

---

## Build for Production

```bash
npm run build
npm start
```
