# Lend IT Book Kiosk — Complete Build Guide

A Redbox-style kiosk system for physical book lending, built with React + Spring Boot.

---

## Table of contents

1. [What you're building](#1-what-youre-building)
2. [Architecture overview](#2-architecture-overview)
3. [Tech stack and why](#3-tech-stack-and-why)
4. [Tools to install](#4-tools-to-install)
5. [Project layout](#5-project-layout)
6. [Running the project locally](#6-running-the-project-locally)
7. [How the pieces talk to each other](#7-how-the-pieces-talk-to-each-other)
8. [Database strategy](#8-database-strategy)
9. [Feature suggestions and roadmap](#9-feature-suggestions-and-roadmap)
10. [Deployment: Netlify and AWS](#10-deployment-netlify-and-aws)
11. [Common problems and fixes](#11-common-problems-and-fixes)

---

## 1. What you're building

Lend IT Book Kiosk is a full-stack web application that lets students browse, borrow, reserve, and donate physical books from an automated kiosk. Library staff (and later, administrators) can manage inventory and generate reports.

The app has three layers:

- **Frontend** — what users see and click (React, runs in the browser)
- **Backend** — business logic and data access (Spring Boot, runs on a server)
- **Database** — where data lives (H2 in-memory for now, PostgreSQL later)

They communicate over HTTP using a REST API with JSON payloads.

---

## 2. Architecture overview

```
┌──────────────┐         HTTP/JSON        ┌──────────────┐       JDBC       ┌──────────────┐
│              │ ───────────────────────> │              │ ───────────────> │              │
│  React app   │                          │ Spring Boot  │                  │  H2 / Postgres│
│  (browser)   │ <─────────────────────── │  REST API    │ <─────────────── │   database    │
│              │                          │              │                  │              │
└──────────────┘                          └──────────────┘                  └──────────────┘
   Port 5173                                 Port 8080                          In-memory
  (dev server)                             (Spring Boot)                     or on disk
```

The React app never touches the database directly. It asks the backend via HTTP (`GET /api/books`, `POST /api/loans`, etc.). The backend validates requests, runs business logic, and talks to the database.

This separation is important: you can swap the frontend (mobile app, kiosk touchscreen) without rewriting the backend, and vice versa.

---

## 3. Tech stack and why

### Backend: Spring Boot 3.x + Java 21

**What it is:** Spring Boot is a Java framework that takes care of boilerplate so you can focus on writing endpoints. It handles HTTP routing, dependency injection, database access, and more.

**Why:** You already know Java. Spring Boot is the de facto standard for Java web backends — job listings ask for it constantly, documentation is everywhere, and the ecosystem is mature.

### Frontend: React 18 + Vite

**What it is:** React is a JavaScript library for building user interfaces out of reusable components. Vite is the build tool that serves your code during development and bundles it for production.

**Why React:** It's the most-used frontend framework in industry. Component model maps well to UI thinking.

**Why Vite instead of Create React App:** CRA is deprecated. Vite starts in under a second, has hot module reloading that actually works, and produces smaller production builds.

### Database: H2 (dev) → PostgreSQL (production)

**H2** is a tiny database that runs inside your Java process. Zero installation. Perfect for getting started. Data disappears when you restart the backend.

**PostgreSQL** is what you'd use in production — free, rock-solid, and what most jobs use. The code doesn't change when you switch; only a configuration file does. More on this in [section 8](#8-database-strategy).

### HTTP client: Axios

Axios wraps the browser's `fetch` API with better defaults (automatic JSON parsing, request/response interceptors, cleaner error handling).

### Routing: React Router

Turns URLs like `/books/123` into component renders without full page reloads.

### Build / dependency management

- **Maven** for the backend (`pom.xml` lists dependencies)
- **npm** for the frontend (`package.json` lists dependencies)

---

## 4. Tools to install

Check each with the `--version` command after installing.

| Tool | Why | Install |
|---|---|---|
| **JDK 21** | Run the backend | [Adoptium Temurin](https://adoptium.net/) |
| **Node.js 20+** | Run the frontend | [nodejs.org](https://nodejs.org/) (LTS) |
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |
| **IntelliJ IDEA** | Java IDE (you already use this) | Community edition is free |
| **VS Code** | Frontend editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Postman** or **Bruno** | Test API endpoints | Either works |

**VS Code extensions worth installing:**

- ES7+ React/Redux/React-Native snippets
- Prettier — Code formatter
- ESLint

**IntelliJ plugins:**

- Spring Boot Assistant (usually bundled)
- Lombok (if you use Lombok annotations)

Verify everything works:

```bash
java --version        # should show 21
node --version        # should show 20+
npm --version         # should show 10+
git --version         # any recent version
```

---

## 5. Project layout

```
lend-it-book-kiosk/
├── backend/
│   ├── pom.xml                          # Maven config + dependencies
│   ├── mvnw, mvnw.cmd                   # Maven wrapper (auto-installs Maven)
│   └── src/main/
│       ├── java/com/lendit/bookkiosk/
│       │   ├── BookKioskApplication.java   # entry point
│       │   ├── config/                     # cross-cutting config (CORS, etc.)
│       │   ├── controller/                 # HTTP endpoints (the "routes")
│       │   ├── model/                      # JPA entities (database tables)
│       │   ├── repository/                 # database query interfaces
│       │   ├── service/                    # business logic
│       │   └── dto/                        # request/response shapes
│       └── resources/
│           ├── application.properties      # config (port, DB URL, etc.)
│           └── data.sql                    # seed data on startup
└── frontend/
    ├── package.json                     # npm dependencies + scripts
    ├── vite.config.js                   # Vite config (proxy, plugins)
    ├── index.html                       # single entry HTML
    └── src/
        ├── main.jsx                     # React entry point
        ├── App.jsx                      # root component with routes
        ├── styles.css                   # global styles
        ├── api/client.js                # Axios setup
        ├── context/AuthContext.jsx      # logged-in user state
        ├── components/                  # reusable UI pieces
        │   ├── Navbar.jsx
        │   └── BookCard.jsx
        └── pages/                       # one file per screen
            ├── Login.jsx
            ├── Register.jsx
            ├── BrowseBooks.jsx
            ├── BookDetail.jsx
            └── MyLoans.jsx
```

### What each backend layer does (this is important)

A request like "show me all books" flows through these layers:

1. **Controller** — receives the HTTP request (`GET /api/books`), pulls parameters from the URL, returns a response. Thin. No business logic here.
2. **Service** — where your actual logic lives (check availability, calculate fees, enforce rules). Controllers call services.
3. **Repository** — talks to the database. You write an interface, Spring generates the SQL.
4. **Model** — plain Java classes that map to database tables (a `Book` class = `books` table).
5. **DTO** (Data Transfer Object) — the shapes of data that cross the API boundary. You almost never expose models directly because they can leak internal details.

Following this separation religiously is what distinguishes junior code from senior code. It pays off the moment requirements change.

---

## 6. Running the project locally

### Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows use `mvnw.cmd spring-boot:run`. The first run downloads Maven and all dependencies — give it a few minutes.

You'll see log output ending with something like:

```
Started BookKioskApplication in 3.452 seconds
```

Test it's alive: open `http://localhost:8080/api/books` in your browser. You should see a JSON array of seeded books.

Or in IntelliJ: open `backend/pom.xml` as a project, then right-click `BookKioskApplication.java` → Run.

### Start the frontend

In a **separate terminal** (keep the backend running):

```bash
cd frontend
npm install          # first time only
npm run dev
```

Vite will show you:

```
  VITE v5.x.x  ready in 342 ms
  ➜  Local:   http://localhost:5173/
```

Open that URL. You should see the app.

### Test the full flow

1. Register a new account
2. Log in
3. Browse books
4. Click a book → borrow it
5. View your loans

If any step fails, check both terminal windows for errors. The backend logs everything.

---

## 7. How the pieces talk to each other

Let's trace a single action: **a student borrows a book.**

### Frontend side

`BookDetail.jsx` has a "Borrow" button. When clicked:

```javascript
const handleBorrow = async () => {
  const response = await api.post(`/loans`, { bookId: book.id });
  // api is the Axios instance, configured to hit http://localhost:8080/api
};
```

Axios sends:

```
POST http://localhost:8080/api/loans
Authorization: Bearer <token-from-localStorage>
Content-Type: application/json

{ "bookId": 42 }
```

### Backend side

`LoanController.java` has a method mapped to `POST /api/loans`:

```java
@PostMapping
public LoanDto createLoan(@RequestBody CreateLoanRequest req,
                          @RequestHeader("Authorization") String auth) {
    Long userId = authService.validateToken(auth);
    return loanService.borrowBook(userId, req.bookId());
}
```

That calls `LoanService.borrowBook`, which:

1. Checks the book exists and is available
2. Creates a `Loan` entity with a 14-day due date
3. Marks the book as unavailable
4. Saves both via the repositories
5. (Later) sends an email notification
6. Returns a `LoanDto`

Spring serializes the DTO to JSON, sets the HTTP status to 200, and sends it back.

### Back to the frontend

The promise resolves with the loan data. The frontend shows a success message and refreshes the book list.

This round-trip is the fundamental pattern of the entire app. Once you understand one, you understand all of them.

---

## 8. Database strategy

The project ships with **H2** running in-memory — meaning the database lives inside your Java process and resets every restart. Great for development, useless for real data.

### Staying on H2 (for now)

- Pro: zero setup, fast, you can focus on the app
- Con: data vanishes on restart

Seed data is loaded from `src/main/resources/data.sql` every time the backend starts, so you always have test books to work with.

### Switching to PostgreSQL later

When you're ready:

1. Install PostgreSQL locally ([postgresql.org](https://www.postgresql.org/download/))
2. Create a database: `createdb lenditbookkiosk`
3. In `application.properties`, replace the H2 config with:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lenditbookkiosk
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

4. In `pom.xml`, swap the H2 dependency for PostgreSQL:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

That's it — no code changes. Spring Data JPA generates the right SQL for each database.

### My recommendation

- **Development:** H2 in-memory (what you have now)
- **Production:** PostgreSQL on AWS RDS (managed, backed up, free tier for a year)
- **Skip:** MongoDB and other NoSQL databases. Your data is relational (loans reference books reference users). Fighting a document DB for this shape wastes effort.

---

## 9. Feature suggestions and roadmap

Your current use case diagram covers the foundation. Here's a suggested order for adding features, ordered by value-to-effort ratio.

### Must-have (v1)

These are baked into the current codebase already:

- Register / login
- Browse books with search
- Borrow a book
- View your active loans
- Return a book

### High-impact next steps (v2)

- **Reservations for unavailable books** — queue students who want a book that's currently out. Auto-notify when returned.
- **Search filters** — genre, author, availability. The data is already there; just needs UI.
- **Book detail page** — cover image, description, reviews, similar books (you could apply your MovieTweetings similarity work here).
- **Due date reminders** — scheduled job sends emails 2 days before due date.
- **Late fee calculation** — cron job that checks overdue loans daily.

### Interesting stretch goals (v3)

- **Recommendation system** — you already know MapReduce. The Spotify analyzer interest translates directly here. For each user, compute Pearson or cosine similarity against other users' borrow history to suggest books. You could actually run this offline as a MapReduce job and load results into the DB.
- **Reading progress tracker** — users log what page they're on; the kiosk remembers for next borrow.
- **Book clubs / reading challenges** — social layer.
- **Mobile app** — React Native reuses 80% of your web code.
- **Admin dashboard** — charts of borrowed books per week, most popular genres, overdue rates (Chart.js or Recharts).
- **QR code for kiosk** — scan book QR code instead of searching.

### Features I'd skip initially

- Real-time chat
- Video content
- Payment processing (use a dummy "paid" flag until you actually need Stripe)

### Architectural upgrades to consider

- **Proper JWT authentication** with Spring Security (replace the simple token scheme)
- **Input validation** with Bean Validation (`@Valid`, `@NotBlank`, etc.)
- **API documentation** with Springdoc OpenAPI (auto-generates Swagger UI)
- **Integration tests** with Spring Boot Test + Testcontainers
- **Logging** with structured JSON logs (Logback + Logstash encoder)
- **Rate limiting** on login endpoint (prevents brute force)

---

## 10. Deployment: Netlify and AWS

Short answer: **Netlify can only host the frontend.** You need somewhere else for the Java backend.

### The simplest path (recommended for first deploy)

- **Frontend:** Netlify (free, connects to GitHub, auto-deploys on push)
- **Backend:** Railway, Render, or Fly.io (free-ish tiers, easier than AWS)
- **Database:** The same provider usually offers managed PostgreSQL

Why not go straight to AWS: AWS has a learning curve and you'll spend more time on infrastructure than code. Railway/Render is a pit stop, not a final destination.

### Deploying the frontend to Netlify

1. Push the project to GitHub
2. Sign in to Netlify → "Add new site" → "Import from Git"
3. Pick your repo
4. Build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Add an environment variable:
   - `VITE_API_BASE_URL` = your deployed backend URL (e.g., `https://lenditbookkiosk-api.onrender.com`)
6. Deploy

Netlify gives you a `*.netlify.app` URL and redeploys automatically every `git push`.

### Deploying the backend to AWS

You have three main options, ordered by difficulty:

#### Option A: Elastic Beanstalk (easiest)

Beanstalk is AWS's "just give me a URL" service. It handles the EC2 instance, load balancer, and deploys for you.

1. Install AWS CLI and configure it (`aws configure`)
2. Install EB CLI (`pip install awsebcli`)
3. Build your JAR: `./mvnw clean package`
4. In the `backend` folder: `eb init` (choose Java platform, Corretto 21)
5. `eb create lendit-env` (creates the environment)
6. `eb deploy` (uploads your JAR)

You get a URL like `lendit-env.us-east-1.elasticbeanstalk.com`. Put that in Netlify's `VITE_API_BASE_URL`.

**Cost:** Free for 12 months with t2.micro (eligible for free tier), ~$10/month after.

#### Option B: ECS with Fargate (intermediate)

Containerize the backend with Docker, push to ECR, run on Fargate. More portable, more moving parts. Skip this until you outgrow Beanstalk.

#### Option C: Full AWS (frontend + backend)

If you want everything on AWS:

- **Frontend:** S3 (static hosting) + CloudFront (CDN) + Route 53 (DNS), OR AWS Amplify (easier, all-in-one)
- **Backend:** Elastic Beanstalk
- **Database:** RDS PostgreSQL (db.t4g.micro is free tier eligible)
- **Email:** SES for the notification use case

AWS Amplify is the Netlify-equivalent on AWS — same Git-based auto-deploy, just more AWS-ecosystem friendly. Give it the `frontend` folder and the same build settings as Netlify.

### My concrete recommendation

Start with **Netlify + Render** to get it live fast. Migrate to AWS when one of these is true:

- You want the résumé line (valid reason)
- You're hitting free tier limits
- You need AWS-specific services (SES for email, SQS for job queues)

Don't deploy to AWS "because it's more professional." Deploy where you can ship without fighting the infrastructure.

### Environment variables (don't hardcode URLs)

Never hardcode `http://localhost:8080` in your frontend code. The starter uses `import.meta.env.VITE_API_BASE_URL` with a fallback. In production, Netlify and Amplify inject the variable at build time.

Same on the backend for the database URL, email credentials, etc. Use `application-prod.properties` and activate it with `SPRING_PROFILES_ACTIVE=prod`.

---

## 11. Common problems and fixes

### "CORS error" in browser console

Means the backend isn't letting the frontend's origin through. Check `CorsConfig.java` — the allowed origin list must include `http://localhost:5173` during development and your Netlify URL in production.

### Backend starts but endpoints return 404

- Check the URL prefix. The starter uses `/api/*`, so `http://localhost:8080/api/books`, not `http://localhost:8080/books`
- Make sure the controller class has `@RestController` (not just `@Controller`)

### `npm install` fails with weird errors

Delete `node_modules` and `package-lock.json`, then `npm install` again. 80% of npm problems are fixed by this.

### Port 8080 already in use

Another process is using it. Either kill it or change the backend port in `application.properties`:

```properties
server.port=8081
```

Update `frontend/src/api/client.js` to match.

### Maven downloads hang forever

Usually a network issue or a corporate proxy. Check `~/.m2/settings.xml` for proxy settings.

### "Cannot find module" in React

You imported something you didn't install, or you misspelled the path. React is case-sensitive on Linux and macOS (deploys), case-insensitive on Windows (dev). That's a classic Netlify deploy failure.

### IntelliJ doesn't recognize Spring Boot

Make sure you opened the `pom.xml` as a project (File → Open → select `pom.xml` → Open as Project). If you opened the folder, IntelliJ won't know it's Maven.

---

## What to build next (after you've got it running)

1. Run the starter end-to-end. Register, login, borrow, return. Read the log output and match it to the code.
2. Add a new endpoint: `GET /api/books/search?genre=fiction`. Start in the controller, work down.
3. Add the reservation feature. You have the class diagram — implement `Reservation` just like `Loan`.
4. Replace the in-memory token auth with JWT + Spring Security. Hard but résumé-worthy.
5. Deploy to Netlify + Render.

Build it piece by piece. Every working feature is a small win. Don't try to do everything at once.
