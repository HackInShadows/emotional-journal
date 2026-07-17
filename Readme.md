# See Yourself 🌸

> *"It's okay to feel everything."*

A full stack emotional wellness journal web app that helps users understand their emotions, track mood patterns, and receive personalized mental health exercises.

---

## What it does

- **Mood journaling** — users log how they feel daily with written entries
- **Rotating exercises** — 7 different sets of exercises per mood, changing every day
- **Resource links** — music therapy, guided meditation, breathing exercises, professional support
- **Severity detection** — suggests professional help for heavy emotions like sadness, anxiety, and numbness
- **Weekly mood chart** — visual summary of emotional patterns over time
- **Exercise feedback** — users can rate whether exercises helped
- **Dark mode** — full light and dark theme support
- **Admin panel** — password protected dashboard to view all users and entries
- **Authentication** — secure login and registration with encrypted passwords

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, Tailwind CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT, bcryptjs |

---

## Project Structure

emotional-journal/
├── public/
│   ├── index.html       # Landing page
│   ├── about.html       # About page
│   ├── contact.html     # Contact page
│   ├── login.html       # Login
│   ├── register.html    # Registration
│   ├── entries.html     # Main journal dashboard
│   └── admin.html       # Admin panel
├── routes/
│   ├── auth.js          # Register and login routes
│   ├── entries.js       # Journal entry routes
│   └── admin.js         # Admin data route
├── db.js                # MySQL connection
├── server.js            # Express server
└── .env                 # Environment variables (not in repo)

---

## Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=emotional_journal
JWT_SECRET=your_secret
PORT=3000
4. Create the MySQL database and tables (see below)
5. Run `node server.js`
6. Open `http://localhost:3000`

---

4. Create the MySQL database and tables (see below)
5. Run `node server.js`
6. Open `http://localhost:3000`

---

## Database Setup

```sql
CREATE DATABASE emotional_journal;
USE emotional_journal;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Modules

1. **Home / About / Contact** — public facing pages
2. **Authentication** — register and login with JWT
3. **Journal + Exercises** — mood entry with personalized daily exercises
4. **Mood Analytics** — weekly chart and mood summary
5. **Admin Panel** — manage users and entries

---

## Made by

**Foram Upadhyay** — BCA Student, Atmiya University  
Built as a full stack semester project with real database integration.