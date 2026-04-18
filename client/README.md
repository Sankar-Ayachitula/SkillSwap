# SkillSwap - Client
**Teach What You Know. Learn What You Need.**

A peer-to-peer skill barter platform where students exchange skills instead of paying for lessons.

## Author

Mohammed Armaan and Sankar Ayachitula

## Class Link

CS 5610 - Web Development, Northeastern University


## Project Objective

SkillSwap connects people who want to learn with people who want to teach — without money changing hands. Post a skill you can teach, browse what others offer, propose a swap, and meet up. You teach me guitar, I teach you Python. Every session gets logged, every hour tracked, every partner rated, building trust through accountability.

## Screenshot

_(Add a screenshot of the running application here)_

## How to Use

1. **Register** an account or **log in** with an existing one.
2. Go to **My Skills** to add skills you can teach (title, category, level, format).
3. Go to **Browse** to search and filter skills offered by other users.
4. Click **Propose swap** on any skill to send a session request, choosing one of your own skills to offer in return, a date, duration, and format.
5. Go to **Sessions** to manage your incoming and outgoing swap proposals. You can accept, decline, cancel, mark complete, or delete sessions.
6. After a session is completed, **leave feedback** with a 1-5 star rating and optional comment.
7. Visit **Profile** to update your name and bio, view your stats, or delete your account.

## Instructions to Build

```bash
# Install dependencies
npm install

# Start the dev server (make sure the backend is running on port 3000)
npm run dev

# Lint
npm run lint

# Format
npm run format

# Build for production
npm run build
```

The dev server proxies `/api` requests to `http://localhost:3000`. For production, set `VITE_API_URL` to your deployed backend URL.

## License

MIT
