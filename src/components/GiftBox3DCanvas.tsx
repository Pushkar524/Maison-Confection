import { MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface GiftBox3DCanvasProps {
  openProgress: MotionValue<number>;
  mode: 'hero-open' | 'outro-close';
  className?: string;
}

interface BurstPiece {
  mesh: THREE.Object3D;
  restPos: THREE.Vector3;
  burstOffset: THREE.Vector3;
  restRot: THREE.Euler;
  burstRot: THREE.Euler;
  phaseOffset: number;
  floatAmp: number;
}

const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

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

function createLinenTextures(renderer: THREE.WebGLRenderer) {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = 512;
  albedoCanvas.height = 512;
  const aCtx = albedoCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d');

  if (aCtx && bCtx) {
    aCtx.fillStyle = '#FCEAF0';
    aCtx.fillRect(0, 0, 512, 512);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 512; i += 3) {
      const shade = i % 6 === 0 ? 'rgba(218, 168, 186, 0.16)' : 'rgba(255, 250, 252, 0.25)';
      aCtx.fillStyle = shade;
      aCtx.fillRect(i, 0, 1.5, 512);
      aCtx.fillRect(0, i, 512, 1.5);

      const bVal = i % 6 === 0 ? '#686868' : '#969696';
      bCtx.fillStyle = bVal;
      bCtx.fillRect(i, 0, 1.5, 512);
      bCtx.fillRect(0, i, 512, 1.5);
    }
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3.5, 3.5);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3.5, 3.5);
  bumpMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  return { map, bumpMap };
}

function createInnerPaperTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFF7FA';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 650; i++) {
      const x = (((Math.sin(i * 19.31) * 43758.54) % 1) + 1) % 1 * 256;
      const y = (((Math.sin(i * 73.17) * 43758.54) % 1) + 1) % 1 * 256;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 175, 190, 0.14)' : 'rgba(201, 162, 94, 0.10)';
      ctx.fillRect(x, y, 2, 1);
    }
    ctx.strokeStyle = 'rgba(201, 162, 94, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 236, 236);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createSatinBumpTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 2) {
      ctx.fillStyle = x % 4 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';
      ctx.fillRect(x, 0, 1, 256);
    }
    for (let y = 0; y < 256; y += 3) {
      ctx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, y, 256, 1);
    }
    // Woven selvedge borders
    ctx.fillStyle = '#B8B8B8';
    ctx.fillRect(0, 0, 9, 256);
    ctx.fillRect(247, 0, 9, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 7);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

/** Organic micro-pile crushed velvet bump + roughness textures (zero grid lines, zero plastic gloss) */
function createVelvetTextures(renderer: THREE.WebGLRenderer) {
  const size = 256;
  const bumpData = new Uint8Array(size * size * 4);
  const roughData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const hash =
        (((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1) + 1) % 1;
      const swirl =
        0.5 +
        0.5 *
          Math.sin(x * 0.055 + Math.cos(y * 0.045) * 2.2) *
          Math.cos(y * 0.05 - Math.sin(x * 0.04) * 1.8);

      const bumpVal = Math.round(100 + hash * 85 + swirl * 45);
      bumpData[idx] = bumpVal;
      bumpData[idx + 1] = bumpVal;
      bumpData[idx + 2] = bumpVal;
      bumpData[idx + 3] = 255;

      // High matte roughness (212..248 -> 0.83..0.97) with brushed pile variation
      const roughVal = Math.round(212 + swirl * 22 + hash * 14);
      roughData[idx] = roughVal;
      roughData[idx + 1] = roughVal;
      roughData[idx + 2] = roughVal;
      roughData[idx + 3] = 255;
    }
  }

  const bumpMap = new THREE.DataTexture(bumpData, size, size);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);
  bumpMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.DataTexture(roughData, size, size);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { bumpMap, roughnessMap };
}

/** Hand-crimped metallic foil tangent-space normal map + micro-roughness map */
function createCrinkledFoilMaps(renderer: THREE.WebGLRenderer) {
  const size = 256;
  const height = new Float32Array(size * size);

  // Faceted cellular crease heightfield
  const seeds: { x: number; y: number; nx: number; ny: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const sx = ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1) * size;
    const sy = ((((Math.sin(i * 78.233) * 43758.5453) % 1) + 1) % 1) * size;
    const ang = i * 2.39996;
    seeds.push({ x: sx, y: sy, nx: Math.cos(ang), ny: Math.sin(ang) });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bestDist = 1e9;
      let bestIdx = 0;
      for (let s = 0; s < seeds.length; s++) {
        let dx = Math.abs(x - seeds[s].x);
        let dy = Math.abs(y - seeds[s].y);
        if (dx > size * 0.5) dx = size - dx;
        if (dy > size * 0.5) dy = size - dy;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = s;
        }
      }
      const seed = seeds[bestIdx];
      const tilt = ((x - seed.x) * seed.nx + (y - seed.y) * seed.ny) * 0.045;
      const micro = Math.sin(x * 0.45 + y * 0.3) * 0.12;
      height[y * size + x] = tilt + micro;
    }
  }

  const normalData = new Uint8Array(size * size * 4);
  const roughData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const ym = (y - 1 + size) % size;
      const yp = (y + 1) % size;

      const dX = (height[y * size + xp] - height[y * size + xm]) * 1.8;
      const dY = (height[yp * size + x] - height[ym * size + x]) * 1.8;
      const len = Math.sqrt(dX * dX + dY * dY + 1);

      const idx = (y * size + x) * 4;
      normalData[idx] = Math.round(((-dX / len) * 0.5 + 0.5) * 255);
      normalData[idx + 1] = Math.round(((-dY / len) * 0.5 + 0.5) * 255);
      normalData[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      normalData[idx + 3] = 255;

      const rVal = Math.round(58 + Math.min(85, Math.abs(dX + dY) * 95));
      roughData[idx] = rVal;
      roughData[idx + 1] = rVal;
      roughData[idx + 2] = rVal;
      roughData[idx + 3] = 255;
    }
  }

  const normalMap = new THREE.DataTexture(normalData, size, size);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(2, 2);
  normalMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  normalMap.needsUpdate = true;

  const roughnessMap = new THREE.DataTexture(roughData, size, size);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { normalMap, roughnessMap };
}

/** Baked almond-flour meringue micro-pore bump map for French macarons */
function createMeringueBumpTexture(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const hash = (((Math.sin(i * 91.73) * 43758.5453) % 1) + 1) % 1;
    const val = hash > 0.78 ? 205 : hash < 0.2 ? 85 : 138;
    data[i * 4] = val;
    data[i * 4 + 1] = val;
    data[i * 4 + 2] = val;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}

/** Botanical rose petal albedo + matching radial vein bump map */
function createPetalTextures(
  renderer: THREE.WebGLRenderer,
  baseHex: string,
  tipHex: string
) {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = 256;
  albedoCanvas.height = 256;
  const aCtx = albedoCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d');

  if (aCtx && bCtx) {
    const grad = aCtx.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0, '#FFF8FA');
    grad.addColorStop(0.24, baseHex);
    grad.addColorStop(0.82, tipHex);
    grad.addColorStop(1, tipHex);
    aCtx.fillStyle = grad;
    aCtx.fillRect(0, 0, 256, 256);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 256, 256);

    // Organic cellular mottling + radial botanical veins
    for (let i = -7; i <= 7; i++) {
      aCtx.strokeStyle =
        Math.abs(i) <= 2 ? 'rgba(142, 45, 73, 0.16)' : 'rgba(158, 59, 88, 0.09)';
      aCtx.lineWidth = Math.abs(i) <= 1 ? 1.5 : 1.0;
      aCtx.beginPath();
      aCtx.moveTo(128 + i * 3, 252);
      aCtx.quadraticCurveTo(128 + i * 14, 132, 128 + i * 22, 10);
      aCtx.stroke();

      bCtx.strokeStyle = Math.abs(i) <= 2 ? '#A6A6A6' : '#949494';
      bCtx.lineWidth = Math.abs(i) <= 1 ? 2.2 : 1.4;
      bCtx.beginPath();
      bCtx.moveTo(128 + i * 3, 252);
      bCtx.quadraticCurveTo(128 + i * 14, 132, 128 + i * 22, 10);
      bCtx.stroke();
    }

    // Soft velvety micro-grain
    for (let p = 0; p < 550; p++) {
      const px = (((Math.sin(p * 17.3) * 43758.54) % 1) + 1) % 1 * 256;
      const py = (((Math.sin(p * 63.7) * 43758.54) % 1) + 1) % 1 * 256;
      aCtx.fillStyle = p % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(142,45,73,0.05)';
      aCtx.fillRect(px, py, 2, 2);
      bCtx.fillStyle = p % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
      bCtx.fillRect(px, py, 1.5, 1.5);
    }
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  return { map, bumpMap };
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
    grad.addColorStop(0, 'rgba(22, 16, 19, 0.36)');
    grad.addColorStop(0.55, 'rgba(74, 43, 54, 0.16)');
    grad.addColorStop(1, 'rgba(74, 43, 54, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSatinRibbonStripGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments: number,
  widthFn: (t: number) => number,
  thickness = 0.012,
  twistRad = 0
): THREE.BufferGeometry {
  const crossCols = 7;
  const ptsPerRing = crossCols * 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const tangent = new THREE.Vector3();
  const upRef = new THREE.Vector3(0, 1, 0);
  const altUp = new THREE.Vector3(0, 0, 1);
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    curve.getTangentAt(t, tangent).normalize();

    const ref = Math.abs(tangent.dot(upRef)) > 0.92 ? altUp : upRef;
    side.crossVectors(tangent, ref).normalize();
    normal.crossVectors(side, tangent).normalize();

    if (twistRad !== 0) {
      const ang = twistRad * t;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const sx = side.x * cos + normal.x * sin;
      const sy = side.y * cos + normal.y * sin;
      const sz = side.z * cos + normal.z * sin;
      const nx = -side.x * sin + normal.x * cos;
      const ny = -side.y * sin + normal.y * cos;
      const nz = -side.z * sin + normal.z * cos;
      side.set(sx, sy, sz);
      normal.set(nx, ny, nz);
    }

    const halfW = widthFn(t) * 0.5;

    for (let c = 0; c < crossCols; c++) {
      const u = c / (crossCols - 1);
      const wFrac = u * 2 - 1;
      const camber = (1 - wFrac * wFrac) * thickness * 0.65;
      positions.push(
        p.x + side.x * wFrac * halfW + normal.x * (thickness * 0.5 + camber),
        p.y + side.y * wFrac * halfW + normal.y * (thickness * 0.5 + camber),
        p.z + side.z * wFrac * halfW + normal.z * (thickness * 0.5 + camber)
      );
      uvs.push(u, t);
    }

    for (let c = 0; c < crossCols; c++) {
      const u = 1 - c / (crossCols - 1);
      const wFrac = u * 2 - 1;
      positions.push(
        p.x + side.x * wFrac * halfW - normal.x * (thickness * 0.5),
        p.y + side.y * wFrac * halfW - normal.y * (thickness * 0.5),
        p.z + side.z * wFrac * halfW - normal.z * (thickness * 0.5)
      );
      uvs.push(u, t);
    }
  }

  for (let i = 0; i < segments; i++) {
    const r0 = i * ptsPerRing;
    const r1 = (i + 1) * ptsPerRing;
    for (let j = 0; j < ptsPerRing; j++) {
      const jNext = (j + 1) % ptsPerRing;
      const a = r0 + j;
      const b = r0 + jNext;
      const c = r1 + jNext;
      const d = r1 + j;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Parametric 2D heart contour helper (used for both sculpted pillow heart & perimeter seam cord) */
function getHeartContourPoint(theta: number, scale: number): { x: number; y: number } {
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

/** Sculpted, organically cushioned 3D pillow heart (replaces flat extruded plastic-looking slabs) */
function createSculptedPillowHeartGeometry(scale = 1): THREE.BufferGeometry {
  const radialSegs = 56;
  const rings = 24; // 0 = front pole, rings = back pole
  const depthScale = 0.24 * scale;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let rIdx = 0; rIdx <= rings; rIdx++) {
    const phi = (rIdx / rings) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    // Smooth plump cushion radial curve with crisp tailored equator
    const r = Math.pow(sinPhi, 0.88);

    for (let aIdx = 0; aIdx <= radialSegs; aIdx++) {
      const u = aIdx / radialSegs;
      const theta = u * Math.PI * 2;
      const pt = getHeartContourPoint(theta, scale);

      const px = pt.x * r;
      const py = pt.y * r;

      // Natural dimple along the upper cleft crease & plump center lobes
      const cleftDimple =
        py > 0.04 * scale
          ? Math.exp(-Math.pow(px / (0.14 * scale), 2)) * 0.24 * r
          : 0;
      const pz = cosPhi * depthScale * (1 - 0.18 * r * r) * (1 - cleftDimple);

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
      indices.push(a, d, c, a, c, b);
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

/** Piped satin/gold cord seam tracing the sculpted heart equator */
function createHeartSeamCordGeometry(scale = 1, tubeRadius = 0.015): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const steps = 48;
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const pt = getHeartContourPoint(theta, scale);
    pts.push(new THREE.Vector3(pt.x, pt.y, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  return new THREE.TubeGeometry(curve, 64, tubeRadius, 8, true);
}

/** Sculpted French Macaron multi-part keepsake confection */
function createMacaronGroup(
  shellMat: THREE.Material,
  fillingMat: THREE.Material,
  disposables: { dispose: () => void }[]
): THREE.Group {
  const group = new THREE.Group();

  // Domed almond-meringue shell profile via LatheGeometry
  const shellPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.24, 0.0),
    new THREE.Vector2(0.255, 0.03),
    new THREE.Vector2(0.23, 0.075),
    new THREE.Vector2(0.15, 0.11),
    new THREE.Vector2(0.0, 0.12),
  ];
  const shellGeo = new THREE.LatheGeometry(shellPts, 32);
  disposables.push(shellGeo);

  // Ruffled crispy "pied" (macaron foot) ring
  const footGeo = new THREE.TorusGeometry(0.236, 0.022, 8, 36);
  const fPos = footGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const z = fPos.getZ(i);
    const y = fPos.getY(i);
    const ang = Math.atan2(z, x);
    const ruffle = 1 + Math.sin(ang * 18) * 0.035 + Math.cos(ang * 11) * 0.02;
    fPos.setXYZ(i, x * ruffle, y, z * ruffle);
  }
  footGeo.computeVertexNormals();
  disposables.push(footGeo);

  const fillingGeo = new THREE.CylinderGeometry(0.228, 0.228, 0.052, 28);
  disposables.push(fillingGeo);

  const bottomShell = new THREE.Mesh(shellGeo, shellMat);
  bottomShell.rotation.x = Math.PI;
  bottomShell.position.y = -0.024;

  const bottomFoot = new THREE.Mesh(footGeo, shellMat);
  bottomFoot.rotation.x = Math.PI / 2;
  bottomFoot.position.y = -0.028;

  const filling = new THREE.Mesh(fillingGeo, fillingMat);

  const topFoot = new THREE.Mesh(footGeo, shellMat);
  topFoot.rotation.x = Math.PI / 2;
  topFoot.position.y = 0.028;

  const topShell = new THREE.Mesh(shellGeo, shellMat);
  topShell.position.y = 0.024;

  group.add(bottomShell, bottomFoot, filling, topFoot, topShell);
  return group;
}

/** Pleated gold paper baking cup + cocoa-dusted sculpted truffle praline */
function createTruffleBonbonGroup(
  cupMat: THREE.Material,
  truffleMat: THREE.Material,
  drizzleMat: THREE.Material,
  disposables: { dispose: () => void }[]
): THREE.Group {
  const group = new THREE.Group();

  // Pleated foil paper cup (22 radial flutes)
  const cupGeo = new THREE.CylinderGeometry(0.2, 0.145, 0.125, 44, 1, true);
  const pos = cupGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ang = Math.atan2(z, x);
    const flute = 1 + Math.sin(ang * 22) * 0.055 * ((y + 0.065) / 0.125);
    pos.setXYZ(i, x * flute, y, z * flute);
  }
  cupGeo.computeVertexNormals();
  disposables.push(cupGeo);

  const cupBaseGeo = new THREE.CircleGeometry(0.145, 24);
  cupBaseGeo.rotateX(-Math.PI / 2);
  disposables.push(cupBaseGeo);

  // Organic hand-rolled chocolate truffle dome
  const truffleGeo = new THREE.SphereGeometry(0.16, 28, 20);
  const tPos = truffleGeo.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const y = tPos.getY(i);
    const z = tPos.getZ(i);
    const lump = 1 + Math.sin(x * 16 + z * 12) * 0.035 + Math.cos(y * 18) * 0.025;
    tPos.setXYZ(i, x * lump, y * 0.88 * lump, z * lump);
  }
  truffleGeo.computeVertexNormals();
  disposables.push(truffleGeo);

  // Piped decorative drizzle across truffle crown
  const drizzlePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = (t - 0.5) * 0.22;
    const z = Math.sin(t * Math.PI * 4.5) * 0.08;
    const r2 = x * x + z * z;
    const y = 0.065 + Math.sqrt(Math.max(0.0001, 0.16 * 0.16 - r2)) * 0.9;
    drizzlePts.push(new THREE.Vector3(x, y, z));
  }
  const drizzleGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(drizzlePts), 32, 0.007, 6, false);
  disposables.push(drizzleGeo);

  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.position.y = 0.06;
  const cupBase = new THREE.Mesh(cupBaseGeo, cupMat);
  const truffle = new THREE.Mesh(truffleGeo, truffleMat);
  truffle.position.y = 0.125;
  const drizzle = new THREE.Mesh(drizzleGeo, drizzleMat);
  drizzle.position.y = 0.06;

  group.add(cup, cupBase, truffle, drizzle);
  return group;
}

function createBotanicalPetalGeometry(scale = 1): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(0.64 * scale, 0.8 * scale, 20, 24);
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

/** Tufted & gathered silk pillow cushion inside box */
function createSilkCushionGeometry(width: number, depth: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, depth, 52, 52);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const tufts = [
    [-0.58, -0.58],
    [0.58, -0.58],
    [-0.58, 0.58],
    [0.58, 0.58],
    [0, 0],
  ];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);

    // Subtle diamond silk tufting dimples + soft cushion crown
    let tuftDip = 0;
    for (let t = 0; t < tufts.length; t++) {
      const dx = x - tufts[t][0];
      const dz = z - tufts[t][1];
      tuftDip += Math.exp(-(dx * dx + dz * dz) / 0.055) * 0.06;
    }

    const gather =
      Math.sin(x * 5.2 + Math.cos(z * 2.8)) * 0.022 +
      Math.cos(z * 4.4 + x * 1.6) * 0.02 +
      Math.max(0, 0.15 - r * 0.055);

    pos.setY(i, gather - tuftDip);
  }
  geo.computeVertexNormals();
  return geo;
}

function createRoundedLidSlab(w: number, d: number, h: number, r = 0.08): THREE.ExtrudeGeometry {
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -d / 2);
  shape.lineTo(hw, -d / 2);
  shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd);
  shape.lineTo(w / 2, hd);
  shape.quadraticCurveTo(w / 2, d / 2, hw, d / 2);
  shape.lineTo(-hw, d / 2);
  shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd);
  shape.lineTo(-w / 2, -hd);
  shape.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.028,
    bevelThickness: 0.025,
  });
  geo.rotateX(Math.PI / 2);
  geo.center();
  return geo;
}

export function GiftBox3DCanvas({
  openProgress,
  mode,
  className = '',
}: GiftBox3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(openProgress.get());
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    progressRef.current = openProgress.get();
    const unsub = openProgress.on('change', (v) => {
      progressRef.current = v;
    });
    return () => unsub();
  }, [openProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const disposables: { dispose: () => void }[] = [];

    const scene = new THREE.Scene();
    const bgHex = mode === 'hero-open' ? 0xfdf2f5 : 0xf9e4eb;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.Fog(bgHex, 12, 26);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60);
    camera.position.set(0, 3.25, 7.35);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    disposables.push(envTarget);
    pmremGenerator.dispose();

    // Luxury Rose-Noir Studio Lighting (Soft warm key + diffused fill so organics don't look plastic)
    const hemiLight = new THREE.HemisphereLight(0xfff6f9, 0xd4b6c3, 1.02);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4ef, 2.05);
    keyLight.position.set(5.4, 8.6, 5.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    const d = 4.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffeef4, 0.85);
    fillLight.position.set(-5.0, 3.8, 4.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd7e5, 1.3);
    rimLight.position.set(-4.2, 4.8, -5.2);
    scene.add(rimLight);

    // Procedural Textures
    const linenTex = createLinenTextures(renderer);
    const innerPaperTex = createInnerPaperTexture(renderer);
    const satinBump = createSatinBumpTexture(renderer);
    const velvetTex = createVelvetTextures(renderer);
    const foilMaps = createCrinkledFoilMaps(renderer);
    const meringueBump = createMeringueBumpTexture();
    const petalTexLight = createPetalTextures(renderer, '#F7D2DF', '#DE8BA7');
    const petalTexDeep = createPetalTextures(renderer, '#F2B8CB', '#9E3B58');
    const contactTex = createContactShadowTexture();
    disposables.push(
      linenTex.map,
      linenTex.bumpMap,
      innerPaperTex,
      satinBump,
      velvetTex.bumpMap,
      velvetTex.roughnessMap,
      foilMaps.normalMap,
      foilMaps.roughnessMap,
      meringueBump,
      petalTexLight.map,
      petalTexLight.bumpMap,
      petalTexDeep.map,
      petalTexDeep.bumpMap,
      contactTex
    );

    // Luxury Light Pink Linen + Inner Cotton Paper Lining Materials
    const linenOuterMat = new THREE.MeshStandardMaterial({
      color: 0xfceaf0,
      map: linenTex.map,
      bumpMap: linenTex.bumpMap,
      bumpScale: 0.018,
      roughness: 0.88,
      metalness: 0.01,
    });
    const linenTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf3d5df,
      map: linenTex.map,
      bumpMap: linenTex.bumpMap,
      bumpScale: 0.014,
      roughness: 0.84,
      metalness: 0.01,
    });
    const innerPaperMat = new THREE.MeshStandardMaterial({
      color: 0xfff8fa,
      map: innerPaperTex,
      roughness: 0.92,
      metalness: 0.0,
    });
    const silkLiningMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c2d2,
      bumpMap: satinBump,
      bumpScale: 0.005,
      roughness: 0.56,
      metalness: 0.0,
      specularIntensity: 0.28,
      sheen: 1.0,
      sheenRoughness: 0.34,
      sheenColor: new THREE.Color(0xfff5f8),
    });

    // Woven Satin Ribbon Materials (anisotropic sheen, zero plastic clearcoat)
    const noirSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b1317,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.42,
      metalness: 0.04,
      specularIntensity: 0.34,
      sheen: 1.0,
      sheenRoughness: 0.26,
      sheenColor: new THREE.Color(0x7d5866),
      anisotropy: 0.88,
      side: THREE.DoubleSide,
    });
    const blushSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2b8cb,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.44,
      metalness: 0.02,
      specularIntensity: 0.32,
      sheen: 1.0,
      sheenRoughness: 0.24,
      sheenColor: new THREE.Color(0xfff5f8),
      anisotropy: 0.85,
      side: THREE.DoubleSide,
    });
    const champagneSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfc28d,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.42,
      metalness: 0.06,
      specularIntensity: 0.38,
      sheen: 1.0,
      sheenRoughness: 0.24,
      sheenColor: new THREE.Color(0xfff6e5),
      anisotropy: 0.9,
      side: THREE.DoubleSide,
    });

    const waxSealMat = new THREE.MeshPhysicalMaterial({
      color: 0x161013,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.28,
      clearcoatRoughness: 0.38,
    });

    // Smooth brushed champagne gold for box lip & seam piping
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd9b675,
      roughness: 0.28,
      metalness: 0.88,
    });

    // Crinkled tangent-normal-mapped confection foils (non-plastic faceted shimmer)
    const goldCrinkleFoilMat = new THREE.MeshStandardMaterial({
      color: 0xd9b36c,
      normalMap: foilMaps.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: foilMaps.roughnessMap,
      roughness: 0.95,
      metalness: 0.92,
      envMapIntensity: 1.15,
    });
    const roseGoldCrinkleFoilMat = new THREE.MeshStandardMaterial({
      color: 0xe6adbd,
      normalMap: foilMaps.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: foilMaps.roughnessMap,
      roughness: 0.95,
      metalness: 0.88,
      envMapIntensity: 1.12,
    });

    // Crushed Velvet Keepsake Hearts (High roughness + zero specular hotspots + grazing sheen)
    const velvetNoirHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1317,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.12,
      sheen: 1.0,
      sheenRoughness: 0.52,
      sheenColor: new THREE.Color(0x7c5563),
    });
    const velvetPlumHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0x8a2946,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.12,
      sheen: 1.0,
      sheenRoughness: 0.52,
      sheenColor: new THREE.Color(0xf4c2d2),
    });
    const velvetBlushHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0b2c5,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.1,
      sheen: 1.0,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(0xfff5f8),
    });

    // Artisanal Confection Materials (Matte Baked Meringue, Ganache, Cocoa Powder Dust)
    const macaronRoseMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2b5c8,
      bumpMap: meringueBump,
      bumpScale: 0.012,
      roughness: 0.82,
      metalness: 0.0,
      specularIntensity: 0.14,
      sheen: 0.25,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(0xfff4f7),
    });
    const macaronNoirMat = new THREE.MeshPhysicalMaterial({
      color: 0x261a1e,
      bumpMap: meringueBump,
      bumpScale: 0.012,
      roughness: 0.8,
      metalness: 0.0,
      specularIntensity: 0.16,
      sheen: 0.22,
      sheenRoughness: 0.75,
      sheenColor: new THREE.Color(0x6e4e5a),
    });
    const ganacheFillingMat = new THREE.MeshStandardMaterial({
      color: 0x45242d,
      roughness: 0.42,
      metalness: 0.02,
    });
    const cocoaTruffleMat = new THREE.MeshPhysicalMaterial({
      color: 0x2d181b,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.018,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 1.0,
      metalness: 0.0,
      specularIntensity: 0.08,
      sheen: 0.35,
      sheenRoughness: 0.85,
      sheenColor: new THREE.Color(0x70484e),
    });

    // Organic Botanical Matte Rose Petals (Zero plastic specular)
    const petalLightMat = new THREE.MeshPhysicalMaterial({
      map: petalTexLight.map,
      bumpMap: petalTexLight.bumpMap,
      bumpScale: 0.015,
      roughness: 0.88,
      metalness: 0.0,
      specularIntensity: 0.08,
      sheen: 0.72,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0xfff7fa),
      side: THREE.DoubleSide,
    });
    const petalDeepMat = new THREE.MeshPhysicalMaterial({
      map: petalTexDeep.map,
      bumpMap: petalTexDeep.bumpMap,
      bumpScale: 0.015,
      roughness: 0.86,
      metalness: 0.0,
      specularIntensity: 0.09,
      sheen: 0.76,
      sheenRoughness: 0.52,
      sheenColor: new THREE.Color(0xf9d5e2),
      side: THREE.DoubleSide,
    });

    disposables.push(
      linenOuterMat,
      linenTrimMat,
      innerPaperMat,
      silkLiningMat,
      noirSatinMat,
      blushSatinMat,
      champagneSatinMat,
      waxSealMat,
      goldTrimMat,
      goldCrinkleFoilMat,
      roseGoldCrinkleFoilMat,
      velvetNoirHeartMat,
      velvetPlumHeartMat,
      velvetBlushHeartMat,
      macaronRoseMat,
      macaronNoirMat,
      ganacheFillingMat,
      cocoaTruffleMat,
      petalLightMat,
      petalDeepMat
    );

    const shadowPlaneGeo = new THREE.PlaneGeometry(7.2, 7.2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.95,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);
    disposables.push(shadowPlaneGeo, shadowPlaneMat);

    const floorGeo = new THREE.PlaneGeometry(44, 44);
    const floorMat = new THREE.MeshStandardMaterial({
      color: bgHex,
      roughness: 0.96,
      metalness: 0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);
    disposables.push(floorGeo, floorMat);

    const giftBoxRoot = new THREE.Group();
    giftBoxRoot.rotation.y = -0.5;
    scene.add(giftBoxRoot);

    const boxW = 2.68;
    const boxD = 2.68;
    const boxH = 1.44;
    const wallT = 0.13;

    // 1. Hollow Blush-Pink Linen Vessel with Cream-Paper Lined Interior
    const vesselGroup = new THREE.Group();
    giftBoxRoot.add(vesselGroup);

    const basePlateGeo = createRoundedLidSlab(boxW, boxD, 0.14, 0.08);
    const basePlate = new THREE.Mesh(basePlateGeo, linenOuterMat);
    basePlate.position.y = 0.08;
    basePlate.castShadow = !isSoftwareGl;
    basePlate.receiveShadow = !isSoftwareGl;
    vesselGroup.add(basePlate);
    disposables.push(basePlateGeo);

    const frontBackWallGeo = new THREE.BoxGeometry(boxW, boxH, wallT);
    const leftRightWallGeo = new THREE.BoxGeometry(wallT, boxH, boxD - wallT * 2);
    disposables.push(frontBackWallGeo, leftRightWallGeo);

    const wallFront = new THREE.Mesh(frontBackWallGeo, linenOuterMat);
    wallFront.position.set(0, boxH / 2, boxD / 2 - wallT / 2);
    wallFront.castShadow = !isSoftwareGl;
    wallFront.receiveShadow = !isSoftwareGl;

    const wallBack = new THREE.Mesh(frontBackWallGeo, linenOuterMat);
    wallBack.position.set(0, boxH / 2, -boxD / 2 + wallT / 2);
    wallBack.castShadow = !isSoftwareGl;
    wallBack.receiveShadow = !isSoftwareGl;

    const wallLeft = new THREE.Mesh(leftRightWallGeo, linenOuterMat);
    wallLeft.position.set(-boxW / 2 + wallT / 2, boxH / 2, 0);
    wallLeft.castShadow = !isSoftwareGl;
    wallLeft.receiveShadow = !isSoftwareGl;

    const wallRight = new THREE.Mesh(leftRightWallGeo, linenOuterMat);
    wallRight.position.set(boxW / 2 - wallT / 2, boxH / 2, 0);
    wallRight.castShadow = !isSoftwareGl;
    wallRight.receiveShadow = !isSoftwareGl;

    vesselGroup.add(wallFront, wallBack, wallLeft, wallRight);

    // Interior Cotton-Rag Lining Panels (with subtle gold border)
    const innerW = boxW - wallT * 2.02;
    const innerD = boxD - wallT * 2.02;
    const innerPanelFBGeo = new THREE.PlaneGeometry(innerW, boxH - 0.16);
    const innerPanelLRGeo = new THREE.PlaneGeometry(innerD, boxH - 0.16);
    disposables.push(innerPanelFBGeo, innerPanelLRGeo);

    const inFront = new THREE.Mesh(innerPanelFBGeo, innerPaperMat);
    inFront.position.set(0, boxH / 2 + 0.04, innerD / 2);
    inFront.rotation.y = Math.PI;
    const inBack = new THREE.Mesh(innerPanelFBGeo, innerPaperMat);
    inBack.position.set(0, boxH / 2 + 0.04, -innerD / 2);
    const inLeft = new THREE.Mesh(innerPanelLRGeo, innerPaperMat);
    inLeft.position.set(-innerW / 2, boxH / 2 + 0.04, 0);
    inLeft.rotation.y = Math.PI / 2;
    const inRight = new THREE.Mesh(innerPanelLRGeo, innerPaperMat);
    inRight.position.set(innerW / 2, boxH / 2 + 0.04, 0);
    inRight.rotation.y = -Math.PI / 2;
    vesselGroup.add(inFront, inBack, inLeft, inRight);

    // Champagne Gold Inner Rim Trim
    const rimFBGeo = new THREE.BoxGeometry(boxW - wallT * 1.6, 0.025, 0.028);
    const rimLRGeo = new THREE.BoxGeometry(0.028, 0.025, boxD - wallT * 1.6);
    const rimF = new THREE.Mesh(rimFBGeo, goldTrimMat);
    rimF.position.set(0, boxH + 0.005, boxD / 2 - wallT);
    const rimB = new THREE.Mesh(rimFBGeo, goldTrimMat);
    rimB.position.set(0, boxH + 0.005, -boxD / 2 + wallT);
    const rimL = new THREE.Mesh(rimLRGeo, goldTrimMat);
    rimL.position.set(-boxW / 2 + wallT, boxH + 0.005, 0);
    const rimR = new THREE.Mesh(rimLRGeo, goldTrimMat);
    rimR.position.set(boxW / 2 - wallT, boxH + 0.005, 0);
    vesselGroup.add(rimF, rimB, rimL, rimR);
    disposables.push(rimFBGeo, rimLRGeo);

    // Tufted & Pleated Rose Silk Cushioning Inside Box
    const silkBedGeo = createSilkCushionGeometry(boxW - wallT * 2.05, boxD - wallT * 2.05);
    const silkBed = new THREE.Mesh(silkBedGeo, silkLiningMat);
    silkBed.position.y = 0.56;
    silkBed.receiveShadow = !isSoftwareGl;
    vesselGroup.add(silkBed);
    disposables.push(silkBedGeo);

    // Nestled Artisanal Macarons & Truffle Bonbons Resting on the Silk Cushion
    const confectionGroup = new THREE.Group();
    vesselGroup.add(confectionGroup);

    const macaronRose = createMacaronGroup(macaronRoseMat, ganacheFillingMat, disposables);
    macaronRose.position.set(-0.66, 0.69, 0.58);
    macaronRose.rotation.set(0.18, 0.4, -0.14);
    confectionGroup.add(macaronRose);

    const macaronNoir = createMacaronGroup(macaronNoirMat, macaronRoseMat, disposables);
    macaronNoir.position.set(0.68, 0.69, -0.54);
    macaronNoir.rotation.set(-0.15, -0.5, 0.16);
    confectionGroup.add(macaronNoir);

    const truffleConfigs = [
      { pos: [0.66, 0.63, 0.6], rotY: 0.4, body: cocoaTruffleMat, drizzle: roseGoldCrinkleFoilMat },
      { pos: [-0.66, 0.63, -0.58], rotY: -0.6, body: cocoaTruffleMat, drizzle: goldTrimMat },
      { pos: [0.02, 0.65, 0.72], rotY: 1.1, body: goldCrinkleFoilMat, drizzle: ganacheFillingMat },
    ];
    truffleConfigs.forEach((cfg) => {
      const truffle = createTruffleBonbonGroup(
        goldCrinkleFoilMat,
        cfg.body,
        cfg.drizzle,
        disposables
      );
      truffle.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      truffle.rotation.y = cfg.rotY;
      confectionGroup.add(truffle);
    });

    // Deep Obsidian Noir Satin Wrap-Around Bands
    const ribbonBandFBGeo = new THREE.BoxGeometry(0.36, boxH + 0.015, boxD + 0.024);
    const ribbonBandLRGeo = new THREE.BoxGeometry(boxW + 0.024, boxH + 0.015, 0.36);
    const ribbonBandFB = new THREE.Mesh(ribbonBandFBGeo, noirSatinMat);
    ribbonBandFB.position.y = boxH / 2;
    const ribbonBandLR = new THREE.Mesh(ribbonBandLRGeo, noirSatinMat);
    ribbonBandLR.position.y = boxH / 2;
    vesselGroup.add(ribbonBandFB, ribbonBandLR);
    disposables.push(ribbonBandFBGeo, ribbonBandLRGeo);

    // Obsidian Noir & Champagne Gold Front Wax Seal Medallion
    const sealDiscGeo = new THREE.CylinderGeometry(0.21, 0.23, 0.045, 28);
    const sealRingGeo = new THREE.TorusGeometry(0.15, 0.018, 10, 28);
    const sealDisc = new THREE.Mesh(sealDiscGeo, waxSealMat);
    sealDisc.rotation.x = Math.PI / 2;
    sealDisc.position.set(0, boxH * 0.52, boxD / 2 + 0.02);
    const sealRing = new THREE.Mesh(sealRingGeo, goldTrimMat);
    sealRing.position.set(0, boxH * 0.52, boxD / 2 + 0.044);
    vesselGroup.add(sealDisc, sealRing);
    disposables.push(sealDiscGeo, sealRingGeo);

    // 2. Hinged Cushioned Blush Lid + Noir & Rose Satin Bow
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, boxH, -boxD / 2);
    giftBoxRoot.add(lidPivot);

    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0, boxD / 2);
    lidPivot.add(lidGroup);

    const lidW = boxW + 0.16;
    const lidD = boxD + 0.16;

    const lidTopGeo = createRoundedLidSlab(lidW, lidD, 0.11, 0.1);
    const lidTop = new THREE.Mesh(lidTopGeo, linenOuterMat);
    lidTop.position.y = 0.12;
    lidTop.castShadow = !isSoftwareGl;
    lidTop.receiveShadow = !isSoftwareGl;
    lidGroup.add(lidTop);
    disposables.push(lidTopGeo);

    const lidSkirtFBGeo = new THREE.BoxGeometry(lidW, 0.24, 0.07);
    const lidSkirtLRGeo = new THREE.BoxGeometry(0.07, 0.24, lidD - 0.14);
    disposables.push(lidSkirtFBGeo, lidSkirtLRGeo);

    const skirtF = new THREE.Mesh(lidSkirtFBGeo, linenTrimMat);
    skirtF.position.set(0, -0.02, lidD / 2 - 0.035);
    const skirtB = new THREE.Mesh(lidSkirtFBGeo, linenTrimMat);
    skirtB.position.set(0, -0.02, -lidD / 2 + 0.035);
    const skirtL = new THREE.Mesh(lidSkirtLRGeo, linenTrimMat);
    skirtL.position.set(-lidW / 2 + 0.035, -0.02, 0);
    const skirtR = new THREE.Mesh(lidSkirtLRGeo, linenTrimMat);
    skirtR.position.set(lidW / 2 - 0.035, -0.02, 0);
    lidGroup.add(skirtF, skirtB, skirtL, skirtR);

    const lidRibbonA = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.16, lidD + 0.025),
      noirSatinMat
    );
    lidRibbonA.position.y = 0.115;
    const lidRibbonB = new THREE.Mesh(
      new THREE.BoxGeometry(lidW + 0.025, 0.16, 0.36),
      noirSatinMat
    );
    lidRibbonB.position.y = 0.115;
    lidGroup.add(lidRibbonA, lidRibbonB);
    disposables.push(lidRibbonA.geometry, lidRibbonB.geometry);

    // Wide Woven Satin Bow (Obsidian Noir & Blush Quartz)
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 0.2, 0);
    lidGroup.add(bowGroup);

    const bowEarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0.32, 0.24, 0.04),
      new THREE.Vector3(0.74, 0.26, 0.02),
      new THREE.Vector3(0.84, 0.11, -0.02),
      new THREE.Vector3(0.42, 0.01, -0.04),
      new THREE.Vector3(0, 0.01, 0),
    ]);
    const bowEarGeo = createSatinRibbonStripGeometry(
      bowEarCurve,
      44,
      (t) => 0.12 + 0.3 * Math.sin(t * Math.PI),
      0.014,
      0.22
    );
    disposables.push(bowEarGeo);

    const earAngles = [0.22, Math.PI + 0.22, Math.PI / 2 + 0.38, -Math.PI / 2 + 0.38];
    earAngles.forEach((ang, idx) => {
      const ear = new THREE.Mesh(bowEarGeo, idx < 2 ? noirSatinMat : blushSatinMat);
      ear.rotation.y = ang;
      ear.castShadow = !isSoftwareGl;
      bowGroup.add(ear);
    });

    const tailCurveA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.03, 0.05),
      new THREE.Vector3(0.45, 0.05, 0.42),
      new THREE.Vector3(0.88, 0.02, 0.96),
      new THREE.Vector3(1.18, 0.005, 1.32),
    ]);
    const tailGeoA = createSatinRibbonStripGeometry(
      tailCurveA,
      30,
      (t) => 0.18 + 0.14 * t,
      0.012,
      0.28
    );
    const tailA = new THREE.Mesh(tailGeoA, noirSatinMat);
    tailA.castShadow = !isSoftwareGl;

    const tailCurveB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.03, 0.05),
      new THREE.Vector3(-0.48, 0.05, 0.46),
      new THREE.Vector3(-0.92, 0.02, 0.94),
      new THREE.Vector3(-1.2, 0.005, 1.24),
    ]);
    const tailGeoB = createSatinRibbonStripGeometry(
      tailCurveB,
      30,
      (t) => 0.18 + 0.14 * t,
      0.012,
      -0.32
    );
    const tailB = new THREE.Mesh(tailGeoB, blushSatinMat);
    tailB.castShadow = !isSoftwareGl;
    bowGroup.add(tailA, tailB);
    disposables.push(tailGeoA, tailGeoB);

    const knotCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.0, 0),
      new THREE.Vector3(-0.09, 0.08, 0),
      new THREE.Vector3(0, 0.12, 0),
      new THREE.Vector3(0.09, 0.08, 0),
      new THREE.Vector3(0.08, 0.0, 0),
    ]);
    const knotGeo = createSatinRibbonStripGeometry(knotCurve, 18, () => 0.24, 0.018);
    const knotWrap = new THREE.Mesh(knotGeo, noirSatinMat);
    bowGroup.add(knotWrap);
    disposables.push(knotGeo);

    // 3. Sculpted 3D Pillowed Velvet & Crinkled-Foil Keepsake Hearts + Satin Coils + Veined Rose Petals
    const pillowHeartGeo = createSculptedPillowHeartGeometry(0.76);
    const heartSeamGeo = createHeartSeamCordGeometry(0.76, 0.016);
    const petalGeo = createBotanicalPetalGeometry(0.95);

    const makeCoilCurve = (turns: number, rad: number, h: number) => {
      const pts: THREE.Vector3[] = [];
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = t * Math.PI * 2 * turns;
        const r = rad * (0.55 + 0.45 * Math.sin(t * Math.PI));
        pts.push(new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * h, Math.sin(a) * r));
      }
      return new THREE.CatmullRomCurve3(pts);
    };

    const coilGeoA = createSatinRibbonStripGeometry(
      makeCoilCurve(2.2, 0.26, 0.95),
      64,
      (t) => 0.17 * (0.65 + 0.35 * Math.sin(t * Math.PI)),
      0.011,
      Math.PI * 1.4
    );
    const coilGeoB = createSatinRibbonStripGeometry(
      makeCoilCurve(1.85, 0.22, 0.8),
      56,
      (t) => 0.15 * (0.65 + 0.35 * Math.sin(t * Math.PI)),
      0.011,
      -Math.PI * 1.1
    );
    disposables.push(pillowHeartGeo, heartSeamGeo, petalGeo, coilGeoA, coilGeoB);

    const burstPieces: BurstPiece[] = [];

    const heartConfigs = [
      {
        mat: velvetNoirHeartMat,
        seamMat: goldTrimMat,
        scale: 1.0,
        rest: [0, 0.82, 0],
        burst: [0, 2.28, 0.32],
        rot: [0.1, 0.2, 0.05],
      },
      {
        mat: goldCrinkleFoilMat,
        seamMat: noirSatinMat,
        scale: 0.78,
        rest: [-0.52, 0.76, 0.25],
        burst: [-1.85, 1.92, 0.82],
        rot: [-0.2, -0.5, 0.3],
      },
      {
        mat: velvetBlushHeartMat,
        seamMat: noirSatinMat,
        scale: 0.84,
        rest: [0.54, 0.78, -0.18],
        burst: [1.92, 2.08, 0.68],
        rot: [0.25, 0.6, -0.25],
      },
      {
        mat: roseGoldCrinkleFoilMat,
        seamMat: goldTrimMat,
        scale: 0.68,
        rest: [-0.32, 0.74, -0.42],
        burst: [-1.15, 2.7, -0.55],
        rot: [-0.3, 0.3, -0.2],
      },
      {
        mat: velvetPlumHeartMat,
        seamMat: goldTrimMat,
        scale: 0.72,
        rest: [0.32, 0.75, 0.42],
        burst: [1.12, 2.58, 1.08],
        rot: [0.15, -0.4, 0.22],
      },
    ];

    heartConfigs.forEach((cfg, idx) => {
      const heartGroup = new THREE.Group();
      const bodyMesh = new THREE.Mesh(pillowHeartGeo, cfg.mat);
      bodyMesh.castShadow = !isSoftwareGl;
      bodyMesh.receiveShadow = !isSoftwareGl;
      const seamMesh = new THREE.Mesh(heartSeamGeo, cfg.seamMat);
      heartGroup.add(bodyMesh, seamMesh);
      heartGroup.scale.setScalar(cfg.scale);
      giftBoxRoot.add(heartGroup);

      burstPieces.push({
        mesh: heartGroup,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(0, idx * 0.6, 0),
        burstRot: new THREE.Euler(cfg.rot[0], cfg.rot[1] + idx * 0.8, cfg.rot[2]),
        phaseOffset: idx * 1.1,
        floatAmp: 0.07,
      });
    });

    const coilConfigs = [
      { geo: coilGeoA, mat: noirSatinMat, rest: [-0.58, 0.78, -0.14], burst: [-2.22, 1.68, 0.34] },
      { geo: coilGeoB, mat: blushSatinMat, rest: [0.58, 0.78, 0.14], burst: [2.25, 1.84, 0.38] },
      { geo: coilGeoB, mat: champagneSatinMat, rest: [0.06, 0.76, -0.52], burst: [0.32, 2.42, -1.02] },
      { geo: coilGeoA, mat: noirSatinMat, rest: [-0.14, 0.76, 0.5], burst: [-0.5, 1.82, 1.38] },
    ];

    coilConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(cfg.geo, cfg.mat);
      mesh.castShadow = !isSoftwareGl;
      giftBoxRoot.add(mesh);
      burstPieces.push({
        mesh,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(Math.PI / 2, idx * 0.7, 0),
        burstRot: new THREE.Euler(0.4 + idx * 0.3, idx * 1.4, 0.6),
        phaseOffset: idx * 1.4 + 0.5,
        floatAmp: 0.08,
      });
    });

    const petalConfigs = [
      { mat: petalLightMat, rest: [-0.45, 0.76, 0.42], burst: [-2.42, 2.28, 0.86] },
      { mat: petalDeepMat, rest: [0.46, 0.76, -0.4], burst: [2.46, 2.34, -0.48] },
      { mat: petalLightMat, rest: [0.22, 0.78, 0.12], burst: [1.28, 2.86, 0.46] },
      { mat: petalDeepMat, rest: [-0.2, 0.78, -0.22], burst: [-1.36, 2.8, -0.38] },
      { mat: petalLightMat, rest: [0.65, 0.74, 0.35], burst: [2.68, 1.48, 1.05] },
      { mat: petalDeepMat, rest: [-0.65, 0.74, -0.35], burst: [-2.64, 1.54, -0.76] },
      { mat: petalLightMat, rest: [0, 0.75, 0.6], burst: [0.1, 2.05, 1.55] },
      { mat: petalDeepMat, rest: [0.1, 0.75, -0.6], burst: [-0.22, 2.14, -1.28] },
    ];

    petalConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(petalGeo, cfg.mat);
      mesh.scale.setScalar(0.88 + (idx % 3) * 0.12);
      giftBoxRoot.add(mesh);
      burstPieces.push({
        mesh,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(Math.PI / 2.2, idx * 0.8, 0.2),
        burstRot: new THREE.Euler(0.6 + idx * 0.35, idx * 1.1, -0.5 + idx * 0.25),
        phaseOffset: idx * 0.75,
        floatAmp: 0.095,
      });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTargetX = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointerTargetY = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    let smoothOpen = progressRef.current;
    const clock = new THREE.Clock();

    function updateScene(delta: number, elapsed: number) {
      const targetOpen = THREE.MathUtils.clamp(progressRef.current, 0, 1);
      smoothOpen = THREE.MathUtils.damp(smoothOpen, targetOpen, 15.0, delta);

      giftBoxRoot.rotation.y = -0.5 + smoothOpen * 0.48 + pointerX * 0.16;

      pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, 5.0, delta);
      pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, 5.0, delta);
      camera.position.x = pointerX * 0.42;
      camera.position.y = 3.25 - pointerY * 0.24 + smoothOpen * 0.38;
      camera.lookAt(0, 1.0 + smoothOpen * 0.32, 0);

      // Instant, crisp lid opening & interior lift
      const lidPhase = THREE.MathUtils.smoothstep(smoothOpen, 0.0, 0.48);
      lidPivot.rotation.x = -lidPhase * 1.44;
      lidPivot.position.y = boxH + lidPhase * 0.24;
      lidPivot.position.z = -boxD / 2 - lidPhase * 0.16;

      bowGroup.scale.setScalar(1 - lidPhase * 0.12);

      // Gentle upward presentation lift for nestled confections inside box
      confectionGroup.position.y = lidPhase * 0.16;

      const burstPhase = THREE.MathUtils.smoothstep(smoothOpen, 0.08, 0.88);
      for (let i = 0; i < burstPieces.length; i++) {
        const item = burstPieces[i];
        _targetPos.copy(item.restPos).add(item.burstOffset);
        _vec3.copy(item.restPos).lerp(_targetPos, burstPhase);
        const floatY =
          burstPhase > 0.05
            ? Math.sin(elapsed * 1.5 + item.phaseOffset) * item.floatAmp * burstPhase
            : 0;
        item.mesh.position.set(_vec3.x, _vec3.y + floatY, _vec3.z);

        item.mesh.rotation.x = THREE.MathUtils.lerp(
          item.restRot.x,
          item.burstRot.x + Math.sin(elapsed * 0.85 + item.phaseOffset) * 0.1 * burstPhase,
          burstPhase
        );
        item.mesh.rotation.y = THREE.MathUtils.lerp(
          item.restRot.y,
          item.burstRot.y + elapsed * 0.32 * burstPhase,
          burstPhase
        );
        item.mesh.rotation.z = THREE.MathUtils.lerp(item.restRot.z, item.burstRot.z, burstPhase);
      }
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      updateScene(delta, elapsed);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      disposables.forEach((dItem) => dItem.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  if (contextLost) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-[#FDF2F5] text-center p-8 ${className}`}
      >
        <p className="font-serif-editorial text-2xl text-[#161013]">
          3D Atelier Box resting — reload to restore WebGL view.
        </p>
      </div>
    );
  }

  return <div ref={mountRef} className={`w-full h-full ${className}`} />;
}
