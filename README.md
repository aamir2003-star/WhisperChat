# 💬 WhisperChat

🔗 **Live Demo:** [https://whisper-chat-sand.vercel.app/](https://whisper-chat-sand.vercel.app/)

WhisperChat is a premium, real-time messaging application designed with a sleek, modern aesthetic and responsive layouts. Built on the robust **MERN Stack** (MongoDB, Express, React, Node.js) and powered by **Socket.io**, it mirrors the signature real-time behaviors of WhatsApp—complete with user presence tracking, instant typing indicators, dynamic relative timestamps, customizable message bubble themes, and live message status ticks (Sent, Delivered, Seen).


---

## ✨ Features

### 🌟 1. WhatsApp-Style Real-Time Status Ticks
*   **Sent (`✓`)**: Rendered as a single high-contrast semi-transparent check. Alice sends a message; if Bob is offline, she sees a single check.
*   **Delivered (`✓✓` Grey)**: Displays instantly as double checks when the recipient client connects and background socket events deliver the payload.
*   **Seen/Read (`✓✓` Colored)**: Transforms in real time when the recipient actively clicks or focuses the conversation window.
*   **High-Contrast Glow**: Tick checks utilize drop-shadow CSS filters ensuring complete visibility across both light and dark backgrounds.

### 🎨 2. Interactive Chat Bubble Themes
*   Features a sleek color-dot theme selector in the active conversation header.
*   Instantly switch themes in real time:
    *   🔵 **Sapphire Blue** (Default — highly-legible royal sapphire; seen ticks glow in Vibrant Cyan).
    *   🔴 **Sunset Rose** (Vibrant crimson; seen ticks glow in Brilliant Gold).
    *   🟢 **Emerald Green** (Classic high-luminance green; seen ticks glow in Sky Blue).
*   Preferences are persisted in `localStorage` to keep your chosen styling intact across user sessions.

### 🟢 3. Live Presence & Relative "Last Seen" Statuses
*   The header dynamically lists partners as `"online"` (in high-luminance emerald green) when they have active connection instances.
*   When a partner disconnects, the status instantly transitions into an intelligent relative offline timestamp (e.g. `"last seen today at 10:15 AM"`, `"last seen yesterday at 9:30 PM"`, or by weekday/date based on elapsed time).

### 🕒 4. Dynamic Sidebar Timestamps & Unread Badges
*   Conversations listed in the sidebar automatically track and format the exact relative date/time of the newest message (e.g. `12:24 PM`, `Yesterday`, `Monday`, or `5/22/2026`).
*   Sidebar cards feature a clean, right-aligned vertical layout separating high-contrast time labels from vibrant red unread counts.

### 👤 5. Smart Multi-Color Avatar Badges
*   Users without custom profile photos are dynamically assigned unique initial-based badges.
*   Badges are programmatically colored across 10 premium Tailwind palettes based on a hash of the user's MongoDB ID.

### 🛡️ 6. Seamless Debounced User Search
*   Search drawer automatically triggers queries using a debounced API handler once the user stops typing, minimizing backend loads.
*   Displays explicit "User not found" indicators when query sets yield empty results.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), CSS Custom Variable Design System, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs.
*   **Real-time Layer**: Socket.io (Multi-tab tracking support).
*   **Database**: MongoDB, Mongoose ODM.

---

## 📁 Project Structure

```text
ChatApplication/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express request handlers (User, Chat, Message)
│   ├── middleware/         # JWT-based Route authentication shield
│   ├── models/             # Mongoose schemas (User, Chat, Message)
│   ├── routes/             # API routing endpoints
│   ├── server.js           # Server bootloader & Socket.io event lifecycle
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/         # Dynamic asset files
    │   ├── components/     # UI Components (MyChats, SingleChat, Auth)
    │   ├── context/        # React Context API global state (ChatProvider)
    │   ├── hooks/          # Custom hooks
    │   ├── utils/          # Avatar hashing and helper functions
    │   ├── App.jsx         # App routing container
    │   └── main.jsx        # Bootloader
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   **Node.js** (v16+)
*   **npm** or **yarn**
*   **MongoDB** (running locally on standard port `27017` or a MongoDB Atlas URI)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/WhisperChat.git
cd WhisperChat
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/whisperchat
JWT_SECRET=your_super_secret_jwt_key
```

---

### Step 3: Spin Up the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot up at `http://localhost:3000`.

---

### Step 4: Spin Up the React Frontend
Open a new terminal window in the root directory:
```bash
cd frontend
npm install
npm run dev
```
Vite will serve the frontend at `http://localhost:5173`. Open the URL in your browser.

---

## 🧪 How to Verify Live Status Ticks & Presence

To experience the real-time WebSocket capabilities, open two distinct browser instances (e.g. Google Chrome and Chrome Incognito):

1.  **Register Two Users**: Register "Alice" and "Bob" respectively.
2.  **Create a Conversation**: Search for "Bob" in Alice's screen and select him to open the chat window. Bob will show as "online" in green in Alice's header.
3.  **Test "Offline / Last Seen"**: Close Bob's tab. Alice's header will instantly transition to `"last seen today at [Current Time]"`.
4.  **Test Sent Tick (Single Check)**: Alice sends a message while Bob is offline. The message bubble displays a single check mark.
5.  **Test Delivered Tick (Double Checks)**: Log Bob back in but *stay on the main chats listing sidebar* (do not select Alice's chat). Alice's message check instantly updates to double ticks!
6.  **Test Seen Tick (Double Blue/Colored Checks)**: Bob clicks on Alice's conversation card. All of Alice's sent checks instantly change to glowing colored seen ticks (Vibrant Cyan, Brilliant Gold, or Sky Blue depending on Alice's chosen bubble theme)!
