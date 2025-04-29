# Oak E-commerce Platform

A full-featured e-commerce platform built with modern web technologies.

## Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- Redux Toolkit

### Backend
- Node.js
- Express
- TypeScript
- Sequelize ORM
- PostgreSQL

## Project Structure
```
web-app/
├── client/           # Next.js frontend
├── server/           # Node.js backend
└── shared/           # Shared types and utilities
```

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm >= 8

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd web-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Start development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Development

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:client` - Start only frontend
- `npm run dev:server` - Start only backend
- `npm run build` - Build all packages
- `npm run start` - Start production server

## Deployment

### Local Server
1. Build the application: `npm run build`
2. Start the server: `npm run start`

### Firebase Deployment
(Instructions for Firebase deployment will be added when ready to deploy) 