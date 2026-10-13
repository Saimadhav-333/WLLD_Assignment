# Meme’d Campaign Payout Tracker

A full-stack campaign management and payout tracking platform developed for the **WLDD SDE I assignment**. It connects brands running social media campaigns with creators submitting Instagram and YouTube posts. The application tracks simulated post views, calculates milestone-based payouts, and ensures allocations stay within campaign budgets.

## Live Demo

**[Open the Live Application](https://wlld-assignment-frontend.onrender.com/)**

## Features

- **Authentication:** JWT-based authentication with brand and creator roles.
- **Brand Dashboard:** Create campaigns, configure budgets and payout milestones, and manage campaign status.
- **Campaign Lifecycle:** Pause, resume, and complete campaigns.
- **Creator Dashboard:** Browse live campaigns, submit post URLs, and track earnings.
- **Milestone-Based Payouts:** Calculate payouts based on post views and configured milestones.
- **Budget Enforcement:** Prevent payouts from exceeding the available campaign budget.
- **Concurrency Safety:** MongoDB transactions and conditional budget updates.
- **Testing:** Unit tests for payout calculation logic.

> **Note:** Post views are simulated. Payouts represent application-level allocations; no actual money is transferred.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Testing | Jest, ts-jest |
| Containerization | Docker, Docker Compose |
| Deployment | Render |

## Project Structure

```text
WLLD_Assingment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   ├── src/lib/
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or another reachable MongoDB instance

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd WLLD_Assingment
```

Replace the placeholder with your GitHub repository URL.

### 2. Configure and Run the Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file using `.env.example` as a reference. Configure the environment variables expected by your backend, including:

```dotenv
PORT=5000
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
CLIENT_URL=http://localhost:3000
```

Use `FRONTEND_URL` instead of `CLIENT_URL` if that is the variable name used in your backend.

Start the backend:

```bash
npm run dev
```

### 3. Configure and Run the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

## Running with Docker

Docker Compose builds and runs the frontend and backend containers. MongoDB remains hosted separately, so a reachable MongoDB instance is required.

Ensure `backend/.env` contains the required configuration before starting.

### Build and Start

Run from the project root:

```bash
docker compose up --build
```

The application will be available at:

- **Frontend:** http://localhost:3000
- **Backend health check:** http://localhost:5000/api/health

### Run in the Background

```bash
docker compose up --build -d
```

### View Running Containers

```bash
docker compose ps
```

### Stop the Containers

```bash
docker compose down
```

The `.dockerignore` files exclude unnecessary files from Docker build contexts. Keep them in the repository alongside the Dockerfiles and Compose configuration.

## API Endpoints

All endpoints use the `/api` prefix. Protected endpoints require a JWT bearer token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a brand or creator |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get authenticated user information |

### Campaigns

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/campaigns` | Create a campaign (brand only) |
| GET | `/api/campaigns` | List live campaigns |
| GET | `/api/campaigns/mine` | List campaigns owned by the brand |
| PATCH | `/api/campaigns/:id/status` | Update campaign status |

### Submissions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions` | Submit a post (creator only) |
| GET | `/api/submissions/mine` | List creator submissions |
| PATCH | `/api/submissions/:id/views` | Update simulated views and recalculate payouts |

## Payout Calculation

The application identifies the highest milestone reached and allocates only the additional payout required, subject to the remaining campaign budget.

```text
Remaining Budget = Total Budget - Spent Budget

Additional Payout = min(
  max(0, Target Payout - Current Payout),
  Remaining Budget
)

New Submission Payout = Current Payout + Additional Payout
```

Payout statuses are `pending`, `paid`, and `unfunded`. The `paid` status indicates that the milestone payout has been fully allocated, not that an actual payment has been made.

## Testing

Run backend unit tests:

```bash
cd backend
npm test
```

Build the backend:

```bash
npm run build
```

Check and build the frontend:

```bash
cd ../frontend
npx tsc --noEmit
npm run build
```

## Environment and Security

- Never commit `.env` or `.env.local` files.
- Commit only example environment files containing placeholders.
- Keep database credentials and JWT secrets out of source control.
- Configure production environment variables in Render.
- The current frontend stores JWTs in local storage; production applications should consider stronger token storage and XSS protections.

## Assumptions and Limitations

- Post views are simulated; live social media analytics are not integrated.
- A creator can submit one post per campaign.
- Only live campaigns are available for new submissions.
- Milestones use ascending view thresholds and non-decreasing payout amounts.
- The application tracks payout allocations but does not process real payments.

## Author

Developed as part of the **WLDD SDE I assignment**.
