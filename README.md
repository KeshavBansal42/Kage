# 🐈 Kage - The Virtual Desktop Pet

**Kage** (Japanese for "Shadow") is a lightweight, fully physics-based desktop pet that roams freely across your monitors. Built entirely on web technologies, Kage lives as a transparent, borderless widget on your screen, completely hidden from your taskbar so it feels like a native OS entity.

Whether he's chasing a ball of yarn, sleeping on your taskbar, or bouncing off the edges of your monitors, Kage is the perfect companion for your desktop.

## ✨ Features

- **Multi-Monitor Physics:** Kage calculates the actual layout of all your monitors. If you drag him off a high screen, he will physically fall until he hits the bottom of the lowest screen!
- **Interactive Yarn Ball:** Comes with a physics-based toy ball. Toss the ball across your desktop, and Kage will sprint and jump to catch it.
- **Throwing & Dragging:** Click and drag Kage or the ball anywhere on your screen. Throw them to watch them bounce off the walls with simulated gravity and friction.
- **State-Based Animation Engine:** Custom 1D sprite rendering engine natively parses retro pixel-art animations (Idle, Run, Jump, Sleep) based on his physics velocity.
- **Completely Stealthy:** Explicitly configured to hide from the Windows Taskbar, macOS Dock (and Cmd-Tab), and Linux Dash (and Alt-Tab). He is just part of your desktop.
- **Persistent Memory:** Kage remembers exactly where he was when you closed the app and will spawn right back there on the next launch.

## 🛠 Tech Stack

Kage is built with a minimalist, high-performance web stack:
- **[Electron](https://www.electronjs.org/)** - For cross-platform transparent window management and IPC communication.
- **Vanilla JavaScript** - Zero bloated frameworks. The physics and rendering engines are written entirely from scratch in pure JS for maximum performance.
- **HTML5 Canvas / CSS3** - Utilizes hardware-accelerated CSS `transform` and `background-position` for crisp, pixel-perfect 16-bit rendering.

## 🚀 Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/KeshavBansal42/Kage.git
   cd Kage
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the pet!
   ```bash
   npm start
   ```
   *(Note for Linux Wayland users: If you experience issues, you can try `npm run start:wayland`)*

## 🎮 How to Play

- **Drag & Drop:** Click and hold the cat or the ball to drag them around. Let go while moving your mouse to "throw" them.
- **Wake Up:** If Kage has fallen asleep, right-click him to open the context menu and select **"Wake Up Cat"**.
- **Context Menu:** Right-click anywhere on the cat to open the tray menu, where you can toggle the ball, reset their positions, or quit the app.
- **Play Catch:** Throw the ball near Kage when he is bored, and he will automatically track it, jump after it, and hit it back!

## 📦 Building for Production

If you want to package Kage into a standalone executable (`.exe`, `.app`, or `.AppImage`), you can use the built-in electron-builder script:

```bash
npm run build
```
This will compile the app and place the distributable binaries in the `dist/` folder.

---

*Made with ❤️ and too much physics and math.*

*PS : I'm a noob , so don't judge my code. Also a tribute to Kage my horse from Ghost of Tsushima and also from RDR2 :3*