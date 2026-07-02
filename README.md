# QuizPulse - Online Quiz Application (MERN Stack)

QuizPulse is a premium, modern, responsive full-stack Online Quiz Application featuring role-based access control (RBAC), interactive timed quiz attempts, auto-saving/auto-submission, performance analytics with Recharts, dynamic PDF certificate generation, and light/dark theme modes.

---

## 📂 Project Structure

```
online-quiz-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB database configuration
│   ├── controllers/
│   │   ├── authController.js  # User auth, profile, and forgot/reset password
│   │   ├── quizController.js  # Quiz CRUD and publishing states
│   │   ├── questionController.js # Question management and mark synchronization
│   │   ├── resultController.js # Attempt evaluation and leaderboard aggregations
│   │   └── statsController.js # Dashboard statistics aggregation
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protection and RBAC guards
│   ├── models/
│   │   ├── User.js            # User Schema
│   │   ├── Quiz.js            # Quiz Schema
│   │   ├── Question.js        # Question Schema
│   │   └── Result.js          # Attempt Result Schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoint routes
│   │   ├── quizRoutes.js      # Quiz management routes
│   │   ├── questionRoutes.js  # Question management routes
│   │   ├── resultRoutes.js    # Attempt evaluation routes
│   │   └── statsRoutes.js    # Stats and analytics routes
│   ├── uploads/               # Profile picture uploads storage
│   ├── .env                   # Configuration file (environment variables)
│   ├── server.js              # Entry point of the Express API server
│   ├── verify.js              # Local verification integration script
│   └── package.json           # Backend dependency configurations
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Navbar.jsx     # Navigation bar with dark mode toggle
    │   │   ├── Sidebar.jsx    # Responsive menu drawer
    │   │   └── ProtectedRoute.jsx # Wrapper for route guard & RBAC checks
    │   ├── context/
    │   │   ├── AuthContext.jsx # Current user session and token contexts
    │   │   └── ThemeContext.jsx # Theme switcher (class-based dark mode)
    │   ├── pages/
    │   │   ├── Home.jsx       # Landing page with product highlights
    │   │   ├── Login.jsx      # Authentication login
    │   │   ├── Register.jsx   # Role selection signup
    │   │   ├── ForgotPassword.jsx # Email reset request screen
    │   │   ├── ResetPassword.jsx  # New credential updater
    │   │   ├── AdminDashboard.jsx # Analytics and platform monitoring
    │   │   ├── StudentDashboard.jsx # History and category charts
    │   │   ├── QuizList.jsx   # Management list (Admin) / Available quizzes (Student)
    │   │   ├── QuizCreateEdit.jsx # Quiz settings and Question Builder
    │   │   ├── QuizAttempt.jsx # Timed interactive attempts drawer
    │   │   ├── QuizResult.jsx # Circular score gauges, leaderboard, and certificate generator
    │   │   └── Profile.jsx    # Personal settings and profile image upload
    │   ├── services/
    │   │   └── api.js         # Axios HTTP client with interceptor tokens
    │   ├── App.jsx            # Routing and global layout shells
    │   ├── index.css          # Tailwind configurations and glassmorphic stylings
    │   └── main.jsx           # Client bundle entry point
    ├── index.html             # Google Fonts imports and SEO meta tags
    ├── postcss.config.js      # PostCSS configuration
    ├── tailwind.config.js     # Tailwind CSS configuration
    ├── vite.config.js         # Vite development server and API proxy setup
    └── package.json           # Frontend dependencies
```

---

## 🛠️ Database Design (MongoDB Models)

### User Model (`User.js`)
* `name` (String, required): Student or Admin's full name.
* `email` (String, unique, required): Validation-matched unique email address.
* `password` (String, required, select: false): Hashed user password.
* `role` (String, enum: ['student', 'admin']): User privilege level.
* `profilePicture` (String): Server URL path to the uploaded image.
* `resetPasswordToken` (String): Hashed token used to confirm password resets.
* `resetPasswordExpire` (Date): Token lifespan timestamp (default 10 minutes).

### Quiz Model (`Quiz.js`)
* `title` (String, required): Name of the quiz.
* `description` (String, required): Brief details.
* `category` (String, required): e.g., Programming, Science.
* `difficulty` (String, enum: ['easy', 'medium', 'hard']).
* `timeLimit` (Number, required): Time allocated in minutes.
* `totalMarks` (Number): Dynamic summary of all question marks in this quiz.
* `passingPercentage` (Number): Percentage needed to qualify for a certificate.
* `isPublished` (Boolean): Draft vs. Live visibility.
* `randomizeQuestions` (Boolean): Shuffles questions for students when true.
* `negativeMarking` (Boolean): Enables negative scoring on wrong attempts.
* `negativeMarkingValue` (Number): Marks deducted per wrong response.
* `createdBy` (ObjectId, ref: 'User'): Admin user reference.

### Question Model (`Question.js`)
* `quizId` (ObjectId, ref: 'Quiz', required): Parent quiz reference.
* `questionText` (String, required): Question description.
* `options` (Array of 4 Strings): The multiple choices available.
* `correctAnswers` (Array of Numbers): Option indices indicating correct answers (0-3).
* `questionType` (String, enum: ['single', 'multiple']): MCQ type.
* `marks` (Number): Points awarded for answering this question.

### Result Model (`Result.js`)
* `userId` (ObjectId, ref: 'User', required): Student reference.
* `quizId` (ObjectId, ref: 'Quiz', required): Attempted quiz reference.
* `score` (Number): Computed final score (adjusted for negative marking).
* `percentage` (Number): Score percentage.
* `passed` (Boolean): True if `percentage` >= quiz passing threshold.
* `answers` (Array of objects): Detailed log of selections:
  - `questionId` (ObjectId, ref: 'Question')
  - `selectedOptions` (Array of Numbers)
  - `isCorrect` (Boolean)
* `timeTaken` (Number): Elapsed time in seconds.

---

## 📡 REST API Endpoints

### Authentication `/api/auth`
* `POST /register` - Register a student/admin.
* `POST /login` - Sign in and receive a JWT.
* `GET /profile` - Retrieve profile info.
* `PUT /profile` - Update profile data & upload photo (multipart/form-data).
* `POST /forgot-password` - Request a password reset token.
* `POST /reset-password/:resetToken` - Reset password credentials.

### Quiz Management `/api/quizzes`
* `GET /` - Fetch quizzes (students see only published ones).
* `GET /:id` - Fetch details of a single quiz (students do not receive correct answers).
* `POST /` - Create a quiz (Admin only).
* `PUT /:id` - Update quiz details (Admin only).
* `DELETE /:id` - Delete a quiz, its questions, and attempt logs (Admin only).

### Question Builder `/api/questions`
* `POST /` - Add question to a quiz (Admin only).
* `POST /generate` - Auto-generate quiz questions using Gemini AI (Admin only).
* `GET /quiz/:quizId` - Get questions with answers for a quiz (Admin only).
* `PUT /:id` - Edit a question (Admin only).
* `DELETE /:id` - Delete a question and update quiz total marks (Admin only).

### Attempts & Grading `/api/results`
* `POST /submit` - Grade and record quiz attempt responses.
* `GET /user` - Retrieve student's attempt history.
* `GET /:id` - Fetch attempt details (review incorrect/correct answers).
* `GET /leaderboard/:quizId` - Aggregate top 10 unique scores for a quiz.

### Analytics `/api/stats`
* `GET /admin` - Aggregates total users, quizzes, attempts, and monthly charts data (Admin only).
* `GET /student` - Aggregates user attempts, score trends, and category strengths (Student only).

---

## 🚀 Local Setup Guide

### Prerequisites
* [Node.js](https://nodejs.org) (v18+)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

### Backend Setup
1. Open a terminal in `backend/` directory.
2. Initialize environment config:
   Create a `.env` file containing:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/online-quiz-app
   JWT_SECRET=supersecretjwtkeyforquizapp12345
   JWT_EXPIRE=30d
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
3. Install packages and start:
   ```bash
   npm install
   npm run dev
   ```
4. Verify backend modules by running:
   ```bash
   node verify.js
   ```

### Frontend Setup
1. Open another terminal in `frontend/` directory.
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

### Phase 1: Create a MongoDB Atlas Database
1. Sign in to your [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas).
2. Click **Create** to deploy a new shared cluster (choose the free tier).
3. Under **Network Access**, add IP address `0.0.0.0/0` (allows API servers to connect from any cloud region).
4. Under **Database Access**, create a user (e.g. `quiz_admin`) and write down their password.
5. In your cluster dashboard, click **Connect** -> **Drivers**, and copy the connection string:
   ```
   mongodb+srv://quiz_admin:<password>@cluster0.abcde.mongodb.net/quizpulse?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with the database user's password).*

### Phase 2: Deploy Backend to Render
1. Push your code repository to GitHub (ensure `.env` and `node_modules` are in your `.gitignore`).
2. Log into [Render](https://render.com) and click **New** -> **Web Service**.
3. Link your GitHub repository.
4. Set the following build configurations:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Go to **Environment Variables** in Render and configure:
   * `MONGO_URI` = *(Your MongoDB Atlas connection URI)*
   * `JWT_SECRET` = *(A long, secure random key string)*
   * `JWT_EXPIRE` = `30d`
   * `NODE_ENV` = `production`
6. Click **Deploy Web Service** and copy the resulting API URL (e.g. `https://quizpulse-api.onrender.com`).

### Phase 3: Deploy Frontend to Vercel
1. Log into [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. In the project setup, configure:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Update API Routing Proxy configuration:
   Because React attempts to call API route `/api/auth/...`, we must add a rewrite rules configuration in the frontend directory. Create a `vercel.json` file in your `frontend/` folder:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://quizpulse-api.onrender.com/api/$1"
       },
       {
         "source": "/uploads/(.*)",
         "destination": "https://quizpulse-api.onrender.com/uploads/$1"
       }
     ]
   }
   ```
5. Click **Deploy**. Your React app is now live with automated proxy routing to your Render backend!
#   o n l i n e - q u i z e  
 