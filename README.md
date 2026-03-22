# 🚀 LiveCodeX — Real-Time Collaborative Code Editor

LiveCodeX is a full-stack real-time collaborative coding platform where multiple users can write, edit, and execute code together with AI assistance — similar to Google Docs but for coding.

---

## 🌐 Live Demo

🔗 Frontend: https://livecodex-theta.vercel.app
🔗 Backend: https://livecodex-13zk.onrender.com

---

## ✨ Features

* 👨‍💻 Real-time collaborative code editor
* ⚡ Multi-user live sync using WebSockets (Socket.io)
* 🖱️ Live cursor tracking
* 💬 Room-based chat system
* ▶️ Code execution using Judge0 API
* 🤖 AI assistant (Gemini) for debugging and suggestions
* ⏱️ Coding session timer
* 🎥 Playback system to replay coding sessions
* 💾 Persistent storage using MongoDB

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Socket.io-client
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Socket.io

### Database

* MongoDB Atlas

### APIs & Services

* Judge0 API (Code Execution)
* Gemini API (AI Assistant)

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/NerajRuwali/livecodex.git
cd livecodex
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🧠 How It Works

* Users join a room via a unique Room ID
* WebSockets (Socket.io) sync code changes in real-time
* Each keystroke is broadcasted to all connected users
* Judge0 API compiles and runs code securely
* MongoDB stores session history and enables playback
* Gemini AI assists with code explanation and debugging

---

## 🚀 Future Improvements

* 🎤 Voice chat integration
* 🧠 AI interview mode
* 🌙 Dark/Light mode toggle
* 📂 Code versioning system

---

## 👨‍💻 Author

**Neeraj Ruwali**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
