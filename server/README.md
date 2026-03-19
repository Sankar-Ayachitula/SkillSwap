# SkillSwap Backend API

**Teach What You Know. Learn What You Need.**

A peer-to-peer skill barter platform where students exchange skills instead of paying for lessons.

## Authors

- **Sankar Sudheer Ayachitula** — Sessions & Requests (Full Stack) · `sessions` collection
- **Mohammed Armaan** — Skills Management (Full Stack) · `skills` collection

## Class Link

CS 5610 — Web Development, Northeastern University

## Project Objective

SkillSwap connects people who want to learn with people who want to teach — without money changing hands. Post a skill you can teach, browse what others offer, propose a swap, and meet up. You teach me guitar, I teach you Python. Every session gets logged, every hour tracked, every partner rated, building trust through accountability.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (native driver — no Mongoose)
- **Authentication:** Passport.js (passport-local strategy with express-session)
- **CORS:** Custom middleware (no cors library)
- **Module System:** ES Modules (import/export)

## Setup Instructions

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
cp .env.example .env

# 4. Edit .env with your MongoDB URI and session secret
#    MONGODB_URI=mongodb+srv://<username>:<password>@...
#    SESSION_SECRET=any_random_string

# 5. Seed the database with 1100+ synthetic records
npm run seed

# 6. Start the development server
npm run dev

# 7. Server runs at http://localhost:3000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with hot reload (nodemon) |
| `npm run seed` | Populate database with 1100+ records |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
server/
├── config/
│   ├── db.js              # MongoDB native driver connection
│   └── passport.js        # Passport local strategy config
├── middleware/
│   ├── auth.js            # Session-based authentication check
│   └── cors.js            # Manual CORS headers (no cors lib)
├── models/
│   ├── User.js            # User data access layer      (SHARED)
│   ├── Skill.js           # Skill data access layer      (ARMAAN)
│   └── Session.js         # Session data access layer    (SANKAR)
├── routes/
│   ├── users.js           # Auth + profile endpoints     (SHARED)
│   ├── skills.js          # Skill CRUD endpoints         (ARMAAN)
│   └── sessions.js        # Session CRUD endpoints       (SANKAR)
├── seed/
│   └── seed.js            # Generates 1100+ synthetic records
├── server.js              # Express app entry point
├── package.json           # Dependencies (ES module)
├── eslint.config.js       # ESLint flat config
├── .prettierrc            # Prettier formatting rules
├── .env.example           # Environment template (safe to commit)
├── .env                   # Actual secrets (gitignored)
├── .gitignore             # Ignores node_modules, .env
└── LICENSE                # MIT License
```

## Collections

### Users (Shared)

Stores authentication credentials and profile data for all platform users.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Display name (2-50 chars) |
| email | String | Unique email address |
| password | String | bcrypt hashed password |
| bio | String | Short bio (max 500 chars) |
| hoursTeaught | Number | Total hours spent teaching |
| hoursReceived | Number | Total hours spent learning |
| overallRating | Number | Weighted average rating (0-5) |
| totalRatings | Number | Number of ratings received |

### Skills — Armaan's Collection

Skill listings that users post to advertise what they can teach.

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to the posting user |
| title | String | Skill name (unique per user) |
| description | String | Detailed description |
| category | String | Programming, Music, Languages, Art & Design, Cooking, Fitness, Photography, Writing, Math & Science, Business, Other |
| experienceLevel | String | Beginner, Intermediate, Advanced, Expert |
| availability | String | When the user is available |
| format | String | In-Person, Video, Async |

### Sessions — Sankar's Collection

Swap session records tracking proposals, status, and feedback.

| Field | Type | Description |
|-------|------|-------------|
| requesterId | ObjectId | User proposing the swap |
| responderId | ObjectId | User receiving the proposal |
| skillRequestedId | ObjectId | Skill the requester wants to learn |
| skillOfferedId | ObjectId | Skill offered in exchange |
| scheduledDate | Date | When the session is planned |
| duration | Number | Length in hours (0.5-8) |
| format | String | In-Person, Video, Async |
| status | String | Pending, Accepted, Declined, Cancelled, Completed |
| feedback | Object | requesterFeedback + responderFeedback (rating + comment) |

## API Endpoints

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account (auto-login) |
| POST | `/login` | No | Login with Passport |
| POST | `/logout` | Yes | End session |
| GET | `/` | No | Get all user profiles |
| GET | `/me` | Yes | Get your profile |
| GET | `/:id` | No | Get user by ID |
| PUT | `/me` | Yes | Update your profile |
| DELETE | `/me` | Yes | Delete your account |

### Skills — `/api/skills` (Armaan)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create a skill listing |
| GET | `/` | No | Get all skills (search & filter) |
| GET | `/stats` | No | Skill statistics |
| GET | `/my` | Yes | Get your skills |
| GET | `/:id` | No | Get single skill |
| PUT | `/:id` | Yes | Update skill (owner only) |
| DELETE | `/:id` | Yes | Delete skill (owner only) |

**Query params:** `?category=Programming&format=Video&experienceLevel=Beginner&search=python`

### Sessions — `/api/sessions` (Sankar)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Propose a swap |
| GET | `/` | Yes | Get your sessions |
| GET | `/stats` | Yes | Session statistics |
| GET | `/:id` | Yes | Get session details |
| PUT | `/:id` | Yes | Update session (pending only) |
| PUT | `/:id/status` | Yes | Accept / Decline / Cancel |
| PUT | `/:id/complete` | Yes | Mark completed + update hours |
| PUT | `/:id/feedback` | Yes | Submit rating + comment |
| DELETE | `/:id` | Yes | Delete session |

**Query params:** `?status=Pending&role=requester`

## Session Status Workflow

```
Pending ──→ Accepted ──→ Completed (with feedback)
   │            │
   │            └──→ Cancelled (by either party)
   │
   ├──→ Declined (by responder)
   └──→ Cancelled (by requester)
```

## Seed Data

Run `npm run seed` to generate **1,100+ synthetic records:**

- **100 users** with realistic names and bios
- **500 skills** across 11 categories
- **500 sessions** in various statuses with feedback

All test users share the password: `password123`

## License

MIT — see [LICENSE](./LICENSE)
