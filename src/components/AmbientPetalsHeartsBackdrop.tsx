import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type PieceKind = 'heart' | 'petal' | 'ribbon';

interface CornerPieceState {
  id: number;
  kind: PieceKind;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  /** Normalized viewport corner anchor (-1..1), or scroll-section corner */
  nx: number;
  ny: number;
  baseZ: number;
  /** Scroll anchoring: 'fixed-corner' stays in viewport corner; 'scroll-corner' glides with page scroll */
  mode: 'fixed-corner' | 'scroll-corner';
  scrollCenterY: number; // world-units height offset per normalized scroll
  baseScale: number;
  baseRot: THREE.Euler;
  phase: number;
  driftSpeed: number;
  spinSpeed: THREE.Vector3;
  // Spring / interactive offsets
  offset: THREE.Vector3;
  vel: THREE.Vector3;
  rotOffset: THREE.Vector3;
  rotVel: THREE.Vector3;
  hoverFactor: number;
  pulseTimer: number;
}

interface BurstParticle {
  mesh: THREE.Mesh;
  active: boolean;
  age: number;
  life: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  baseScale: number;
}

const TAU = Math.PI * 2;
const _vec3 = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _ptrNdc = new THREE.Vector2();
const _worldMouse = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();

function seededRand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/* ---- Procedural Micro-Textures ---- */
function createSatinBumpTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 2) {
    ctx.fillStyle = x % 4 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';
    ctx.fillRect(x, 0, 1, 128);
  }
  ctx.fillStyle = '#B8B8B8';
  ctx.fillRect(0, 0, 5, 128);
  ctx.fillRect(123, 0, 5, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 5);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createVelvetMaps(renderer: THREE.WebGLRenderer) {
  const size = 128;
  const bump = new Uint8Array(size * size * 4);
  const rough = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const h = (((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1) + 1) % 1;
      const swirl =
        0.5 +
        0.5 *
          Math.sin(x * 0.08 + Math.cos(y * 0.07) * 2.0) *
          Math.cos(y * 0.07 - Math.sin(x * 0.06) * 1.6);
      const bv = Math.round(100 + h * 85 + swirl * 45);
      bump[idx] = bump[idx + 1] = bump[idx + 2] = bv;
      bump[idx + 3] = 255;

      const rv = Math.round(215 + swirl * 22 + h * 14);
      rough[idx] = rough[idx + 1] = rough[idx + 2] = rv;
      rough[idx + 3] = 255;
    }
  }
  const bumpMap = new THREE.DataTexture(bump, size, size);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2.5, 2.5);
  bumpMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.DataTexture(rough, size, size);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { bumpMap, roughnessMap };
}

function createFoilNormalMap(renderer: THREE.WebGLRenderer): THREE.DataTexture {
  const size = 128;
  const h = new Float32Array(size * size);
  const seeds: { x: number; y: number; nx: number; ny: number }[] = [];
  for (let i = 0; i < 42; i++) {
    const sx = ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1) * size;
    const sy = ((((Math.sin(i * 78.233) * 43758.5453) % 1) + 1) % 1) * size;
    const ang = i * 2.39996;
    seeds.push({ x: sx, y: sy, nx: Math.cos(ang), ny: Math.sin(ang) });
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let best = 1e9;
      let bi = 0;
      for (let s = 0; s < seeds.length; s++) {
        let dx = Math.abs(x - seeds[s].x);
        let dy = Math.abs(y - seeds[s].y);
        if (dx > size * 0.5) dx = size - dx;
        if (dy > size * 0.5) dy = size - dy;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          bi = s;
        }
      }
      const sd = seeds[bi];
      h[y * size + x] =
        ((x - sd.x) * sd.nx + (y - sd.y) * sd.ny) * 0.05 +
        Math.sin(x * 0.42 + y * 0.31) * 0.1;
    }
  }
  const nd = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const ym = (y - 1 + size) % size;
      const yp = (y + 1) % size;
      const dX = (h[y * size + xp] - h[y * size + xm]) * 1.5;
      const dY = (h[yp * size + x] - h[ym * size + x]) * 1.5;
      const len = Math.sqrt(dX * dX + dY * dY + 1);
      const idx = (y * size + x) * 4;
      nd[idx] = Math.round(((-dX / len) * 0.5 + 0.5) * 255);
      nd[idx + 1] = Math.round(((-dY / len) * 0.5 + 0.5) * 255);
      nd[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      nd[idx + 3] = 255;
    }
  }
  const normalMap = new THREE.DataTexture(nd, size, size);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(2, 2);
  normalMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  normalMap.needsUpdate = true;
  return normalMap;
}

function createPetalTextures(
  renderer: THREE.WebGLRenderer,
  tipHex: string,
  baseHex: string
) {
  const c = document.createElement('canvas');
  c.width = 192;
  c.height = 192;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 192, 0, 0);
  grad.addColorStop(0, baseHex);
  grad.addColorStop(0.42, tipHex);
  grad.addColorStop(1, '#FFF6F9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 192, 192);

  for (let i = -8; i <= 8; i++) {
    ctx.strokeStyle = 'rgba(130, 56, 80, 0.14)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(96 + i * 2, 192);
    ctx.quadraticCurveTo(96 + i * 11, 100, 96 + i * 16, 10);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return map;
}

/* ---- Sculpted Watertight 3D Geometries ---- */
function getHeartPoint(theta: number, scale: number) {
  const s = Math.sin(theta);
  const hx = (16 * s * s * s) / 34;
  const hy =
    (13 * Math.cos(theta) -
      5 * Math.cos(2 * theta) -
      2 * Math.cos(3 * theta) -
      Math.cos(4 * theta) +
      2.6) /
    34;
  return { x: hx * scale, y: hy * scale };
}

function createSculptedPillowHeartGeometry(scale = 0.56): THREE.BufferGeometry {
  const radialSegs = 48;
  const rings = 20;
  const depthScale = 0.24 * scale;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let rIdx = 0; rIdx <= rings; rIdx++) {
    const phi = (rIdx / rings) * Math.PI;
    const r = Math.pow(Math.sin(phi), 0.88);
    const cosPhi = Math.cos(phi);

    for (let aIdx = 0; aIdx <= radialSegs; aIdx++) {
      const u = aIdx / radialSegs;
      const theta = u * TAU;
      const pt = getHeartPoint(theta, scale);
      const px = pt.x * r;
      const py = pt.y * r;
      const cleft =
        py > 0.04 * scale ? Math.exp(-Math.pow(px / (0.14 * scale), 2)) * 0.22 * r : 0;
      const pz = cosPhi * depthScale * (1 - 0.16 * r * r) * (1 - cleft);
      positions.push(px, py, pz);
      uvs.push(px / scale + 0.5, py / scale + 0.5);
    }
  }

  const rowLen = radialSegs + 1;
  for (let rIdx = 0; rIdx < rings; rIdx++) {
    for (let aIdx = 0; aIdx < radialSegs; aIdx++) {
      const a = rIdx * rowLen + aIdx;
      const b = a + 1;
      const c = a + rowLen + 1;
      const d = a + rowLen;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

function createBotanicalPetalGeometry(scale = 0.72): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(0.64 * scale, 0.8 * scale, 18, 22);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const xNorm = u * 2 - 1;
    const widthEnvelope = Math.sin(Math.pow(v, 0.62) * Math.PI) * (0.45 + 0.65 * v);
    const x = xNorm * 0.34 * scale * widthEnvelope;
    const tipNotch = v > 0.8 ? (1 - Math.abs(xNorm)) * 0.045 * scale * ((v - 0.8) / 0.2) : 0;
    const y = (v - 0.45) * 0.78 * scale - tipNotch;
    const cupZ = (xNorm * xNorm * 0.12 + Math.sin(v * Math.PI) * 0.085) * scale;
    const tipCurl = v > 0.72 ? -Math.pow((v - 0.72) / 0.28, 2) * 0.095 * scale : 0;
    const ruffle = Math.sin(xNorm * 5.4 + v * 2.2) * 0.013 * scale * v;
    pos.setXYZ(i, x, y, cupZ + tipCurl + ruffle);
  }
  geo.computeVertexNormals();
  return geo;
}

function createSatinCurlGeometry(turns = 1.65, rad = 0.22, height = 0.72): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  const curveSteps = 44;
  for (let i = 0; i <= curveSteps; i++) {
    const t = i / curveSteps;
    const a = t * TAU * turns;
    const r = rad * (0.52 + 0.48 * Math.sin(t * Math.PI));
    pts.push(new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * height, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);

  const segments = 52;
  const cols = 7;
  const ringSize = cols * 2;
  const thickness = 0.008;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const tangent = new THREE.Vector3();
  const prevT = new THREE.Vector3();
  const normal = new THREE.Vector3(0, 0, 1);
  const side = new THREE.Vector3();
  const q = new THREE.Quaternion();

  curve.getTangentAt(0, prevT).normalize();
  normal.addScaledVector(prevT, -normal.dot(prevT)).normalize();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    curve.getTangentAt(t, tangent).normalize();
    if (i > 0) {
      q.setFromUnitVectors(prevT, tangent);
      normal.applyQuaternion(q).normalize();
    }
    prevT.copy(tangent);
    q.setFromAxisAngle(tangent, 0.045);
    normal.applyQuaternion(q).normalize();
    side.crossVectors(tangent, normal).normalize();

    const halfW = (0.045 + 0.068 * Math.sin(t * Math.PI)) * 0.5;
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);
      const wf = u * 2 - 1;
      const arch = (1 - wf * wf) * thickness * 0.6;
      positions.push(
        p.x + side.x * wf * halfW + normal.x * (thickness * 0.5 + arch),
        p.y + side.y * wf * halfW + normal.y * (thickness * 0.5 + arch),
        p.z + side.z * wf * halfW + normal.z * (thickness * 0.5 + arch)
      );
      uvs.push(u, t);
    }
    for (let c = 0; c < cols; c++) {
      const u = 1 - c / (cols - 1);
      const wf = u * 2 - 1;
      positions.push(
        p.x + side.x * wf * halfW - normal.x * (thickness * 0.5),
        p.y + side.y * wf * halfW - normal.y * (thickness * 0.5),
        p.z + side.z * wf * halfW - normal.z * (thickness * 0.5)
      );
      uvs.push(u, t);
    }
  }

  for (let i = 0; i < segments; i++) {
    const r0 = i * ringSize;
    const r1 = (i + 1) * ringSize;
    for (let j = 0; j < ringSize; j++) {
      const jn = (j + 1) % ringSize;
      indices.push(r0 + j, r0 + jn, r1 + jn, r0 + j, r1 + jn, r1 + j);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function AmbientPetalsHeartsBackdrop() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disposables: { dispose: () => void }[] = [];

    const scene = new THREE.Scene();
    const width = window.innerWidth || 1280;
    const height = window.innerHeight || 720;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 40);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x1f0712, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Zero-dependency PMREM studio reflections for rose foil, crushed velvet, and silk satin
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    disposables.push(envTarget);
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xffe6ef, 0x6e1838, 1.18);
    const keyLight = new THREE.DirectionalLight(0xfff5f2, 2.05);
    keyLight.position.set(5, 7, 6);
    const fillLight = new THREE.DirectionalLight(0xffcde0, 1.05);
    fillLight.position.set(-6, 3, 5);
    const rimLight = new THREE.DirectionalLight(0xff8cb3, 1.55);
    rimLight.position.set(-4, -3, -5);
    scene.add(hemi, keyLight, fillLight, rimLight);

    /* ---- Shared Procedural Textures & Luxury Materials ---- */
    const satinBump = createSatinBumpTexture(renderer);
    const velvetMaps = createVelvetMaps(renderer);
    const foilNormal = createFoilNormalMap(renderer);
    const petalTexBlush = createPetalTextures(renderer, '#F279A1', '#B51649');
    const petalTexBerry = createPetalTextures(renderer, '#E84F82', '#8C1038');
    disposables.push(
      satinBump,
      velvetMaps.bumpMap,
      velvetMaps.roughnessMap,
      foilNormal,
      petalTexBlush,
      petalTexBerry
    );

    const heartMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x59142f,
        bumpMap: velvetMaps.bumpMap,
        bumpScale: 0.015,
        roughnessMap: velvetMaps.roughnessMap,
        roughness: 0.84,
        metalness: 0.02,
        sheen: 1.0,
        sheenRoughness: 0.48,
        sheenColor: new THREE.Color(0xff8fb3),
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xe84f82,
        bumpMap: velvetMaps.bumpMap,
        bumpScale: 0.014,
        roughnessMap: velvetMaps.roughnessMap,
        roughness: 0.84,
        metalness: 0.02,
        sheen: 1.0,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color(0xfff3f7),
      }),
      new THREE.MeshStandardMaterial({
        color: 0xf48fb1,
        normalMap: foilNormal,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.24,
        metalness: 0.72,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xb51649,
        bumpMap: velvetMaps.bumpMap,
        bumpScale: 0.014,
        roughness: 0.82,
        metalness: 0.02,
        sheen: 1.0,
        sheenRoughness: 0.46,
        sheenColor: new THREE.Color(0xff9bbe),
      }),
    ];

    const ribbonMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x4d1229,
        bumpMap: satinBump,
        bumpScale: 0.009,
        roughness: 0.4,
        metalness: 0.03,
        specularIntensity: 0.36,
        sheen: 1.0,
        sheenRoughness: 0.24,
        sheenColor: new THREE.Color(0xff8fb3),
        anisotropy: 0.88,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xe84f82,
        bumpMap: satinBump,
        bumpScale: 0.009,
        roughness: 0.44,
        metalness: 0.02,
        specularIntensity: 0.3,
        sheen: 1.0,
        sheenRoughness: 0.24,
        sheenColor: new THREE.Color(0xfff3f7),
        anisotropy: 0.85,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xb51649,
        bumpMap: satinBump,
        bumpScale: 0.009,
        roughness: 0.44,
        metalness: 0.03,
        specularIntensity: 0.32,
        sheen: 1.0,
        sheenRoughness: 0.25,
        sheenColor: new THREE.Color(0xff9bbe),
        anisotropy: 0.85,
        side: THREE.DoubleSide,
      }),
    ];

    const petalMaterials = [
      new THREE.MeshPhysicalMaterial({
        map: petalTexBlush,
        roughness: 0.62,
        metalness: 0.0,
        sheen: 0.65,
        sheenRoughness: 0.48,
        sheenColor: new THREE.Color(0xfff3f7),
        clearcoat: 0.12,
        clearcoatRoughness: 0.45,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        map: petalTexBerry,
        roughness: 0.64,
        metalness: 0.0,
        sheen: 0.65,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color(0xf87ca4),
        clearcoat: 0.12,
        clearcoatRoughness: 0.45,
        side: THREE.DoubleSide,
      }),
    ];

    /* ---- Shared Sculpted 3D Geometries ---- */
    const heartGeo = createSculptedPillowHeartGeometry(0.54);
    const petalGeo = createBotanicalPetalGeometry(0.68);
    const ribbonGeoA = createSatinCurlGeometry(1.55, 0.21, 0.66);
    const ribbonGeoB = createSatinCurlGeometry(1.9, 0.17, 0.58);
    const hitSphereGeo = new THREE.SphereGeometry(0.46, 10, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    disposables.push(
      ...heartMaterials,
      ...ribbonMaterials,
      ...petalMaterials,
      heartGeo,
      petalGeo,
      ribbonGeoA,
      ribbonGeoB,
      hitSphereGeo,
      hitMat
    );

    /* ---- Randomized Corner Layout Across Viewport & Page Scroll ---- */
    const rng = seededRand(20261119);
    const pieces: CornerPieceState[] = [];
    const hitMeshes: THREE.Mesh[] = [];

    const addCornerPiece = (
      kind: PieceKind,
      nx: number,
      ny: number,
      mode: 'fixed-corner' | 'scroll-corner',
      scrollCenterY: number,
      scaleMul = 1.0
    ) => {
      const id = pieces.length;
      const group = new THREE.Group();

      let visual: THREE.Mesh;
      if (kind === 'heart') {
        const mat = heartMaterials[Math.floor(rng() * heartMaterials.length)];
        visual = new THREE.Mesh(heartGeo, mat);
      } else if (kind === 'ribbon') {
        const mat = ribbonMaterials[Math.floor(rng() * ribbonMaterials.length)];
        const geo = rng() < 0.5 ? ribbonGeoA : ribbonGeoB;
        visual = new THREE.Mesh(geo, mat);
      } else {
        const mat = petalMaterials[Math.floor(rng() * petalMaterials.length)];
        visual = new THREE.Mesh(petalGeo, mat);
      }
      group.add(visual);

      const hitMesh = new THREE.Mesh(hitSphereGeo, hitMat);
      hitMesh.userData.pieceId = id;
      group.add(hitMesh);
      hitMeshes.push(hitMesh);

      const baseScale = (0.78 + rng() * 0.42) * scaleMul;
      const baseRot = new THREE.Euler(
        (rng() - 0.5) * 0.7,
        (rng() - 0.5) * 0.9,
        (rng() - 0.5) * 0.8
      );
      group.scale.setScalar(baseScale);
      group.rotation.copy(baseRot);
      scene.add(group);

      pieces.push({
        id,
        kind,
        group,
        hitMesh,
        nx,
        ny,
        baseZ: -0.6 + rng() * 1.4,
        mode,
        scrollCenterY,
        baseScale,
        baseRot,
        phase: rng() * TAU,
        driftSpeed: 0.45 + rng() * 0.55,
        spinSpeed: new THREE.Vector3(
          (rng() - 0.5) * 0.22,
          (rng() - 0.5) * 0.32,
          (rng() - 0.5) * 0.18
        ),
        offset: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rotOffset: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        hoverFactor: 0,
        pulseTimer: 0,
      });
    };

    // 1. All 4 Viewport Corners (randomized clusters of heart + ribbon + petal in every corner)
    const cornerQuadrants: [number, number][] = [
      [-1, 1], // Top-Left corner (just below sticky header)
      [1, 1], // Top-Right corner (just below sticky header)
      [-1, -1], // Bottom-Left corner
      [1, -1], // Bottom-Right corner
    ];
    const kinds: PieceKind[] = ['heart', 'ribbon', 'petal'];

    cornerQuadrants.forEach(([sx, sy]) => {
      // Shuffle trio slightly per corner so corners feel organic
      const cornerKinds = [...kinds].sort(() => rng() - 0.5);
      cornerKinds.forEach((kind, idx) => {
        const edgeInsetX = 0.78 + (idx === 1 ? 0.11 : rng() * 0.13);
        // Keep top corners safely under 64px header (ny ~ 0.62..0.78), bottom corners 0.64..0.85
        const baseY = sy > 0 ? 0.60 + rng() * 0.18 : 0.64 + rng() * 0.21;
        const jitterY = idx === 2 ? -0.11 * sy : idx === 1 ? 0.04 * sy : 0;
        addCornerPiece(
          kind,
          sx * Math.min(0.93, edgeInsetX),
          sy * Math.min(0.86, baseY) + jitterY,
          'fixed-corner',
          0,
          0.95
        );
      });
    });

    // 2. Scroll-Anchored Side Corner Clusters distributed down the entire webpage height
    const scrollAnchors = [0.22, 0.45, 0.68, 0.90];
    scrollAnchors.forEach((scrollAnchor, rowIdx) => {
      ([-1, 1] as const).forEach((sx) => {
        const pairCount = 2;
        for (let k = 0; k < pairCount; k++) {
          const kind = kinds[(rowIdx + k + (sx > 0 ? 1 : 0)) % kinds.length];
          const nx = sx * (0.81 + rng() * 0.12);
          const localY = (rng() - 0.5) * 0.28;
          addCornerPiece(kind, nx, localY, 'scroll-corner', scrollAnchor, 1.0);
        }
      });
    });

    /* ---- Celebratory Burst Particle Pool (Click/Tap Corner Object Interaction) ---- */
    const BURST_POOL_SIZE = 32;
    const burstParticles: BurstParticle[] = [];
    const burstMats: THREE.Material[] = [
      heartMaterials[1].clone(),
      petalMaterials[0].clone(),
      heartMaterials[2].clone(),
    ];
    burstMats.forEach((m) => {
      m.transparent = true;
      disposables.push(m);
    });

    for (let i = 0; i < BURST_POOL_SIZE; i++) {
      const isHeart = i % 3 === 0;
      const geo = isHeart ? heartGeo : petalGeo;
      const mat = isHeart ? (i % 2 === 0 ? burstMats[0] : burstMats[2]) : burstMats[1];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      scene.add(mesh);
      burstParticles.push({
        mesh,
        active: false,
        age: 0,
        life: 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        baseScale: 0.35,
      });
    }

    const spawnBurst = (origin: THREE.Vector3, count = 6) => {
      let spawned = 0;
      for (let i = 0; i < burstParticles.length && spawned < count; i++) {
        const p = burstParticles[i];
        if (p.active) continue;
        p.active = true;
        p.age = 0;
        p.life = 0.85 + Math.random() * 0.45;
        p.pos.copy(origin);
        const angle = (spawned / count) * TAU + Math.random() * 0.5;
        const speed = 1.4 + Math.random() * 1.4;
        p.vel.set(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed + 0.85,
          0.6 + Math.random() * 0.8
        );
        p.rotVel.set(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 7
        );
        p.baseScale = 0.28 + Math.random() * 0.2;
        p.mesh.position.copy(p.pos);
        p.mesh.scale.setScalar(p.baseScale);
        p.mesh.visible = true;
        spawned++;
      }
    };

    /* ---- Viewport World Bounds & Scroll Tracking ---- */
    let viewHalfW = 7;
    let viewHalfH = 4;
    let isMobile = window.innerWidth < 768;

    const updateBounds = () => {
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 720;
      isMobile = w < 768;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      viewHalfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
      viewHalfW = viewHalfH * camera.aspect;
    };
    updateBounds();

    /* ---- Interactive Window Pointer Listeners (Zero UI Occlusion) ---- */
    let pointerActive = false;
    let hoveredPieceId: number | null = null;
    let lastRaycastTime = 0;

    const isInteractiveDomTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest('button, a, input, select, textarea, label, [role="button"], [role="tab"]')
      );
    };

    const projectPointerToWorld = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      _ptrNdc.set((clientX / w) * 2 - 1, -(clientY / h) * 2 + 1);
      _vec3.set(_ptrNdc.x, _ptrNdc.y, 0.5).unproject(camera);
      _rayDir.copy(_vec3).sub(camera.position).normalize();
      const dist = -camera.position.z / (_rayDir.z || -1);
      _worldMouse.copy(camera.position).addScaledVector(_rayDir, dist);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerActive = true;
      projectPointerToWorld(e.clientX, e.clientY);

      const now = performance.now();
      if (now - lastRaycastTime < 35) return;
      lastRaycastTime = now;

      if (isInteractiveDomTarget(e.target)) {
        hoveredPieceId = null;
        return;
      }

      _raycaster.setFromCamera(_ptrNdc, camera);
      const hits = _raycaster.intersectObjects(hitMeshes, false);
      hoveredPieceId = hits.length > 0 ? (hits[0].object.userData.pieceId as number) : null;
    };

    const onPointerDown = (e: PointerEvent) => {
      projectPointerToWorld(e.clientX, e.clientY);
      pointerActive = true;

      if (isInteractiveDomTarget(e.target)) return;

      _raycaster.setFromCamera(_ptrNdc, camera);
      const hits = _raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.pieceId as number;
        const piece = pieces[hitId];
        if (piece) {
          piece.vel.z += 2.6;
          piece.vel.y += 1.4;
          piece.rotVel.x += (Math.random() - 0.5) * 10;
          piece.rotVel.y += 13;
          piece.rotVel.z += (Math.random() - 0.5) * 9;
          piece.pulseTimer = 1.0;
          spawnBurst(piece.group.position, 6);
        }
      }
    };

    const onPointerLeave = () => {
      pointerActive = false;
      hoveredPieceId = null;
    };

    window.addEventListener('resize', updateBounds);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    /* ---- Frame-Rate Independent Animation Loop + Software WebGL Guard ---- */
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = (now: number) => {
      if (disposed) return;

      if (document.hidden) {
        lastTime = now;
        if (isSoftwareGl) frameId = window.setTimeout(() => tick(performance.now()), 200);
        else frameId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      if (!prefersReducedMotion) elapsed += dt;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollNorm = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);

      const cornerMarginScale = isMobile ? 0.92 : 1.0;

      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];
        let targetX = p.nx * viewHalfW;
        let targetY = p.ny * viewHalfH;

        if (p.mode === 'scroll-corner') {
          // Scroll-corner pieces glide smoothly through viewport corners as user scrolls down page
          const scrollSpanWorld = viewHalfH * 5.2;
          targetY = p.ny * viewHalfH + (scrollNorm - p.scrollCenterY) * scrollSpanWorld;
        }

        // Hide scroll-corner pieces safely outside viewport frustum for clean corner framing
        if (p.mode === 'scroll-corner' && Math.abs(targetY) > viewHalfH * 1.35) {
          p.group.visible = false;
          continue;
        }
        p.group.visible = true;

        const floatX = prefersReducedMotion
          ? 0
          : Math.sin(elapsed * p.driftSpeed + p.phase) * 0.14;
        const floatY = prefersReducedMotion
          ? 0
          : Math.cos(elapsed * p.driftSpeed * 0.85 + p.phase) * 0.16;

        // Cursor proximity gentle magnetic swirl
        let magX = 0;
        let magY = 0;
        let magZ = 0;
        let magRotX = 0;
        let magRotY = 0;

        if (pointerActive && !prefersReducedMotion) {
          const dx = targetX + p.offset.x - _worldMouse.x;
          const dy = targetY + p.offset.y - _worldMouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7.2) {
            const dist = Math.sqrt(distSq) || 0.001;
            const influence = Math.pow(1 - dist / 2.68, 1.8);
            magX = (dx / dist) * influence * 0.36;
            magY = (dy / dist) * influence * 0.36;
            magZ = influence * 0.42;
            magRotY = -(dx / dist) * influence * 0.55;
            magRotX = (dy / dist) * influence * 0.45;
          }
        }

        // Damped spring integration for position & rotation offsets
        const stiff = 42;
        const damp = 7.5;
        p.vel.x += ((magX - p.offset.x) * stiff - p.vel.x * damp) * dt;
        p.vel.y += ((magY - p.offset.y) * stiff - p.vel.y * damp) * dt;
        p.vel.z += ((magZ - p.offset.z) * stiff - p.vel.z * damp) * dt;
        p.offset.addScaledVector(p.vel, dt);

        p.rotVel.x += ((magRotX - p.rotOffset.x) * 32 - p.rotVel.x * 5.2) * dt;
        p.rotVel.y += ((magRotY - p.rotOffset.y) * 32 - p.rotVel.y * 5.2) * dt;
        p.rotVel.z += ((-p.rotOffset.z) * 32 - p.rotVel.z * 5.2) * dt;
        p.rotOffset.addScaledVector(p.rotVel, dt);

        const isHovered = hoveredPieceId === p.id;
        p.hoverFactor = THREE.MathUtils.damp(p.hoverFactor, isHovered ? 1 : 0, 12, dt);
        p.pulseTimer = Math.max(0, p.pulseTimer - dt * 2.2);

        const mobileScale = isMobile ? 0.66 : cornerMarginScale;
        const scale =
          p.baseScale *
          mobileScale *
          (1 + p.hoverFactor * 0.24 + Math.sin(p.pulseTimer * Math.PI) * 0.22);

        p.group.position.set(
          targetX + floatX + p.offset.x,
          targetY + floatY + p.offset.y,
          p.baseZ + p.offset.z
        );
        p.group.scale.setScalar(scale);

        p.group.rotation.set(
          p.baseRot.x + p.rotOffset.x + elapsed * p.spinSpeed.x + p.hoverFactor * 0.2,
          p.baseRot.y + p.rotOffset.y + elapsed * p.spinSpeed.y + p.hoverFactor * 0.45,
          p.baseRot.z + p.rotOffset.z + elapsed * p.spinSpeed.z
        );
      }

      // Advance burst particle pool
      for (let i = 0; i < burstParticles.length; i++) {
        const bp = burstParticles[i];
        if (!bp.active) continue;
        bp.age += dt;
        if (bp.age >= bp.life) {
          bp.active = false;
          bp.mesh.visible = false;
          continue;
        }
        const lifeT = bp.age / bp.life;
        bp.vel.y -= 2.4 * dt; // soft breeze gravity
        bp.vel.multiplyScalar(Math.pow(0.28, dt));
        bp.pos.addScaledVector(bp.vel, dt);
        bp.mesh.position.copy(bp.pos);
        bp.mesh.rotation.x += bp.rotVel.x * dt;
        bp.mesh.rotation.y += bp.rotVel.y * dt;
        bp.mesh.rotation.z += bp.rotVel.z * dt;
        const shrink = lifeT < 0.2 ? lifeT / 0.2 : 1 - (lifeT - 0.2) / 0.8;
        bp.mesh.scale.setScalar(bp.baseScale * Math.max(0.01, shrink));
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(() => tick(performance.now()));
      else frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerleave', onPointerLeave);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
    />
  );
}
