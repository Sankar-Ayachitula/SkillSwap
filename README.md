# SkillSwap

**Teach What You Know. Learn What You Need.**

A peer-to-peer skill barter platform where students exchange skills instead of paying for lessons. Post a skill you can teach, browse what others offer, propose a swap, and meet up. You teach me guitar, I teach you Python. Every session gets logged, every hour tracked, every partner rated, building trust through accountability.

## Authors

- **Mohammed Armaan** — Skills Management (Full Stack)
- **Sankar Sudheer Ayachitula** — Sessions & Requests (Full Stack)

## Class Link

CS 5610 — Web Development, Northeastern University

## Screenshot

_(Add a screenshot of the running application here)_

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (native driver — no Mongoose)
- **Authentication:** Passport.js (passport-local with express-session)

## Setup Instructions

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and session secret
npm run seed    # Populate database with 1100+ synthetic records
npm run dev     # Runs at http://localhost:3000
```

### Frontend

```bash
cd client
npm install
npm run dev     # Proxies /api requests to http://localhost:3000
```

For production, set `VITE_API_URL` to your deployed backend URL.

## How to Use

1. **Register** an account or **log in** with an existing one.
2. Go to **My Skills** to add skills you can teach.
3. Go to **Browse** to search and filter skills offered by other users.
4. Click **Propose swap** on any skill to send a session request, offering one of your own skills in return.
5. Go to **Sessions** to manage swap proposals — accept, decline, cancel, mark complete, or delete.
6. After a session is completed, **leave feedback** with a 1–5 star rating and optional comment.
7. Visit **Profile** to update your info, view your stats, or delete your account.

## Seed Data

Run `npm run seed` from the `server/` directory to generate **1,100+ synthetic records** (100 users, 500 skills, 500 sessions). All test users share the password `password123`.

## License

MIT
