# LiveCodex

LiveCodex is a real-time, collaborative code learning platform where users can write, execute, and share code seamlessly. It features an interactive code editor, real-time synchronization, and an integrated chat system to facilitate pair programming and team discussions.

## 🚀 Live Demo

- **Frontend Application:** [https://livecodex-theta.vercel.app](https://livecodex-theta.vercel.app)
- **Backend API:** [https://livecodex-13zk.onrender.com](https://livecodex-13zk.onrender.com)

> **Note:** The backend is hosted on a free tier on Render. If it has been idle, it might take a few moments (up to 50 seconds) to spin up for the first request.

## ✨ Features

- **Real-Time Collaboration:** Code together with peers in real-time, leveraging WebSockets (`socket.io`).
- **Interactive Code Editor:** Built with Monaco Editor (`@monaco-editor/react`) for a VS Code-like coding experience.
- **Integrated Chat Panel:** Communicate with collaborators directly within the workspace.
- **Resizable Layout:** Customizable UI layout with resizable panels (`react-resizable-panels`).
- **Beautiful & Modern UI:** Designed with Tailwind CSS, Lucide React icons, and animated with Framer Motion.

## 🛠️ Tech Stack

### Frontend
- React 19 (Vite)
- Tailwind CSS
- Socket.io Client
- Monaco Editor
- Framer Motion

### Backend
- Node.js & Express
- Socket.io (WebSocket for real-time collaboration)
- MongoDB / Mongoose (for history and chat storage)

## 💻 Running Locally

To run the application locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd "Code Editor"
   ```

2. **Setup Server (Backend):**
   ```bash
   cd server
   npm install
   # Create a .env file and add your MongoDB connection string and API keys
   npm start
   ```

3. **Setup Client (Frontend):**
   ```bash
   cd ../client
   npm install
   # Create a .env file locally pointing to the local backend if necessary (e.g., VITE_API_URL=http://localhost:3000)
   npm run dev
   ```

## 📜 License
This project is licensed under the MIT License.
