import * as THREE from 'three';

// 1. Procedural High-Fidelity Concrete Texture (Aggregate, pores, surface noise)
function createDetailedConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base concrete grey
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, 0, 512, 512);

    // Micro noise & sand grains
    for (let i = 0; i < 40000; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const y = (Math.cos(i * 78.233) * 43758.5453) % 1;
      const px = Math.floor(Math.abs(x) * 512);
      const py = Math.floor(Math.abs(y) * 512);
      const shade = 100 + Math.floor(Math.abs(Math.sin(i * 3.14)) * 60);
      ctx.fillStyle = `rgba(${shade}, ${shade + 2}, ${shade + 4}, 0.15)`;
      ctx.fillRect(px, py, 1.5, 1.5);
    }

    // Subtle formwork seams / board marks
    ctx.strokeStyle = 'rgba(40, 45, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 64; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 2. Weathered Pier Surface with Waterline & Salt Staining
function createWeatheredPierTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Gradient from upper weathered concrete down to dark algae/salt water mark
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#596273');
    grad.addColorStop(0.5, '#47505e');
    grad.addColorStop(0.8, '#333e48');
    grad.addColorStop(1.0, '#1c2833');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Weathering rain streaks (vertical)
    for (let i = 0; i < 35; i++) {
      const x = Math.floor(Math.abs((Math.sin(i * 91.3) * 43758.5453) % 1) * 512);
      const w = 4 + Math.floor(Math.abs(Math.sin(i)) * 12);
      const streakGrad = ctx.createLinearGradient(x, 0, x, 512);
      streakGrad.addColorStop(0, 'rgba(30, 40, 50, 0.05)');
      streakGrad.addColorStop(0.7, 'rgba(20, 30, 40, 0.25)');
      streakGrad.addColorStop(1.0, 'rgba(10, 20, 30, 0.5)');
      ctx.fillStyle = streakGrad;
      ctx.fillRect(x, 0, w, 512);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

// 3. Fine Bitumen Asphalt Road Texture
function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#141822';
    ctx.fillRect(0, 0, 512, 512);

    // Fine mineral aggregates
    for (let i = 0; i < 50000; i++) {
      const x = (Math.sin(i * 45.1) * 43758.5453) % 1;
      const y = (Math.cos(i * 12.3) * 43758.5453) % 1;
      const px = Math.floor(Math.abs(x) * 512);
      const py = Math.floor(Math.abs(y) * 512);
      const grain = 25 + Math.floor(Math.abs(Math.sin(i)) * 40);
      ctx.fillStyle = `rgba(${grain}, ${grain + 2}, ${grain + 5}, 0.25)`;
      ctx.fillRect(px, py, 1, 1);
    }

    // Subtle tire track darkening
    ctx.fillStyle = 'rgba(10, 12, 16, 0.3)';
    ctx.fillRect(80, 0, 100, 512);
    ctx.fillRect(332, 0, 100, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

const detailedConcreteTex = createDetailedConcreteTexture();
const weatheredPierTex = createWeatheredPierTexture();
const asphaltTex = createAsphaltTexture();

export const MATERIALS = {
  // 1. High-Fidelity PBR Structural Concrete (Deck, diaphragms, abutments)
  concrete: new THREE.MeshStandardMaterial({
    color: '#71717a',
    roughness: 0.82,
    metalness: 0.05,
    map: detailedConcreteTex,
    bumpMap: detailedConcreteTex,
    bumpScale: 0.015,
  }),

  // 2. Weathered Pier & Substructure Concrete
  pierConcrete: new THREE.MeshStandardMaterial({
    color: '#525b6a',
    roughness: 0.88,
    metalness: 0.08,
    map: weatheredPierTex,
    bumpMap: detailedConcreteTex,
    bumpScale: 0.02,
  }),

  // 3. Foundation Footing Heavy Concrete (Submerged / tidal)
  foundationConcrete: new THREE.MeshStandardMaterial({
    color: '#384252',
    roughness: 0.94,
    metalness: 0.04,
    map: weatheredPierTex,
  }),

  // 4. Bitumen Asphalt Roadway
  asphalt: new THREE.MeshStandardMaterial({
    color: '#1a1f2c',
    roughness: 0.94,
    metalness: 0.08,
    map: asphaltTex,
  }),

  // 5. Structural Steel Girders & Diaphragms
  steelGirder: new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.38,
    metalness: 0.85,
  }),

  // 6. Corroded Weathering Steel Plate
  corrodedSteel: new THREE.MeshStandardMaterial({
    color: '#7c2d12',
    roughness: 0.92,
    metalness: 0.4,
  }),

  // 7. Exposed Corrugated Rebar
  rebar: new THREE.MeshStandardMaterial({
    color: '#9a3412',
    roughness: 0.75,
    metalness: 0.7,
  }),

  // 8. High-Tension Structural Stay Cable
  cable: new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.25,
    metalness: 0.92,
  }),

  // 9. Neoprene Elastomeric Bearing
  rubberBearing: new THREE.MeshStandardMaterial({
    color: '#090d16',
    roughness: 0.96,
    metalness: 0.05,
  }),

  // 10. Concrete Jersey Barrier
  barrier: new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.75,
    metalness: 0.15,
  }),

  // 11. Galvanized Steel Guardrail
  guardrail: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.3,
    metalness: 0.9,
  }),

  // 12. Component Selection Highlight Overlay
  selectedHighlight: new THREE.MeshStandardMaterial({
    color: '#00f2fe',
    emissive: '#00f2fe',
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88,
  }),

  // 13. Component Hover Highlight Overlay
  hoverHighlight: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#38bdf8',
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.65,
  }),

  // 14. Computational Wireframe
  wireframe: new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  }),

  // 15. Stress Heatmap Material (dynamic vertex colors)
  stressHeatmap: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.45,
    metalness: 0.15,
  }),
};
