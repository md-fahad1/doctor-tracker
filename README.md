# Doctor Tracker

A secure, responsive full-stack administrative web application for managing doctors, patients, users, authentication, and healthcare analytics. Doctor Tracker provides a clean admin dashboard with real-time aggregated statistics, server-side search and filtering, pagination, role-based access control, and responsive management interfaces for both desktop and mobile devices.

## Description

Doctor Tracker is a healthcare administration platform designed to help clinic or hospital administrators efficiently manage doctors and their associated patients from a centralized dashboard. Authenticated administrators can create, update, search, filter, and delete doctors, manage patients assigned to each doctor, and view aggregated healthcare statistics through interactive dashboard visualizations. The application also supports user account management and role-based authorization, allowing administrators to control which users can perform management operations. The system was built with a strong focus on performance, clean architecture, responsive UX, secure authentication, optimized MongoDB queries, reusable frontend components, and scalable REST API design.

## Core Features

### Authentication & Authorization

* Secure user registration and login
* JWT-based authentication
* Protected API routes
* Authentication state management on the frontend
* Role-based authorization
* Admin-only management functionality
* User accounts with roles
* Protected dashboard and application routes
* Password hashing using bcrypt
* Authenticated user profile endpoint
* User avatar upload
* Cloudinary-based avatar storage
* Automatic removal of previous avatars when replacing an image
* Unauthorized users cannot perform admin management operations

### Doctor Management

Administrators can:

* Create doctors
* View all doctors
* Search doctors
* Filter doctors by specialization
* Filter doctors by date
* Paginate doctor records
* View individual doctor details
* Edit doctor information
* Delete doctors
* View patients belonging to a doctor
* Add patients to a specific doctor
* Remove patients from a doctor
* View doctor-specific patient statistics

When deleting a doctor, the application displays a confirmation dialog showing the number of associated patients and clearly warns that deleting the doctor will also delete those patients.

Example:

> **Delete Dr. Sarah Ahmed?**
>
> This doctor has 12 patients. Deleting the doctor will also remove all associated patients. This action cannot be undone.

### Patient Management

Administrators can:

* View all patients
* Search patients by name or condition
* Filter by condition
* Filter by date range
* Paginate patient records
* Edit patient information
* Delete patients
* View assigned doctor information
* View patient age and gender
* View patient medical condition
* Manage patients directly from a doctor's detail page

### User Management

Administrators can manage application users through a dedicated Users page.

Features include:

* View registered users
* Search users
* View user information
* Manage user roles
* Activate/deactivate users where supported
* Delete users where permitted
* View account information
* Manage administrator-level access

Regular users can log in and access permitted areas of the application but cannot perform administrative doctor and patient management operations.

### Dashboard & Analytics

The dashboard provides aggregated healthcare statistics including:

* Total doctors
* Total patients
* Total users
* Average patients per doctor
* Patients per doctor
* Patient registration trends
* Patient condition breakdown
* Monthly patient statistics
* Top doctors based on patient count
* Condition percentage distribution
* Visual charts and statistics

Dashboard statistics are calculated on the backend using MongoDB aggregation pipelines rather than transferring large datasets to the frontend.

## Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

Responsive improvements include:

* Mobile-friendly navigation
* Responsive sidebar
* Responsive tables
* Horizontal scrolling for large datasets
* Responsive filters
* Mobile-friendly forms
* Responsive dashboard cards
* Responsive charts and analytics
* Adaptive spacing and typography
* Touch-friendly action buttons

## Tech Stack

### Frontend

* Next.js
* React
* App Router
* JavaScript
* Tailwind CSS
* Axios
* Lucide React
* Reusable React components

### Backend

* Node.js
* Express.js
* RESTful APIs
* JWT Authentication
* bcryptjs
* Mongoose
* Middleware-based authorization
* API validation and error handling

### Database

* MongoDB
* Mongoose
* MongoDB indexes
* Aggregation pipelines
* Server-side filtering
* Server-side pagination

### File Storage

* Cloudinary
* User avatar image uploads

## Architecture

The project uses a separate frontend and backend architecture.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │   Next.js Client    │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Server    │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │    MongoDB      │         │   Cloudinary    │
        │                 │         │                 │
        │ Users           │         │ User Avatars    │
        │ Doctors         │         │                 │
        │ Patients        │         │                 │
        └─────────────────┘         └─────────────────┘
```

### Request Flow

1. The user opens the Next.js frontend.
2. Authentication is handled through the login interface.
3. The frontend sends login credentials to the Express REST API.
4. The backend validates the credentials.
5. A signed JWT is generated after successful authentication.
6. The frontend stores the authentication token in a cookie.
7. Axios automatically attaches the JWT to protected API requests.
8. The `protect` middleware validates the JWT.
9. The authenticated user is attached to `req.user`.
10. Authorization middleware determines whether the user can perform the requested operation.
11. Express controllers communicate with MongoDB through Mongoose.
12. MongoDB performs filtering, searching, pagination, and aggregation.
13. The backend returns only the required data.
14. Next.js renders the data through reusable UI components.

## API Design

The backend follows RESTful API principles.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/avatar
```

### Doctors

```text
GET    /api/doctors
POST   /api/doctors
GET    /api/doctors/:id
PUT    /api/doctors/:id
DELETE /api/doctors/:id
```

### Doctor Patients

```text
GET    /api/doctors/:id/patients
POST   /api/doctors/:id/patients
```

### Patients

```text
GET    /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### Dashboard

```text
GET /api/dashboard/stats
```

### Users

User-management endpoints are protected and restricted to authorized administrators.

## Search, Filtering & Pagination

Doctor and patient listing APIs use server-side query parameters.

Example:

```text
GET /api/doctors?search=ahmed&specialization=Cardiology&page=1&limit=10
```

Patient filtering:

```text
GET /api/patients?search=rahim&condition=Diabetes&from=2026-01-01&to=2026-08-01&page=1&limit=10
```

The server builds the MongoDB query from the supplied parameters.

This prevents the frontend from downloading the entire collection and filtering it in memory.

## Performance Optimization

The project includes several performance-focused techniques.

### Server-side Pagination

Only the requested page of doctors or patients is returned.

```text
?page=1&limit=10
```

This reduces:

* Network payload
* Browser memory usage
* Rendering workload
* Database result size

### MongoDB Indexing

Indexes are used for frequently queried fields such as:

* Doctor names
* Doctor specialization
* Patient doctor relationship
* Patient conditions
* Creation dates
* Text-search fields

### Parallel Queries

Independent database operations use `Promise.all()` where appropriate.

For example, dashboard statistics can calculate:

```text
Total doctors
Total patients
Total users
Patients per doctor
Monthly patient trend
Condition breakdown
```

in parallel.

### MongoDB Aggregation

Dashboard statistics are calculated directly inside MongoDB using aggregation pipelines such as:

```text
$match
$group
$sort
$lookup
$unwind
$project
```

This avoids loading unnecessary records into Node.js.

### Lean Queries

Read-only queries use Mongoose `.lean()` where appropriate to reduce Mongoose document overhead.

### Request Race Protection

The frontend patient listing uses request tracking to prevent stale API responses from replacing newer search/filter results.

## Security

The application implements several security practices:

* JWT authentication
* Protected routes
* Role-based authorization
* Password hashing with bcrypt
* Passwords are never returned through user responses
* Protected API endpoints
* Authentication middleware
* Input validation
* Mongoose validation
* Controlled user roles
* Environment variables for secrets
* CORS configuration
* Secure file upload handling
* Cloudinary-based image storage
* Destructive-action confirmation
* Server-side authorization instead of relying only on frontend UI restrictions

### Important

Hiding an Add/Edit/Delete button in the frontend is only a UX improvement.

The backend must also verify the user's role before allowing operations such as:

```text
POST   /doctors
PUT    /doctors/:id
DELETE /doctors/:id
POST   /doctors/:id/patients
PUT    /patients/:id
DELETE /patients/:id
```

This prevents users from bypassing frontend restrictions by manually calling the API.

## Technical Decisions

### 1. Server-side Pagination and MongoDB Indexing

The application uses server-side search, filtering, and pagination instead of fetching all records into React.

The frontend sends parameters such as:

```text
search
specialization
condition
from
to
page
limit
```

The backend converts these parameters into MongoDB queries.

This approach provides better scalability because the client receives only the records required for the current page.

MongoDB indexes further improve query performance for frequently searched and filtered fields.

The trade-off is additional backend query-building logic, but this architecture performs significantly better as the number of doctors and patients grows.

### 2. Separate Next.js Frontend and Express Backend

The frontend and backend are maintained as separate applications.

```text
frontend/
backend/
```

The frontend is responsible for:

* UI
* Navigation
* Authentication state
* API requests
* Responsive presentation

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Validation
* Database operations
* Aggregation
* REST API endpoints

This separation makes the backend reusable for future clients such as:

* Mobile applications
* Internal administration tools
* Third-party integrations

It also allows the frontend and backend to be deployed independently.

## Error Handling

The backend uses centralized error handling through Express middleware.

Controllers forward errors using:

```javascript
next(error);
```

This keeps controllers cleaner and provides a consistent API error response.

The frontend also displays user-friendly error messages for failed operations such as:

* Login failures
* Failed doctor creation
* Failed patient creation
* Failed updates
* Failed deletion
* Dashboard loading errors

## User Experience

The application focuses on practical administrative workflows.

Important UX features include:

* Clear navigation
* Active navigation states
* Loading skeletons
* Empty states
* Search feedback
* Filter clearing
* Confirmation dialogs
* Responsive forms
* Responsive tables
* Disabled states during API requests
* Success/error feedback
* Consistent card design
* Consistent typography
* Mobile navigation

## Project Structure

```text
doctor-tracker/
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Patient.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedAdmin.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── doctors/
│   │   │   └── [id]/
│   │   ├── patients/
│   │   ├── users/
│   │   ├── profile/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── ProtectedLayout.js
│   │   ├── Modal.js
│   │   ├── Pagination.js
│   │   └── Sidebar.js
│   │
│   ├── context/
│   │   └── AuthContext.js
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   ├── .env.local.example
│   └── package.json
│
└── README.md
```

## Setup Guide

### Prerequisites

* Node.js 18+
* npm
* MongoDB
* MongoDB Atlas or local MongoDB installation
* Cloudinary account if avatar uploads are enabled

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd doctor-tracker
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows, create `.env` manually if the `cp` command is unavailable.

Configure the environment variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/doctor-tracker
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

If Cloudinary avatar uploads are enabled:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

## 3. Seed Admin Account

If the project includes the admin seed script:

```bash
node utils/seedAdmin.js
```

Use the credentials configured by the seed script.

For a deployed application, do not keep simple demo credentials such as `admin/admin`. Replace them before sharing the application publicly.

## 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start Next.js:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

Open the application in your browser:

```text
http://localhost:3000
```

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Never commit actual secrets or production credentials to GitHub.

## Deployment

### Backend

The Express backend can be deployed to:

* Render
* Railway
* VPS
* Other Node.js hosting platforms

Configure all required environment variables in the hosting provider.

Example:

```env
CLIENT_URL=https://doctor-tracker-delta.vercel.app
```

### Frontend

The Next.js frontend can be deployed to Vercel.

Configure:

```env
NEXT_PUBLIC_API_URL=https://doctor-tracker.onrender.com/api
```

The deployed frontend communicates with the standalone Express backend through REST APIs.

## Live Demo

| Service     | URL                                      |
| ----------- | ---------------------------------------- |
| Frontend    | https://doctor-tracker-delta.vercel.app/ |
| Backend API | https://doctor-tracker.onrender.com      |

### Demo Credentials

```text
Username: admin
Password: admin
```

> For security, demo credentials should only be used for demonstration purposes and should be changed or disabled for production deployments.

## Visual Evidence

Add screenshots demonstrating both desktop and mobile responsiveness.

| Page          | Desktop        | Mobile         |
| ------------- | -------------- | -------------- |
| Login         | Add screenshot | Add screenshot |
| Dashboard     | Add screenshot | Add screenshot |
| Doctors       | Add screenshot | Add screenshot |
| Doctor Detail | Add screenshot | Add screenshot |
| Patients      | Add screenshot | Add screenshot |
| Users         | Add screenshot | Add screenshot |
| Profile       | Add screenshot | Add screenshot |

Recommended screenshot dimensions:

```text
Desktop: 1440 × 900
Mobile: 390 × 844
```

Screenshots should demonstrate:

* Responsive navigation
* Dashboard analytics
* Doctor management
* Patient management
* User management
* Mobile table behavior
* Forms and modal dialogs

## Future Improvements

Possible future enhancements include:

* Refresh-token authentication
* Forgot/reset password
* Email verification
* Account activation/deactivation
* Advanced audit logs
* Appointment management
* Doctor availability schedules
* Patient medical history
* Prescription management
* Appointment reminders
* Export reports to CSV/PDF
* Advanced dashboard date-range filtering
* More detailed analytics
* Notification center
* Activity history
* Rate limiting
* Automated API testing
* End-to-end testing
* Docker support
* CI/CD pipeline

## Scalability Considerations

The application is structured so additional functionality can be introduced without significantly changing the existing architecture.

Potential scaling improvements include:

* Redis caching for frequently accessed dashboard statistics
* Database replica sets
* Background jobs for email notifications
* Queue-based processing
* API rate limiting
* Advanced MongoDB compound indexes
* Aggregation optimization
* CDN-based image delivery
* Separate analytics services for very large datasets

## Best Practices Demonstrated

The project demonstrates:

* RESTful API architecture
* JWT authentication
* Role-based authorization
* Password hashing
* MongoDB indexing
* Server-side pagination
* Server-side filtering
* MongoDB aggregation
* Parallel database queries
* Mongoose validation
* Centralized error handling
* Reusable React components
* Responsive UI
* Loading states
* Empty states
* API error handling
* Destructive-action confirmation
* Environment-based configuration
* Separate frontend/backend deployment
* Cloudinary image storage

## Submission

### Project

**Doctor Tracker**

### Live Application

https://doctor-tracker-delta.vercel.app/

### GitHub Repository

```text
<your-github-repository-url>
```

### Backend

```text
https://doctor-tracker.onrender.com
```

### Demo Account

```text
Username: admin
Password: admin
```


