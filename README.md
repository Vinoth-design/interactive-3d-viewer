# Interactive 3D Vanity Configurator & Viewer

A high-fidelity 3D web configurator for the **Everdale Bathroom Vanity Series**, featuring interactive 3D model viewing, modular sizing, photorealistic studio lighting, and smooth e-commerce customization.

Built with **React**, **Three.js**, **Vite**, **framer-motion**, and **Blender**.

---

## ✨ Features

- **Interactive 3D Configurator**:
  - Full 360° orbit, pan, and zoom controls.
  - Multi-camera presets (`3/4 View`, `Front`, `Basin`, `Drawers`).
  - Interactive drawer slide mechanics with flush closure physics and interior modular storage trays.
  - Sizing options: `24″`, `31″`, `37″`, `49″`, and `61″` (Double Vanity with 4 independent drawers).
  - Customizable finishes: Vanity paint (Evergreen Fog, White, Navy, Pebble Gray), countertop stone, hardware finishes (Antique Brass, Matte Black, Brushed Nickel).
  - Depth selection (`16″`, `19″`, `22″`) and real-time dimension overlay guides.

- **SaleVerse-Grade Visual Realism**:
  - **HDR Environment Lighting**: Image-based studio reflections using CC0 1K HDRIs (`studio_small_09_1k.hdr` and `warm_studio_1k.hdr`) via `RGBELoader` + `PMREMGenerator`.
  - **Post-Processing Pipeline**: Three.js `EffectComposer` with `UnrealBloomPass` for subtle specular bloom on glowing wall sconces and brass hardware, paired with `ACESFilmicToneMapping`.
  - **Scene Lighting Presets**: Switch between *Studio Clean*, *Daylight Crisp*, *Evening Luxury*, and *Warm Bath*.
  - **Idle Turntable Orbit**: Automatic gentle showcase auto-rotation after 6.5s of inactivity, auto-cancelled instantly on user interaction.
  - **Width-Adaptive Framing**: Camera automatically adjusts focal distance and height to frame different cabinet widths perfectly.

- **Modern Glassmorphic UI & Motion Design**:
  - 64/36 hero layout dominance for an immersive 3D presentation.
  - Frosted glassmorphism panels (`backdrop-filter: blur(24px)`) for the floating viewport toolbar, camera pills, and pricing cards.
  - Fluid spring animations powered by `framer-motion` for modals, sliding drawers, and an animated retail price ticker.
  - True 1:1 scale AR (Augmented Reality) modal with QR code generation for iOS AR Quick Look and Android WebXR.

---

## 📁 Repository Structure

```text
├── everdale-configurator/       # React + Vite + Three.js web configurator application
│   ├── public/
│   │   ├── models/              # Interactive GLB assets (24", 31", 37", 49", 61")
│   │   └── textures/            # CC0 1K Studio & Warm Bath HDRI environment maps
│   ├── src/
│   │   ├── components/          # Viewport3D, ConfigPanel, Modals, TopNav
│   │   ├── three/               # VanitySceneManager (Three.js scene, lighting, post-processing)
│   │   ├── config/              # Catalog definitions, finishes, pricing rules
│   │   ├── App.jsx              # Main application state & layout
│   │   └── index.css            # Luxury glassmorphism design system
│   └── package.json
├── Everdale_Vanity/             # Blender source files by production stages
│   ├── 02_Modelling/
│   ├── 03_Drawer_Assembly/
│   ├── 04_Exterior_Detailing/
│   ├── 05_Materials/
│   ├── 06_Animation/
│   └── 07_Export/               # Blender final exports (24", 31", 37", 49", 61")
├── 3d model/                    # Product reference imagery & dimensions
├── launch_configurator.bat      # Windows one-click launcher for configurator
├── launch_viewer.bat            # Windows launcher for local server
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Running the Configurator
1. Navigate into the application directory:
   ```bash
   cd everdale-configurator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### Building for Production
```bash
cd everdale-configurator
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite 6, framer-motion, lucide-react, canvas-confetti, qrcode
- **3D Graphics**: Three.js (r172), EffectComposer, UnrealBloomPass, RGBELoader, OrbitControls
- **3D Modeling & Animation**: Blender 5.3 (PBR materials, shape animation, GLTF export)
