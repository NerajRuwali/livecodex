LiveCodeX — Real-Time Collaborative Code Editor

LiveCodeX is a full-stack real-time collaborative coding platform that allows multiple users to write, edit, and execute code together in a shared environment. It is designed to replicate a Google Docs–like experience for coding, enhanced with AI-powered assistance for debugging and suggestions.

Live Demo

Frontend: https://livecodex-theta.vercel.app

Backend: https://livecodex-13zk.onrender.com

Overview

The platform enables users to join a shared room using a unique ID and collaborate in real time. Code changes are synchronized instantly across all connected users using WebSockets, ensuring a smooth and interactive coding experience.

It integrates code execution capabilities and AI assistance, allowing users to run code securely and receive intelligent suggestions during development.

Features
Real-time collaborative code editor
Multi-user synchronization using WebSockets (Socket.io)
Live cursor tracking for better collaboration visibility
Room-based chat system
Code execution via Judge0 API
AI-powered debugging and suggestions using Gemini API
Session timer for coding practice
Playback system to replay coding sessions
Persistent storage using MongoDB
Tech Stack

Frontend

React.js
Socket.io-client
Tailwind CSS

Backend

Node.js
Express.js
Socket.io

Database

MongoDB Atlas

APIs and Services

Judge0 API (code execution)
Gemini API (AI assistance)

Deployment

Vercel (Frontend)
Render (Backend)
Architecture
Frontend handles UI, user interactions, and WebSocket communication
Backend manages real-time synchronization, API requests, and business logic
WebSockets enable instant code updates across all connected users
Judge0 API handles secure code compilation and execution
MongoDB stores session data and enables playback functionality
Gemini API provides AI-driven code assistance and debugging
Installation and Setup
1. Clone the Repository
git clone https://github.com/NerajRuwali/livecodex.git
cd livecodex
2. Backend Setup
cd server
npm install

Create a .env file in the server directory:

PORT=5001
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Run the backend:

npm run dev
3. Frontend Setup
cd client
npm install
npm run dev
API Overview
/api/code – Code execution and processing
/api/session – Session management and playback
/api/chat – Chat functionality
How It Works
Users join a room using a unique Room ID
Code changes are broadcast in real time using WebSockets
Each keystroke is synchronized across all connected users
Judge0 API compiles and executes code securely
MongoDB stores session history for playback
Gemini API assists with debugging and code suggestions
Future Improvements
Voice communication between users
Video-based collaboration
Code versioning and history tracking
Enhanced analytics and session insights
Author

Neeraj Ruwali
