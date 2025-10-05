# 🚀 Torket

A small **real-time multiplayer game** built with **Phaser 3** and **Colyseus**, where players can move around, aim, and fire projectiles in a **physics-based, destructible environment** ⚙️💥

---

## 🕹️ Overview

Each player controls a little character equipped with a **rocket launcher**.  
The world is **interactive and destructible**, and projectiles follow a **realistic physics trajectory** (gravity, impulse, etc).  
All players’ positions and actions are **synchronized in real time** through a Colyseus server.

---

## 🧰 Tech Stack

| Area | Technology |
|-------|-------------|
| **Game Engine** | [Phaser 3](https://phaser.io) |
| **Physics Engine** | [Matter.js](https://brm.io/matter-js/) |
| **Multiplayer Networking** | [Colyseus](https://www.colyseus.io/) |
| **Server** | Node.js + TypeScript |
| **Client** | React + Vite + TypeScript |
| **Real-Time Communication** | WebSockets (via Colyseus) |

---

## ⚙️ Installation

Clone the repository and install dependencies for both client and server:

```bash
git clone https://github.com/your-username/multiplayer-rocket-game.git
cd torket-game

# Install dependencies for both parts
cd client && npm install
cd ../server && npm install
cd ..
```

## 🏃‍♂️ Run the Project

### ✅ Recommended: single command with `concurrently`

Run both **client** and **server** simultaneously with one command:

```bash
npm run dev
```

This command executes the following in parallel:

```bash
cd client && npm run dev
```

```bash
cd server && npm start
```

🟢 Both processes start together, and their logs appear in the same terminal.

### 🧩 Alternative: run separately

If you prefer to run them manually, open two terminals.

Terminal 1 — Server

```bash
cd server
npm start
```

Terminal 2 — Client

```bash
cd client
npm run dev
```

Then open your browser at:

```arduino
http://localhost:5173/
```

## 🔧 Configuration

- The **Colyseus server** runs by default at:  

```arduino
http://localhost:2567/
```

You can modify these settings in:
- `client/src/scenes/GameScene.ts` → `new Client("ws://localhost:2567")`
- `server/src/index.ts` → server port configuration

## 🎮 Controls

| Action | Control |
|--------|----------|
| Move | Arrow keys |
| Aim | Mouse |
| Charge rocket | Hold left click |
| Fire | Release left click |

