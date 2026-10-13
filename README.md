# Meme’d Campaign Payout Tracker

A full-stack campaign management and payout tracking platform built for the WLDD SDE I assignment. The application connects brands running social media campaigns with creators submitting Instagram and YouTube posts. It tracks simulated post views, calculates milestone-based creator payouts, and ensures campaign payouts stay within the available budget.

## Project Status

- [x] Backend API development
- [x] JWT authentication and role-based authorization
- [x] Campaign creation and listing
- [x] Creator post submissions
- [x] Milestone-based payout calculation
- [x] Campaign budget cap enforcement
- [x] Frontend for brands and creators
- [x] Payout utility unit tests
- [ ] Production deployment
- [ ] Dockerization after deployment
- [ ] Final deployed application verification

## Features

### Authentication and Authorization
- User signup and login using JWT authentication.
- Password hashing using bcrypt.
- Two user roles: `brand` and `creator`.
- Protected API endpoints with role-based access control.

### Brand Dashboard
- Create campaigns for Instagram and YouTube.
- Configure campaign budgets and payout milestones.
- View campaigns owned by the authenticated brand.
- Track total budget, spent budget, and remaining budget.

### Creator Dashboard
- Browse live campaigns.
- View campaign budgets and payout milestones.
- Submit social media post URLs.
- Track submitted posts, simulated views, and allocated earnings.
- Update simulated view counts and see the corresponding payout calculation.

### Payout and Budget Management
- Calculate payouts based on the highest milestone reached.
- Avoid allocating the same milestone payout more than once.
- Cap additional payouts at the campaign’s remaining budget.
- Use MongoDB transactions and conditional budget updates to protect budget consistency.
- Track payout status as `pending`, `paid`, or `unfunded`.

**Note:** Payouts represent amounts allocated by the application. The application does not transfer actual money to creators. The `paid` status indicates that the calculated milestone payout has been fully allocated, not that a real payment has been processed.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Validation | Zod and server-side validation |
| Testing | Jest, ts-jest |
| Version control | Git, GitHub |
| Planned infrastructure | Docker and Docker Compose, after deployment |

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
│   │   └── payout.utils.test.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── brand/
│   │   │   ├── creator/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js (LTS recommended)
- npm
- MongoDB Atlas account or a reachable MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd WLLD_Assingment
```

Replace the repository URL with the actual public GitHub URL after publishing the project.

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using `.env.example` as a reference.

Configure the following environment variables using the exact names expected by the backend:

```dotenv
PORT=5000
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
CLIENT_URL=http://localhost:3000
```

Use your actual backend port and environment variable names if they differ from these examples.

Start the backend in development mode using the script configured in `backend/package.json`:

```bash
npm run dev
```

The backend API will be available at the configured port. For example, if `PORT=5000`, the API base URL is `http://localhost:5000`.

### 3. Configure the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` and configure the backend URL:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Change the port if your backend uses a different one.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Use the Application

1. Sign up as a brand and create a campaign.
2. Configure the campaign's total budget and milestone ladder.
3. Sign up or log in as a creator using a separate account.
4. Browse live campaigns and submit an eligible post URL.
5. Update the simulated view count.
6. Verify the payout status, allocated earnings, and campaign budget.

## API Documentation

All endpoints use the `/api` prefix. Protected endpoints require a JWT access token in the following header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a brand or creator |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get the authenticated user's information |

### Campaigns

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/campaigns` | Create a campaign (brand only) |
| GET | `/api/campaigns` | List live campaigns |
| GET | `/api/campaigns/mine` | List campaigns owned by the authenticated brand |

### Submissions

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/submissions` | Submit a post to a campaign (creator only) |
| GET | `/api/submissions/mine` | List the authenticated creator's submissions |
| PATCH | `/api/submissions/:id/views` | Update simulated views and recalculate the payout |

The view-update endpoint requires authentication. In accordance with the assignment specification, it does not impose an additional role check.

## Payout Calculation

For each submission, the application identifies the highest milestone whose view threshold has been reached.

The additional payout is calculated as:

```text
Target Payout = Payout of the Highest Reached Milestone

Additional Payout =
  min(
    max(0, Target Payout - Current Payout),
    Remaining Campaign Budget
  )

New Submission Payout =
  Current Payout + Additional Payout
```

The campaign's remaining budget is:

```text
Remaining Budget = Total Budget - Spent Budget
```

### Example

Consider a campaign with the following milestones:

| Views | Target payout |
|---:|---:|
| 10,000 | ₹500 |
| 50,000 | ₹2,000 |
| 100,000 | ₹5,000 |

If a creator's post reaches 50,000 views, its target payout becomes ₹2,000. If the creator has already received an allocation of ₹500, only the additional ₹1,500 is eligible, subject to the remaining campaign budget.

If only ₹800 remains in the campaign budget, the application allocates at most ₹800 more. The submission's status reflects whether its full target payout has been allocated.

## Testing

Run the backend tests:

```bash
cd backend
npm test
```

Build the backend:

```bash
npm run build
```

Check frontend TypeScript:

```bash
cd frontend
npx tsc --noEmit
```

Build the frontend for production:

```bash
npm run build
```

The payout utility unit tests cover milestone selection, first-time payout allocation, repeated updates, budget caps, and invalid or negative additional payout calculations.

## Assumptions and Limitations

- View counts are simulated through the API; social media platforms are not queried for live analytics.
- A creator can submit only one post per campaign.
- Only live campaigns are listed for creators.
- Campaign payout milestones are configured in ascending view-threshold order, with non-decreasing payout amounts.
- A campaign cannot allocate more than its total budget.
- Payouts are application-level allocations, not real financial transfers.
- The current authentication implementation stores the JWT in browser local storage. This is convenient for the assignment, but a production deployment should consider stronger token storage and XSS protections.
- The project currently focuses on the core assignment requirements. Production monitoring, automated social analytics, and actual payment integration are outside the current scope.

## Deployment and Future Work

### Deployment

The next phase is to deploy the backend and frontend, configure production environment variables, connect the hosted backend to MongoDB Atlas, and verify the complete workflow using the deployed application.

- **Live application:** To be added after deployment.
- **Backend URL:** To be added after deployment.
- **GitHub repository:** To be added after publishing.

### Dockerization — Planned After Deployment

Dockerization will be completed after the initial deployment and verification of the application.

Planned work includes:

- Create a Dockerfile for the Node.js/Express backend.
- Create a Dockerfile for the Next.js frontend.
- Add a Docker Compose configuration for local multi-service development.
- Configure environment variables and networking between services.
- Test the containerized application and document the commands required to run it.

Dockerization is planned work and is not yet claimed as completed.

## Author

Developed as part of the WLDD SDE I assignment.
