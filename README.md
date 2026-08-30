# CRYONEX — Real-World Infrastructure Digital Twin & Predictive Structural Intelligence Platform

> **Smart India Hackathon 2026** | **Problem Statement:** SIH26158 (Robotics & Drones — Software)  
> **Core Concept:** Drone Photogrammetry / LiDAR → WGS84 Georeferenced Reality Model → Semantic Component Graph → IoT Sensor Telemetry → Deterministic Structural Mechanics (Euler-Bernoulli, LEFM, Fick's Law) → 50-Year Deterioration Intelligence ($2026 \to 2076$) → Scenario Simulation → Decision Support

---

## 🌟 Executive Summary

**CRYONEX** transforms physical civil infrastructure into a **high-fidelity 3D Digital Twin** where damage propagation, dynamic structural mechanics, environmental degradation, and maintenance scenarios are modeled in real-time.

---

## 🚀 Key Features

### 1. Georeferenced 3D Reality Asset & CGI Environment
- **Cable-Stayed Bridge**: Twin reinforced concrete pylon columns, high-density stay cable fan arrays, box-girder deck, fluted piers with waterline marks, caisson footings, and physical spalling cavities with visible exposed corrugated steel rebar cages (`rebarExposure`).
- **River Landscape & Traffic**: Riverbank terrain with lush tree canopy clusters, shoreline rip-rap rock armour, live traffic fleet (sedans, transit buses, semi-trucks, heavy haulers), and a 3,500t navigation cargo vessel.
- **Dynamic Weather System**: `Clear Noon`, `Golden Hour`, `Overcast`, `Rain` (with live animated rain particle precipitation), `Fog`, `Night`.

### 2. Multi-Channel IoT Sensor Telemetry & SHM
- **Fleet of 6 Real/Simulated Sensors**:
  - `SG-P03-01`: Vibrating Wire Strain Gauge on Pier P-03 column ($\mu\epsilon = 295.4$, $100\text{ Hz}$).
  - `TILT-P03`: Dual-Axis Electrolytic Tiltmeter on Pier P-03 ($\theta = 0.14^\circ$, $10\text{ Hz}$).
  - `ACC-D03-01`: Triaxial MEMS Accelerometer on Deck Span 3 ($f_1 = 2.45\text{ Hz}$, $a_{peak} = 0.042\text{ g}$, $250\text{ Hz}$).
  - `CORR-P03`: Linear Polarization Resistance (LPR) Corrosion Rate Probe ($i_{corr} = 2.42\text{ }\mu\text{A/cm}^2$).
  - `SCOUR-F03`: Multi-Point Magnetic Collar Scour Depth Sensor ($d = 0.0\text{ m} \to 2.8\text{ m}$).
  - `WL-CH01`: Ultrasonic River Water Level Gauge ($h = -0.50\text{ m MSL}$).
- **Interactive 3D Sensor Markers**: Physical sensor pucks with signal transmission rings mounted directly in the 3D viewport.
- **Dedicated Sensors Dashboard**: Live time-series waveforms and FFT frequency spectrum.

### 3. 5-Tab Right Engineering Inspector
- **Overview**: Health ($78\%$), risk (`HIGH RISK`), priority ($P1$), material properties ($M50$, $Fe\text{ }500$), cross-section.
- **Mechanics**: Stress ($\sigma = 106.5\text{ MPa}$), strain ($\epsilon = 0.0042$), deflection ($\Delta = 12.4\text{ mm}$, $L/968$), Euler critical buckling ($P_{cr} = 14,820\text{ kN}$), FoS ($2.39$).
- **Sensors / IoT**: Live readings for all sensors mapped to the component, sampling rates, and calibration logs.
- **AI Defect Evidence**: 4K drone inspection capture with YOLOv8 crack segmentation reticle, length $4.20\text{ m}$, width $4.20\text{ mm}$, confidence $94.2\%$, validation status: "Pending Engineer Signoff".
- **Data Provenance**: Geodetic datum, WGS84 coordinates ($18.52043^\circ\text{ N}, 73.85674^\circ\text{ E}, 560.25\text{ m MSL}$), Cesium 3D tiles processing pipeline, point density, spatial accuracy, and validation score.

### 4. 50-Year Deterioration Horizon ($2026 \to 2076$) & What-If Engine
- **Continuous State Evolution**: Chloride diffusion (Fick's 2nd Law) & fatigue crack propagation (Paris-Erdogan Law).
- **6 Physical Failure Scenarios**:
  - `CORROSION`: Marine splash zone chloride diffusion $\to$ concrete core crushing $\to$ vertical subsidence ($2.4\text{m}$).
  - `OVERLOAD`: Multi-axle hauler point loads $\to$ girder flexural yielding $\to$ midspan sag $\to$ vehicle gravity drop.
  - `SHIP_COLLISION`: 3,500t cargo vessel strikes Pier P-03 ($E_k = 19.4\text{ MJ}$) $\to$ pier shear fracture $\to$ deck rotation & water impact $\to$ timeline freeze.
  - `SCOUR`: Riverbed current excavates $2.8\text{m}$ sediment crater $\to$ Footing F-03 $15^\circ$ lateral tilt $\to$ deck lateral slip.
  - `SEISMIC`: Harmonic horizontal ground motion ($a_g = 0.35\text{g}$) $\to$ bearing shear unseating.
  - `DEFERRED_MAINTENANCE`: Long-term microcrack propagation via Paris Law $\to$ brittle fatigue fracture.
- **100% Clean Baseline Restore**: Instantly resets bridge geometry, materials, damage, traffic, ship position, timeline ($2026$, $+0.0\text{y}$), health ($92\%$), and risk ($0.35$ util) without page reload.

---

## 🛠️ Tech Stack

- **Frontend / Framework:** React 18 + TypeScript + Vite + TailwindCSS
- **3D Graphics Engine:** Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **State Management:** Zustand (centralized deterministic simulation store)
- **Icons & UI:** Lucide React

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18.0 or higher recommended)
- npm / yarn / pnpm
- Git

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CRYONEX.git

# Navigate into project directory
cd CRYONEX

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📦 Pushing to GitHub

To push your project to GitHub:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: CRYONEX Engineering-Grade Infrastructure Digital Twin v1.0"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/CRYONEX.git

# 6. Push code to GitHub
git push -u origin main
```
