# Dawn of Worlds: Genesis of Deities

An interactive deity world-building sandbox game inspired by the legendary tabletop game *Dawn of Worlds*. Players and autonomous NPC deities act as immortal shapers of a living planet—sculpting tectonic geography with cascading physical ripples, weaving climate-altering miracles, synthesizing sentient species via genetic engineering, and witnessing emergent geopolitics unfold on a real-time 3D globe.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Running Locally](#running-locally)
4. [Building for Production](#building-for-production)
5. [Deployment Guide](#deployment-guide)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)
7. [Architecture & Project Structure](#architecture--project-structure)
8. [Dawn of Worlds Game Mechanics](#dawn-of-worlds-game-mechanics)

---

## Features

- **Interactive 3D Living Globe & 2D Cartographer's Atlas**:
  - WebGL globe rendered with Three.js, complete with dynamic atmosphere, day/night rim lighting, coordinate reticles, 3D city bastions, avatars, marching armies, and parabolic trade arcs.
  - **Multi-Block Selection via Click-and-Drag Motion**:
    - Select multiple adjacent (orthogonally or diagonally adjacent) world blocks with an intuitive click-and-drag motion on both the 3D Globe and 2D Cartographer's Table.
    - **Toggable Drag Multi-Select Mode**: Toggle "Drag Multi-Select" in the viewport overlay, or simply hold `Shift` while dragging to seamlessly sweep across adjacent tiles.
    - **Power Cost Scaling**: Faithfully scales divine power costs per user rule: **+1 Power Cost** for the first 2 blocks, and **+2 Power Cost** for every block beyond that (`baseCost + 1 + (N - 2) * 2` for $N \ge 2$).
  - **Exact World Segment Highlight**: Replaced circular indicators with curved spherical quad mesh and outline highlights that conform directly to the precise borders and curvature of the selected or moused-over world segment.
  - **Pause / Resume Globe Rotation Toggle**: Interactive button in the 3D viewport control bar to pause automatic planetary rotation for precision inspections or resume smooth rotation anytime.
  - Seamless toggle to a vintage 2D cartographer's parchment projection.
  - **High-Visibility Resource Display**: Mineral and magical veins are clearly depicted on the 2D map with glowing glyphs (💎 Mithril/Gems, ⛏ Ore/Gold/Quarry, 🔮 Mana Springs, 🌾 Fertile Delta, 🌲 Timber), a toggleable high-contrast resource overlay, and an interactive Section Inspector card detailing exact location, elevation, climate, and economic/military bonuses.
  - View filters: Geography, Biomes & Climate, Resources, Political Borders, Population Density Heatmap, Trade Routes, and Active Conflicts.

- **Cascading Tectonic & Ocean Sinking Physics**:
  - **Tectonic Cascades**: Uplifting volcanic crags or mountain ranges triggers outward tectonic ripples, forming epicenters, rugged foothills, fertile ash plains, and coastal shelves.
  - **True Ocean Sinking & Trench Deepening**:
    - Sinking ocean near shallow water systematically depresses water depths: `shallow_water` $\rightarrow$ `ocean`, and `ocean` $\rightarrow$ `deep_ocean`.
    - **Monotonic Lowering Guarantee**: Sinking water preserves deep abyssal trenches and never accidentally uplifts existing ocean or deep ocean into shallow water in outer impact zones.
  - **Comprehensive Biome Palette**: Volcanic Crags, Mountain Peaks, Rolling Hills, Swamps & Mires, Ancient Forests, Fertile Plains, Arid Deserts, and Abyssal Oceans.
  - **Granularity & Scope Scaling**: Switch between *Tectonic Cascade (4 Rings)*, *Regional (2 Rings)*, or *Pinpoint (1 Cell)* with dynamically scaled divine power costs.

- **Genetic Species Synthesizer & Subrace Evolution**:
  - **Mortal & Monstrous Classifications**: Synthesize civilized mortal species (Humans, Elves, Dwarves, Halflings) or monstrous/savage broods (Orcs, Goblins, Kobolds, Troglodytes, Undead Revenants, Chitin Swarms).
  - **Subrace Mutation with Parent Prefill**: Splinter existing races into adapted offshoots at reduced divine cost, pre-filling parent traits and automatically formatting the species name with the primary parent in parentheses (e.g. `Sandborne (Human)`, `Woodland (Elf)`).
  - **Species Name Generator**: Roll evocative fantasy names based on race category, biomes, and subrace hierarchy.
  - **Location-Anchored Myth & Lore Generator**: Weaves rich origin stories and cultural lore tailored directly to the selected world tile's terrain, climate, elevation, and resources using standard fantasy tropes.
  - **Everyday & Exotic Genetic Options**: Normal humanoid skin, leathery hide, silken fair epidermis, reptilian scales, chitinous carapace, necrotic flesh; normal trichromatic vision, low-light/twilight vision, infrared darkvision; normal scholastic thoughts, survival cunning, telepathic networks, and monstrous bloodlust.
  - **Expanded Societal Philosophies**: Feudal Monarchy, Mercantile Guilds, Militaristic Hegemony, Arcane Magocracy, Monastic Craft Enclaves, Totemic Clans, Nomadic Herders, Holy Theocracy, Communal Democracy, Brood Hive Collective, Reaver Enclaves, Anarchic Wildlings, and Undead Necrocracy.

- **Autonomous NPC Deities**:
  - Deities with unique domains (Earthforging, Nature, Necromancy, Sun/Law, Oceans, Void Arcana), distinct personality traits, and dynamic rivalry/alliance relationship scores.
  - Automated AI turn execution adhering to official *Dawn of Worlds* turn orders and power costs.

- **Emergent Geopolitics & Tactical Conflicts**:
  - Population growth, agricultural carrying capacity, and automated trade route establishment between allied settlements.
  - Border friction detection leading to territorial conflicts, resolved through a faithful 2d6 martial engine incorporating fortresses, high-ground advantages, tech bonuses, and fatigue.

- **Custom Miracle Weaver**:
  - Forge divine miracles that alter atmospheric moisture, bless soils, trigger geothermal deltas, or unleash catastrophic celestial wrath.

- **Bede Chronicles**:
  - Comprehensive historical record documenting every divine act, tectonic shift, civilization milestone, and great war across the Three Ages of Creation.

---

## Prerequisites

- **Node.js**: Version 18.0.0 or higher (Node 20+ recommended).
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`.
- **Browser**: Modern web browser with WebGL2 support (Chrome, Firefox, Safari, Edge).

---

## Running Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd dawn-of-worlds-genesis
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000`.

4. **Open in browser**:
   Navigate to `http://localhost:3000` to begin shaping the world.

---

## Building for Production

To create an optimized, minified production bundle:

```bash
npm run build
```

This compiles TypeScript source files and bundles all assets using Vite into the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```
This serves the contents of `dist/` at `http://localhost:4173` (or specified preview port).

---

## Deployment Guide

### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages, Cloudflare Pages)

Because this is a high-performance React SPA built with Vite:

1. Connect your repository to your preferred host (Vercel, Netlify, Cloudflare Pages).
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Deploy!

### Option 2: Docker / Container Deployment (Google Cloud Run, AWS ECS)

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Sample `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Build and run:
```bash
docker build -t dawn-of-worlds .
docker run -p 8080:80 dawn-of-worlds
```

---

## Debugging & Troubleshooting

### 1. Type Checking & Code Verification
Run the TypeScript compiler in no-emit mode to verify all types and detect syntax regressions:
```bash
npm run lint
```

### 2. WebGL Performance & Software Renderers
The 3D globe component (`src/components/WorldGlobe.tsx`) automatically detects whether software rendering is active (e.g. SwiftShader, llvmpipe) and optimizes visual fidelity accordingly:
- If running on lower-end devices or software rasterizers, antialiasing is disabled and pixel ratio is locked to 1.0 for smooth performance.
- If Three.js fails to initialize in restricted environments, switch seamlessly to the **Parchment Atlas** view using the view toggle in the top-right bar.

### 3. Globe Selection Reticle Alignment
The celestial coordinate selector is parented directly to `globeMesh` in Three.js and uses direct spherical UV mapping:
- Coordinate conversion is handled by `cellIndexToVector3(cellIndex, radius)` in `src/simulation/worldGrid.ts`.
- The grid consists of 24 latitude rows (-80° to +80°) and 48 longitude columns (-180° to +180°), mapping 1,152 discrete hexagonal/spherical cells.

### 4. Dev Server Port
The default dev server is configured to bind to port 3000 (`--port=3000 --host=0.0.0.0`). If port 3000 is occupied, you can override it:
```bash
npx vite --port=3001
```

---

## Architecture & Project Structure

```
├── index.html                   # HTML entry point with metadata
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration with Tailwind plugin
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Root simulation orchestrator & state container
│   ├── index.css                # Global stylesheet with Tailwind CSS
│   ├── types/
│   │   └── game.ts              # Core TypeScript interfaces & game models
│   ├── simulation/
│   │   ├── dawnOfWorldsRules.ts # 2d6 rolling, thrift bonus, power cost tables
│   │   ├── worldGrid.ts         # Cascading tectonic terrain & climate algorithms
│   │   ├── races.ts             # Genetic synthesis traits & fantasy archetypes
│   │   ├── npcDeities.ts        # AI deity personalities, logic & turn routines
│   │   ├── miracles.ts          # Custom miracle execution engine
│   │   ├── geopolitics.ts       # Trade routes, population growth, borders
│   │   └── conflicts.ts         # 2d6 battle resolution with tech & terrain
│   └── components/
│       ├── WorldGlobe.tsx       # Three.js 3D interactive globe with reticle & arcs
│       ├── FlatMapAtlas.tsx     # 2D parchment cartographic projection
│       ├── ControlDock.tsx      # Divine action dock with scope & cost scaling
│       ├── TopStatusBar.tsx     # Age indicator, turn tracker & power counter
│       ├── RaceGeneratorModal.tsx# Deep genetic trait & race synthesis UI
│       ├── MiracleWeaverModal.tsx# Custom miracle crafting studio
│       ├── BattleModal.tsx      # Tactical conflict animation & results
│       ├── ChronicleDrawer.tsx  # Historical Bede chronicle logs
│       └── PantheonDrawer.tsx   # Deity relationships, domains & power standings
```

---

## Dawn of Worlds Game Mechanics

The simulation strictly observes the authentic mechanics of *Dawn of Worlds*:

### The Three Ages
1. **First Age: Age of Land (Rounds 1–5)**:
   - Shaping land and climate is very cheap (Land: 3, Climate: 2).
   - Deities raise continents, mountain ranges, and primordial oceans before life stirs.
2. **Second Age: Age of Life (Rounds 6–10)**:
   - Creating races and sub-races becomes accessible (Create Race: 6, Sub-race: 4).
   - Land shaping costs increase (Land: 5, Climate: 4).
3. **Third Age: Age of Civilizations (Rounds 11+)**:
   - Advanced warfare, city founding, wondrous structures, and cataclysmic avatars (City: 4, Army: 6, Avatar: 10).
   - Land shaping becomes an immense divine exertion (Land: 8, Climate: 6).

### Divine Power Points & Thrift
- At the start of each round, all deities roll **2d6**.
- **Thrift Rule**: Any unspent power points are hoarded for future rounds. Deities who conserve power receive a thrift bonus (+1 to +3) on subsequent rolls.

### Cascading Physics & Scopes
- **Tectonic Cascade (4 Rings)**: Full physical chain reaction (base power cost).
- **Regional (2 Rings)**: Moderate local ripple (reduced power cost).
- **Pinpoint (1 Cell)**: Precision surgical modification (minimum power cost).
