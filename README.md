# 囲碁 • Suiji (粋碁)
### Modern Go Institute × AI Strategic Analysis & Interactive Learning Dojo

> A high-fidelity, modular web platform for the game of Go (*Weiqi / Baduk*), built with realistic procedural Japanese Kaya wood grain, physical slate & shell stone rendering, synthesized acoustic audio, multi-tier heuristic AI, live territory influence estimation, and an **Interactive Learning Dojo**.

---

## 🌟 Key Features

### 1. 🎓 Interactive Learning Dojo (囲碁道場)
- **1. Rules & Fundamentals**:
  - *The Grid & The Stone*: Playing on intersections rather than squares.
  - *Liberties & Breathing Space*: How stones live and connect.
  - *Atari & Capturing*: Removing breathless enemy stones.
  - *Two Eyes & Unconditional Life*: The secret of immortality in Go; true vs false eyes.
  - *The Ko Rule*: Preventing infinite loops and eternal repetition.
  - *Territory & Scoring*: Area scoring, borders, and White's Komi compensation.
- **2. Master Tactics & Named Moves**:
  - *The Ladder (Shicho • シチョウ)*: The diagonal zig-zag chase to the edge of the board.
  - *The Net (Geta • 下駄)*: Loosely trapping stones without physical contact.
  - *The Snapback (Uttegaeshi • 打って返し)*: The intentional sacrifice counter-capture.
  - *Double Atari (Ryō-atari • 両アタリ)*: Forking two targets simultaneously.
  - *Cut & Connect (Kiri & Tsugi • 切りと継ぎ)*: Slicing enemy shapes vs unifying friendly stones.
  - *The Crane's Nest (Tsuru no Sugomori • 鶴の巣篭もり)*: Classic encirclement of overextended stones.
- **3. Tsumego Life & Death Challenges**:
  - Interactive puzzles with live validation, hints, and progressive difficulty.

### 2. 🪨 Realistic Visual & Acoustic Engine
- **Procedural Kaya Wood Grain**: Custom canvas shaders rendering organic wood fibers, growth rings, knots, and top lacquer luster.
- **Slate & Shell 3D Stones**: Radial specular highlights, depth gradient shading, and responsive drop bounce.
- **Synthesized Web Audio**: Procedurally generated stone clicks, wood resonance, multi-capture clatter, and victory chimes.
- **Live Territory Heatmap**: Real-time influence field calculations showing contested borders and point margins.

### 3. 🧠 Multi-Tier AI Analysis & Intent HUD
- **Beginner Kyu**: Educational, forgiving play with tactical learning opportunities.
- **Mid Dan (Club Strength)**: Solid shape connectivity, atari defense, and aggressive territorial invasion.
- **High Dan (Pro Grade)**: Deep lookahead search, ladder reading, and eyespace denial.
- **Intent HUD**: Translates AI moves into natural human tactical explanations with Japanese Go terminology (*Fuseki, Hiraki, Uchikomi, Shinogi, Moyo*).

### 4. 📐 Multi-Board Dimensions & Game Management
- **9×9 Quick Board**: High-intensity tactical combat and introductory games.
- **13×13 Club Board**: Balanced middle-game fighting and framework building.
- **19×19 Grand Board**: Full tournament standard board with authentic Hoshi star positions.
- **SGF Import & Export**: Download completed matches in standard `.sgf` format.
- **Post-Game Timeline Scrubber**: Review entire match move-by-move with automated key move detection and autoplay.

---

## 🏗️ Architecture & Expandability

The codebase is built with zero runtime bloat using clean ES modules ready to wrap into mobile applications (Capacitor for iOS/Android) or desktop wrappers (Tauri / Electron):

```
suiji-go/
├── index.html                   # Responsive application UI
├── vite.config.js               # Dev server & optimized production bundler
├── public/
│   ├── favicon.svg              # Japanese seal vector icon
│   └── manifest.webmanifest    # PWA installable manifest
└── src/
    ├── core/
    │   ├── Constants.js         # Board sizes, Hoshi stars, coordinates
    │   ├── GoRules.js           # Liberties, captures, suicide & Ko rules, territory
    │   ├── GoGame.js            # Central game state machine & move history
    │   └── SgfParser.js         # SGF export & import engine
    ├── ai/
    │   ├── GoAI.js              # Heuristic search & difficulty tuning
    │   └── IntentEvaluator.js   # Humanized tactical annotations
    ├── audio/
    │   └── SoundEngine.js       # Synthesized Web Audio acoustics
    ├── renderer/
    │   ├── BoardRenderer.js     # Kaya wood, slate & shell stones, animations
    │   └── HeatmapRenderer.js   # Live influence & territory visualizer
    ├── learning/
    │   ├── curriculum/
    │   │   ├── rulesLessons.js  # Interactive beginner lessons
    │   │   ├── tacticsLessons.js# Named tactics & shapes
    │   │   └── practicePuzzles.js# Tsumego interactive puzzles
    │   ├── LearningEngine.js    # Lesson runner & validation state machine
    │   └── LearningUI.js        # Academy modal & progress tracker
    └── main.js                  # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm

### Local Development
```bash
# Clone repository
git clone https://github.com/a-vip/suiji-go.git
cd suiji-go

# Install dependencies
npm install

# Start local development server with Hot Module Reloading
npm run dev
```

### Production Build
```bash
# Compile optimized production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

### Mobile Packaging (iOS & Android)
Because Suiji is built on standard web standards with PWA manifest, it can be converted to native iOS/Android apps in minutes via Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Suiji Go" "com.suiji.go" --web-dir dist
npx cap add android
npx cap add ios
npm run build
npx cap sync
```

---

## 📜 License
MIT License. Crafted with precision for Go players worldwide.
