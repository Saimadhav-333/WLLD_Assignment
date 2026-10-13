# Meme’d Campaign Payout Tracker

A full-stack campaign management and payout tracking platform built for the **WLDD SDE I assignment**. The application connects brands running social media campaigns with creators submitting Instagram and YouTube posts. It tracks simulated post views, calculates milestone-based creator payouts, and ensures campaign payouts remain within the available budget.

The application includes JWT authentication, role-based authorization, campaign lifecycle management, MongoDB transactions for budget consistency, and Docker-based local deployment.

## Project Status

- [x] Backend API development using Node.js, Express, and TypeScript
- [x] JWT authentication and role-based authorization
- [x] Brand and creator dashboards
- [x] Campaign creation and listing
- [x] Campaign pause, resume, and completion
- [x] Creator post submissions
- [x] Milestone-based payout calculation
- [x] Campaign budget cap enforcement
- [x] MongoDB transaction-based payout processing
- [x] Payout utility unit tests
- [x] Frontend development using Next.js and TypeScript
- [x] Dockerfiles for frontend and backend
- [x] Docker Compose configuration
- [x] Local containerized application startup
- [ ] Public GitHub repository publication
- [ ] Production deployment
- [ ] Final deployed application verification

## Features

### 1. Authentication and Authorization

- User signup and login using JWT authentication.
- Password hashing using bcrypt.
- Two user roles: `brand` and `creator`.
- Protected API endpoints with role-based access control.
- Authenticated user information through the `/api/auth/me` endpoint.

### 2. Brand Dashboard

- Create campaigns for Instagram and YouTube.
- Configure total campaign budgets and payout milestones.
- View campaigns owned by the authenticated brand.
- Track total budget, spent budget, and remaining budget.
- View campaign status and budget utilization.
- Pause live campaigns.
- Resume paused campaigns.
- Complete campaigns when they are no longer active.

### 3. Creator Dashboard

- Browse live campaigns.
- View campaign budgets and payout milestones.
- Submit social media post URLs.
- View previously submitted posts.
- Update simulated view counts.
- Track allocated earnings and payout status.

### 4. Campaign Lifecycle Management

Campaigns support three statuses:

| Status | Description |
|---|---|
| `live` | The campaign is available for eligible creator submissions. |
| `paused` | The campaign is temporarily inactive and unavailable for new submissions. |
| `completed` | The campaign has been marked as finished and cannot be resumed. |

Brands can manage the lifecycle of their own campaigns. Campaign status changes are validated on the backend, and completed campaigns cannot be reopened.

### 5. Payout and Budget Management

- Identify the highest milestone reached by a submitted post.
- Allocate only the additional payout required to reach the applicable milestone.
- Prevent duplicate allocation of the same milestone amount.
- Never allocate more than the campaign's remaining budget.
- Use MongoDB transactions and conditional budget updates to protect budget consistency.
- Track payout status as `pending`, `paid`, or `unfunded`.

**Important:** Payouts are application-level allocations. The application does not transfer actual money to creators. A `paid` status means the calculated milestone target has been fully allocated; it does not indicate that a real financial transaction has occurred.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Validation | Zod and server-side validation |
| Testing | Jest, ts-jest |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |
| Deployment | Planned: Render for backend and Vercel for frontend |

## Project Structure

```text
WLLD_Assingment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
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
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
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
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Prerequisites

### For local development without Docker

- Node.js (version compatible with the project; Node.js 22 is used for the Docker images)
- npm
- A MongoDB Atlas account or another reachable MongoDB instance
- Git

### For Docker-based execution

- Docker Desktop installed on Windows
- Docker Desktop running successfully
- WSL 2 enabled if using the WSL 2 backend on Windows
- MongoDB Atlas credentials or another MongoDB connection string accessible from the containers

Verify the installations:

```powershell
node --version
npm --version
git --version
docker --version
docker compose version
```

## Environment Configuration

The application requires environment variables for database connectivity, authentication, and frontend/backend communication.

### Backend environment variables

Create `backend/.env` using `backend/.env.example` as a reference.

Example:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<your-long-random-secret>
FRONTEND_URL=http://localhost:3000
```

Use the exact environment variable names expected by the backend source code. If your CORS configuration uses `CLIENT_URL` instead of `FRONTEND_URL`, configure that name instead.

Replace all placeholders with valid values. Ensure the MongoDB database user's password is URL-encoded when necessary in the connection string.

### Frontend environment variables

For local development, create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The frontend uses this URL to communicate with the backend.

**Security requirements:**

- Never commit `backend/.env` or `frontend/.env.local`.
- Commit `.env.example` files containing placeholders only.
- Never place database credentials or JWT secrets in frontend environment variables.
- Rotate any credentials that have been exposed.
- Keep production environment variables in the deployment platform's secret configuration.

## Getting Started: Local Development

### 1. Clone the repository

After publishing the repository to GitHub, use:

```powershell
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd WLLD_Assingment
```

Replace the placeholder with the actual repository URL.

### 2. Configure and start the backend

Open a terminal:

```powershell
cd backend
npm install
```

Create `backend/.env` and configure the required variables.

Start the backend using the development script configured in `backend/package.json`:

```powershell
npm run dev
```

The backend should be available at:

```text
http://localhost:5000
```

### 3. Configure and start the frontend

Open a separate terminal from the project root:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local` with:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Keep both terminals running while using the application.

## Running the Application with Docker

Docker packages the frontend and backend into separate container images. Docker Compose starts both services and connects them through a shared Docker network.

The MongoDB database remains external when using the current configuration, so a reachable MongoDB instance is still required.

### Docker files

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Builds and runs the Express backend. |
| `frontend/Dockerfile` | Builds and runs the Next.js frontend. |
| `backend/.dockerignore` | Excludes unnecessary or sensitive backend files from the Docker build context. |
| `frontend/.dockerignore` | Excludes unnecessary or sensitive frontend files from the Docker build context. |
| `docker-compose.yml` | Builds, configures, and starts both services. |

The `.dockerignore` files are different from `.gitignore`. They should be committed to GitHub because they are part of the container build configuration.

### 1. Verify Docker Desktop

Start Docker Desktop and wait until the Docker engine is running.

From PowerShell, navigate to the project root:

```powershell
cd D:\WLLD_Assingment
```

Verify Docker is available:

```powershell
docker --version
docker compose version
docker info
```

### 2. Configure the backend environment

Ensure `backend/.env` exists and contains valid credentials.

For example:

```dotenv
PORT=5000
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
FRONTEND_URL=http://localhost:3000
```

Use the environment variable names expected by your backend code. Do not put real credentials in `docker-compose.yml` or commit them to Git.

The current Compose configuration loads the backend environment from `backend/.env`.

### 3. Verify the Compose configuration

From the project root, run:

```powershell
docker compose config
```

This checks whether Docker Compose can parse the configuration.

Review the output locally and do not publish it if it contains resolved credentials.

### 4. Build the images and start the containers

Run:

```powershell
docker compose up --build
```

This command:

1. Reads the root `docker-compose.yml`.
2. Builds the backend image using `backend/Dockerfile`.
3. Builds the frontend image using `frontend/Dockerfile`.
4. Creates the Docker network.
5. Creates and starts the backend container.
6. Creates and starts the frontend container.
7. Displays logs from both services in the terminal.

The first build can take several minutes because Docker must download the base images, install dependencies, and build the applications.

When startup succeeds, the logs should indicate that the Next.js frontend is ready and the Express backend is running. The backend should also report a successful MongoDB connection.

Keep this terminal open while the application is running.

### 5. Open the containerized application

| Service | Local URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend health check | http://localhost:5000/api/health |

Open the frontend in your browser and test the application.

If the backend port or the host port mapping is changed, use the corresponding URL.

### 6. Run containers in the background

To start the application without keeping the logs attached to the current terminal, run:

```powershell
docker compose up --build -d
```

The `-d` option runs the containers in detached mode.

Check the running services:

```powershell
docker compose ps
```

Display logs:

```powershell
docker compose logs
```

Display only backend logs:

```powershell
docker compose logs backend
```

Display only frontend logs:

```powershell
docker compose logs frontend
```

Follow logs continuously:

```powershell
docker compose logs -f
```

Press `Ctrl + C` to stop following the logs. In detached mode, this does not stop the containers.

### 7. Stop the application

To stop the containers while preserving them for a later restart:

```powershell
docker compose stop
```

To start the existing containers again:

```powershell
docker compose start
```

To stop and remove the Compose containers and their default network:

```powershell
docker compose down
```

The default `docker compose down` command does not delete the project source code or the MongoDB Atlas database.

### 8. Rebuild after changing code

If you change backend or frontend code, rebuild and restart the application:

```powershell
docker compose up --build -d
```

To view the latest logs:

```powershell
docker compose logs -f
```

If you changed a Dockerfile, dependencies, or the build-time frontend API URL, rebuilding is especially important.

### 9. Configure the frontend API URL correctly

The frontend's `NEXT_PUBLIC_API_URL` is supplied to the Next.js build in the current Docker configuration.

For local browser access, the API URL should be:

```text
http://localhost:5000
```

The browser uses this address to access the backend through the published host port.

Do not use `http://backend:5000` as the browser-facing API URL. The hostname `backend` is used for communication between containers on the Docker network, whereas the user's browser accesses the application through the host.

If the backend host port changes to `5001`, update the frontend's build argument to `http://localhost:5001` and rebuild the frontend.

### 10. Troubleshooting Docker

**Port 5000 is already in use**

Check which process is using the port:

```powershell
netstat -ano | findstr :5000
```

Identify the process using its PID:

```powershell
Get-Process -Id <PID>
```

Stop the existing application if appropriate, or change the host-side port mapping in `docker-compose.yml`. If you change the host port, update the frontend API URL and rebuild.

**Backend cannot connect to MongoDB**

Check the backend logs:

```powershell
docker compose logs backend
```

Verify that `MONGODB_URI` is correct, the database user's credentials are valid, the MongoDB Atlas network access configuration permits the connection, and the database is reachable from the container.

**Invalid environment variable error**

Inspect `backend/.env` and look for malformed entries, especially lines beginning with `=` or containing an incomplete variable assignment.

Each environment variable should have a name, for example:

```dotenv
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
```

**Frontend cannot reach the backend**

Check that the backend is running and that the frontend was built with the correct `NEXT_PUBLIC_API_URL`.

```powershell
docker compose ps
docker compose logs backend
docker compose logs frontend
```

**View all container status information**

```powershell
docker compose ps -a
```

Do not share logs or configuration output publicly if they contain credentials or other secrets.

## Using the Application

1. Register an account with the `brand` role.
2. Log in and create a campaign for Instagram or YouTube.
3. Configure the campaign's total budget and payout milestones.
4. Register or log in using a separate account with the `creator` role.
5. Browse live campaigns and submit an eligible social media post URL.
6. Update the simulated view count for a submission.
7. Review the calculated payout and campaign budget.
8. Log back in as the brand to pause, resume, or complete the campaign.

Use separate brand and creator accounts to verify the role-specific workflows.

## API Documentation

All endpoints use the `/api` prefix.

Protected endpoints require a JWT access token in the following header:

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
| PATCH | `/api/campaigns/:id/status` | Update campaign status (brand owner only) |

The campaign status endpoint accepts a status such as `live`, `paused`, or `completed`, subject to the campaign lifecycle rules.

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
Target Payout =
    Payout of the Highest Reached Milestone

Additional Payout =
    min(
        max(0, Target Payout - Current Payout),
        Remaining Campaign Budget
    )

New Submission Payout =
    Current Payout + Additional Payout

Remaining Budget =
    Total Budget - Spent Budget
```

### Example

Consider a campaign with the following milestones:

| Views | Target payout |
|---:|---:|
| 10,000 | ₹500 |
| 50,000 | ₹2,000 |
| 100,000 | ₹5,000 |

If a creator's post reaches 50,000 views, its target payout becomes ₹2,000.

If ₹500 has already been allocated to that submission, the additional payout required is ₹1,500, subject to the remaining campaign budget.

If only ₹800 remains in the campaign budget, the application allocates at most ₹800 more. The submission's payout status reflects whether the full target payout has been allocated.

This approach ensures that the campaign's total allocated payout does not exceed its budget.

## Testing

### Backend unit tests

From the project root:

```powershell
cd backend
npm test
```

### Backend production build

```powershell
npm run build
```

### Frontend TypeScript check

```powershell
cd ..\frontend
npx tsc --noEmit
```

### Frontend production build

```powershell
npm run build
```

### Docker verification

From the project root:

```powershell
docker compose up --build
```

In another terminal, verify the running containers:

```powershell
docker compose ps
```

The payout utility unit tests cover milestone selection, first-time payout allocation, repeated updates, budget caps, and invalid or negative additional payout calculations.

## Assumptions and Limitations

- View counts are simulated through the API; the application does not retrieve live analytics from social media platforms.
- A creator can submit only one post per campaign.
- Only live campaigns are listed for creators.
- New submissions are restricted to eligible live campaigns.
- Campaign payout milestones must be ordered by ascending view thresholds with non-decreasing payout amounts.
- A campaign cannot allocate more than its total budget.
- Campaign status management is restricted to the owning brand.
- Completed campaigns cannot be resumed.
- Payouts are application-level allocations and do not represent real financial transfers.
- The current authentication implementation stores JWTs in browser local storage. A production deployment should consider stronger token storage and XSS protections.
- Automated social analytics, real payment integration, and production monitoring are outside the current scope.

## Deployment

The application is intended to be deployed with the frontend and backend hosted separately.

Planned deployment configuration:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Before deployment:

1. Push the reviewed source code to a public GitHub repository.
2. Configure the backend's production environment variables.
3. Deploy the backend and verify its health endpoint.
4. Configure the frontend's `NEXT_PUBLIC_API_URL` to use the deployed backend URL.
5. Configure backend CORS to allow the deployed frontend origin.
6. Redeploy the frontend after changing build-time environment variables.
7. Test signup, login, campaign creation, campaign lifecycle management, submissions, and payouts using the deployed application.

### Deployment URLs

- **Live application:** To be added after deployment.
- **Backend URL:** To be added after deployment.
- **GitHub repository:** To be added after publishing.

## Future Improvements

- Integrate actual social media analytics APIs.
- Add real payment gateway integration.
- Introduce more comprehensive API integration tests.
- Improve production token security.
- Add monitoring, structured logging, and deployment health checks.
- Explore Redis caching and additional scalability improvements.

## Author

Developed as part of the **WLDD SDE I assignment**.
