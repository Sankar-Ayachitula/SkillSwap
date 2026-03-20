# SkillSwap - Client

## Author

Mohammed Armaan and Sankar A

## Class Link

CS 5610 - Web Development

## Project Objective

SkillSwap is a peer-to-peer skill exchange platform where users can list skills they can teach, browse skills offered by others, and propose swap sessions. Each swap involves two people teaching each other something in return. The app supports full session lifecycle management including proposing, accepting, declining, completing, and leaving feedback.

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
