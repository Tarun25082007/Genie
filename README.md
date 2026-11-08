# 🧞 GENIE — The 2D Literal Monkey's Paw Sandbox

> *"Be careful what you wish for... the cosmos obeys your syntax, not your intent."*

A hyper-literal 2D physics sandbox game built in React 18, Matter.js, HTML5 Canvas, and the Web Audio API. Powered by a demonic AI director and a cellular automata falling-sand engine.

---

## 🎮 Features

- **Dual-Layer Real-Time Engine:**
  - **960x540 Matter.js Physics Layer:** Rigid-body dynamics, falling Tetris blocks, heavy anvils, rolling spike balls, and custom procedural props.
  - **320x180 Falling-Sand Cellular Automata Layer (57,600 cells):** Simulates granular `BLOOD`, `FIRE`, `ACID`, `ASH`, `GOLD`, and `SPARK`. Synchronized with dynamic physics bodies using an Oriented Bounding Box (OBB) solid mask.
- **6-Part Breakable Ragdoll:**
  - 5 breakable joints (`neck`, `leftShoulder`, `rightShoulder`, `leftHip`, `rightHip`) that snap under velocity stress ($v > 26$) and distance stretch ($d > \text{maxStretch}$).
  - Upright posture stabilization torque while alive.
  - Continuous arterial blood emitters spraying from severed stumps.
  - Acid corrosion damage tracking, radial 8-piece gib explosions, and procedural pixel hats (`CROWN`, `WIZARD`, `HARDHAT`).
- **3 Thematic Realms:**
  - **The Djinn of the Lamp (`djinn_classic`):** Ancient Mesopotamian smoke entity (3 wishes).
  - **Shenron the Eternal Dragon (`shenron_dragon`):** Celestial wish dragon (2 wishes).
  - **Corporate Contract Demon (`corporate_demon`):** Hellbound contract lawyer (3 wishes).
- **8 Atomic Choreography Verbs:**
  - `SPAWN_OBJECT`, `DESTROY_JOINT`, `APPLY_FORCE`, `MUTATE_PART`, `EMIT_PARTICLES`, `ATTACH_CONSTRAINT`, `WORLD_MODIFIER`, `CAMERA_FX`.
- **Persistent Cosmic Modifiers:**
  - `BLACK_HOLE`: Gravitational singularity vortex and spaghettification.
  - `DELETE_FLOOR`: Drops the floor into a boiling fire & acid pit.
  - `CEILING_SPIKES`: Deploys lethal iron spikes along $y=54$.
- **100% Procedural Web Audio API Synthesizer:**
  - Zero external `.mp3` or `.wav` files. Real-time synthesized voice blips (synced with typewriter dialogue), gore bone crunches, blood sprays, low-pass explosion drops, laser vibrato, demon laughs, and victory arpeggios.
- **Airtight Loophole Rule System:**
  - **Loophole Score 0..79:** The wish has fatal ambiguities $\to$ `survived: false`, triggering a dark-comedy 2D physics execution and resetting the run to Wish 1.
  - **Loophole Score 80..100:** The wish is legally and physically airtight $\to$ `survived: true`, advancing to Wish $N + 1$ (or triggering `canvas-confetti` + Victory Decree).
- **Multi-Provider LLM Director:**
  - Supports Groq (`llama-3.3-70b-versatile`), Google Gemini 2.5 Flash, Local Ollama, and an instant offline 12-scenario mock director.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` to supply optional LLM provider keys (the game operates 100% offline out-of-the-box):
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Security & Secrets Management
- All sensitive credentials are saved in `.env` (ignored by Git).
- Never commit private keys to version control.
- Test connections securely via the in-game Settings modal.

---

## 📜 License
MIT License. Created by Tarun.
