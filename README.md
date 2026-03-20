# SkillSwap — Teach What You Know. Learn What You Need.

## Authors

**Mohammed Armaan** — Graduate Student @ Northeastern University
- 🌐 Portfolio: [mohammedarmaan.github.io](https://mohammedarmaan.github.io/personal/)
- 🐙 GitHub: [github.com/mohammedarmaan](https://github.com/mohammedarmaan)
- 📧 Email: lnu.mohammedar@northeastern.edu

**Sankar Sudheer Ayachitula** — Graduate Student @ Northeastern University
- 🌐 Portfolio: [sankar-ayachitu.github.io](https://sankar-ayachitu.github.io)
- 🐙 GitHub: [github.com/Sankar-Ayachitula](https://github.com/Sankar-Ayachitula)
- 📧 Email: sankarayachitula@gmail.com

---

## 📚 Class Reference

This project was created as part of **CS 5610 - Web Development** at Northeastern University.

Course Link: [CS 5610 Web Development](https://khoury.northeastern.edu)

---

## 🌐 Live Website

[https://skillswapfrontend-seven.vercel.app/](https://skillswapfrontend-seven.vercel.app/)

---

## Project Objective

The objective of this project is to design and implement a full-stack peer-to-peer skill barter platform where students exchange skills instead of paying for lessons. Post a skill you can teach, browse what others offer, propose a swap, and meet up. You teach me guitar, I teach you Python.

**SkillSwap** showcases:

- **Skill Listings** — Create, browse, edit, and delete skills you can teach with category, experience level, and format
- **Swap Sessions** — Propose skill exchanges, accept or decline requests, and schedule meetups
- **Feedback & Ratings** — Rate your swap partner after each session with a 1–5 star rating and comment
- **Hour Tracking** — Automatically log hours taught and received across all completed sessions
- **Search & Filter** — Find skills by category, format, experience level, or keyword search
- **Skill Statistics** — View platform-wide stats on skill distribution and categories
- **Session Workflow** — Full lifecycle management: Pending → Accepted → Completed (with feedback)
- **Authentication** — Session-based login and registration with secure password handling

The project emphasizes clean REST API design, modular code structure, session-based authentication, and a responsive React frontend.

---

## Design Document

_(Add link to design document here)_

### Screenshots:

<img width="947" height="534" alt="image" src="https://github.com/user-attachments/assets/c892a9a2-23b3-4bd5-8f30-b5762e34eae2" />


---

## Tech Stack

**Frontend**
- React
- Vite

**Backend**
- Node.js
- Express.js
- MongoDB (native driver — no Mongoose)
- Passport.js (passport-local with express-session)

**Tooling**
- ESLint
- Prettier
- Vercel (frontend deployment)
- Render (backend deployment)

---

## Project Structure

```
.
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── BrowseSkills.jsx
│   │   │   ├── FeedbackForm.jsx
│   │   │   ├── MySkills.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── Sessions.jsx
│   │   │   ├── SkillCard.jsx
│   │   │   ├── SkillForm.jsx
│   │   │   └── SwapForm.jsx
│   │   ├── css/
│   │   │   ├── AuthPage.css
│   │   │   ├── BrowseSkills.css
│   │   │   ├── FeedbackForm.css
│   │   │   ├── MySkills.css
│   │   │   ├── Navbar.css
│   │   │   ├── Profile.css
│   │   │   ├── SessionCard.css
│   │   │   ├── Sessions.css
│   │   │   ├── SkillCard.css
│   │   │   ├── SkillForm.css
│   │   │   └── SwapForm.css
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── cors.js
│   ├── models/
│   │   ├── User.js           (SHARED)
│   │   ├── Skill.js          (ARMAAN)
│   │   └── Session.js        (SANKAR)
│   ├── routes/
│   │   ├── users.js          (SHARED)
│   │   ├── skills.js         (ARMAAN)
│   │   └── sessions.js       (SANKAR)
│   ├── seed/
│   │   └── seed.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Instructions to Build and Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB URI and session secret:

```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

Seed the database and start the server:

```bash
npm run seed    # Populates 1100+ synthetic records
npm run dev     # Runs at http://localhost:3000
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev     # Proxies /api requests to http://localhost:3000
```

For production, set `VITE_API_URL` to your deployed backend URL.

### 4. (Optional) Run linting and formatting

```bash
npm run lint
npm run format
```

---

## Seed Data

Run `npm run seed` from the `server/` directory to generate **1,100+ synthetic records:**

- 100 users with realistic names and bios
- 500 skills across 11 categories
- 500 sessions in various statuses with feedback

All test users share the password: `password123`

---

## GenAI Tools Usage

This project utilized AI assistance in the following ways:

| Tool | Version | Usage |
|------|---------|-------|
| Claude | Claude Sonnet 4.6 | README generation, code review |

### Prompts Used:
- *"Generate a README following these guidelines: [image of requirements]"*

---

## License

This project is open source and available under the [MIT License](./LICENSE).
