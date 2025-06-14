# Express API for Vercel

A simple Express.js API with MongoDB integration that can be deployed to Vercel. Built using MVC architecture.

## Project Structure

```
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
└── index.js        # Entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with:
```
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

3. Run locally:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/login`: Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `GET /api/auth/me`: Get current user profile (Protected route)

### Users
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get single user
- `POST /api/users`: Create new user
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user

## Authentication

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string from the "Connect" button
4. Add your connection string to the `.env` file as `MONGODB_URI`

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

3. Add environment variables to Vercel:
   - Go to your project settings in Vercel
   - Add `MONGODB_URI` and `JWT_SECRET` to the environment variables
