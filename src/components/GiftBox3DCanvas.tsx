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
    aCtx.fillStyle = '#EBBCCB';
    aCtx.fillRect(0, 0, 512, 512);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 512; i += 3) {
      const shade = i % 6 === 0 ? 'rgba(182, 118, 140, 0.22)' : 'rgba(255, 244, 248, 0.22)';
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
    ctx.fillStyle = '#FAE7EE';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 650; i++) {
      const x = (((Math.sin(i * 19.31) * 43758.54) % 1) + 1) % 1 * 256;
      const y = (((Math.sin(i * 73.17) * 43758.54) % 1) + 1) % 1 * 256;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(182, 118, 140, 0.14)' : 'rgba(255, 250, 252, 0.25)';
      ctx.fillRect(x, y, 2, 1);
    }
    ctx.strokeStyle = 'rgba(148, 86, 108, 0.35)';
    ctx.lineWidth = 2;
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

/** Organic micro-pile crushed velvet bump + roughness textures */
function createVelvetTextures(renderer: THREE.WebGLRenderer) {
  const size = 256;
  const bumpData = new Uint8Array(size * size * 4);
  const roughData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const hash = (((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1) + 1) % 1;
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

      const roughVal = Math.round(215 + swirl * 22 + hash * 14);
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

/** Hand-crimped rose-metallic foil normal & roughness maps */
function createCrinkledFoilMaps(renderer: THREE.WebGLRenderer) {
  const size = 256;
  const height = new Float32Array(size * size);

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
      const tilt = ((x - seed.x) * seed.nx + (y - seed.y) * seed.ny) * 0.04;
      const micro = Math.sin(x * 0.45 + y * 0.3) * 0.1;
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

      const dX = (height[y * size + xp] - height[y * size + xm]) * 1.6;
      const dY = (height[yp * size + x] - height[ym * size + x]) * 1.6;
      const len = Math.sqrt(dX * dX + dY * dY + 1);

      const idx = (y * size + x) * 4;
      normalData[idx] = Math.round(((-dX / len) * 0.5 + 0.5) * 255);
      normalData[idx + 1] = Math.round(((-dY / len) * 0.5 + 0.5) * 255);
      normalData[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      normalData[idx + 3] = 255;

      const rVal = Math.round(72 + Math.min(90, Math.abs(dX + dY) * 90));
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
    grad.addColorStop(0, '#FDF1F5');
    grad.addColorStop(0.28, baseHex);
    grad.addColorStop(0.84, tipHex);
    grad.addColorStop(1, tipHex);
    aCtx.fillStyle = grad;
    aCtx.fillRect(0, 0, 256, 256);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 256, 256);

    for (let i = -7; i <= 7; i++) {
      aCtx.strokeStyle =
        Math.abs(i) <= 2 ? 'rgba(130, 56, 82, 0.14)' : 'rgba(148, 72, 98, 0.08)';
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

    for (let p = 0; p < 550; p++) {
      const px = (((Math.sin(p * 17.3) * 43758.54) % 1) + 1) % 1 * 256;
      const py = (((Math.sin(p * 63.7) * 43758.54) % 1) + 1) % 1 * 256;
      aCtx.fillStyle = p % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(130,56,82,0.05)';
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
    grad.addColorStop(0, 'rgba(28, 18, 23, 0.34)');
    grad.addColorStop(0.55, 'rgba(74, 43, 54, 0.14)');
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

/**
 * Watertight convex 3D pillow heart with verified outward-facing winding (a, b, c, a, c, d)
 * so normals face strictly outward across front, equator, and back.
 */
function createSculptedPillowHeartGeometry(scale = 1): THREE.BufferGeometry {
  const radialSegs = 56;
  const rings = 24;
  const depthScale = 0.24 * scale;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let rIdx = 0; rIdx <= rings; rIdx++) {
    const phi = (rIdx / rings) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const r = Math.pow(sinPhi, 0.88);

    for (let aIdx = 0; aIdx <= radialSegs; aIdx++) {
      const u = aIdx / radialSegs;
      const theta = u * Math.PI * 2;
      const pt = getHeartContourPoint(theta, scale);

      const px = pt.x * r;
      const py = pt.y * r;

      const cleftDimple =
        py > 0.04 * scale
          ? Math.exp(-Math.pow(px / (0.14 * scale), 2)) * 0.22 * r
          : 0;
      const pz = cosPhi * depthScale * (1 - 0.16 * r * r) * (1 - cleftDimple);

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
      // Outward CCW winding when viewed from outside (+Z front, equator, -Z back)
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

/** Sculpted French Macaron multi-part keepsake confection */
function createMacaronGroup(
  shellMat: THREE.Material,
  fillingMat: THREE.Material,
  disposables: { dispose: () => void }[]
): THREE.Group {
  const group = new THREE.Group();

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

/** Pleated paper baking cup + cocoa-dusted sculpted truffle praline */
function createTruffleBonbonGroup(
  cupMat: THREE.Material,
  truffleMat: THREE.Material,
  drizzleMat: THREE.Material,
  disposables: { dispose: () => void }[]
): THREE.Group {
  const group = new THREE.Group();

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
    renderer.toneMappingExposure = 1.02;
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

    // Soft Blush-Noir Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff6f9, 0xd4b6c3, 1.02);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5f2, 2.0);
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

    const rimLight = new THREE.DirectionalLight(0xffd7e5, 1.25);
    rimLight.position.set(-4.2, 4.8, -5.2);
    scene.add(rimLight);

    // Procedural Textures
    const linenTex = createLinenTextures(renderer);
    const innerPaperTex = createInnerPaperTexture(renderer);
    const satinBump = createSatinBumpTexture(renderer);
    const velvetTex = createVelvetTextures(renderer);
    const foilMaps = createCrinkledFoilMaps(renderer);
    const meringueBump = createMeringueBumpTexture();
    const petalTexLight = createPetalTextures(renderer, '#F4C8D7', '#DC8FA8');
    const petalTexDeep = createPetalTextures(renderer, '#EBB5C7', '#B35371');
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

    // Unified Cohesive Luxury Blush-Pink + Espresso-Noir Materials (no jarring color soup)
    const linenOuterMat = new THREE.MeshStandardMaterial({
      color: 0xf1cad7,
      map: linenTex.map,
      bumpMap: linenTex.bumpMap,
      bumpScale: 0.018,
      roughness: 0.88,
      metalness: 0.01,
    });
    const linenTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe4b1c3,
      map: linenTex.map,
      bumpMap: linenTex.bumpMap,
      bumpScale: 0.014,
      roughness: 0.84,
      metalness: 0.01,
    });
    const innerPaperMat = new THREE.MeshStandardMaterial({
      color: 0xfbeaf0,
      map: innerPaperTex,
      roughness: 0.92,
      metalness: 0.0,
    });
    const silkLiningMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0bccd,
      bumpMap: satinBump,
      bumpScale: 0.005,
      roughness: 0.56,
      metalness: 0.0,
      specularIntensity: 0.25,
      sheen: 1.0,
      sheenRoughness: 0.34,
      sheenColor: new THREE.Color(0xfff5f8),
    });

    // Deep Espresso-Noir & Blush Satin Ribbon Materials
    const noirSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1217,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.44,
      metalness: 0.03,
      specularIntensity: 0.32,
      sheen: 1.0,
      sheenRoughness: 0.28,
      sheenColor: new THREE.Color(0x6e4a58),
      anisotropy: 0.88,
      side: THREE.DoubleSide,
    });
    const blushSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0xebb9ca,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.46,
      metalness: 0.02,
      specularIntensity: 0.28,
      sheen: 1.0,
      sheenRoughness: 0.26,
      sheenColor: new THREE.Color(0xfff5f8),
      anisotropy: 0.85,
      side: THREE.DoubleSide,
    });
    const dustyRoseSatinMat = new THREE.MeshPhysicalMaterial({
      color: 0x9c4561,
      bumpMap: satinBump,
      bumpScale: 0.01,
      roughness: 0.45,
      metalness: 0.03,
      specularIntensity: 0.3,
      sheen: 1.0,
      sheenRoughness: 0.26,
      sheenColor: new THREE.Color(0xf4c2d2),
      anisotropy: 0.85,
      side: THREE.DoubleSide,
    });

    const waxSealMat = new THREE.MeshPhysicalMaterial({
      color: 0x181014,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.26,
      clearcoatRoughness: 0.38,
    });

    // Muted Rose-Champagne metallic (soft rose-bronze harmony instead of garish yellow gold)
    const roseTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a6a8,
      roughness: 0.34,
      metalness: 0.78,
    });

    // Crinkled tangent-normal-mapped Rose-Pearl Foil
    const rosePearlCrinkleFoilMat = new THREE.MeshStandardMaterial({
      color: 0xebc2cf,
      normalMap: foilMaps.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: foilMaps.roughnessMap,
      roughness: 0.92,
      metalness: 0.84,
      envMapIntensity: 1.05,
    });
    const darkRoseBronzeFoilMat = new THREE.MeshStandardMaterial({
      color: 0xc2939c,
      normalMap: foilMaps.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: foilMaps.roughnessMap,
      roughness: 0.92,
      metalness: 0.86,
      envMapIntensity: 1.08,
    });

    // Crushed Velvet Keepsake Hearts (Unified Espresso Noir, Deep Rose Plum, & Soft Blush)
    const velvetNoirHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1318,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.1,
      sheen: 1.0,
      sheenRoughness: 0.54,
      sheenColor: new THREE.Color(0x75505e),
    });
    const velvetPlumHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3149,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.1,
      sheen: 1.0,
      sheenRoughness: 0.52,
      sheenColor: new THREE.Color(0xf4c2d2),
    });
    const velvetBlushHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0xebb7c8,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.014,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 0.96,
      metalness: 0.0,
      specularIntensity: 0.09,
      sheen: 1.0,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(0xfff5f8),
    });

    // Artisanal Confection Materials (Rose Macarons & Espresso Truffles)
    const macaronRoseMat = new THREE.MeshPhysicalMaterial({
      color: 0xefb8ca,
      bumpMap: meringueBump,
      bumpScale: 0.012,
      roughness: 0.84,
      metalness: 0.0,
      specularIntensity: 0.12,
      sheen: 0.25,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(0xfff4f7),
    });
    const macaronNoirMat = new THREE.MeshPhysicalMaterial({
      color: 0x26191e,
      bumpMap: meringueBump,
      bumpScale: 0.012,
      roughness: 0.82,
      metalness: 0.0,
      specularIntensity: 0.14,
      sheen: 0.22,
      sheenRoughness: 0.75,
      sheenColor: new THREE.Color(0x6e4e5a),
    });
    const ganacheFillingMat = new THREE.MeshStandardMaterial({
      color: 0x3b1f28,
      roughness: 0.45,
      metalness: 0.02,
    });
    const cocoaTruffleMat = new THREE.MeshPhysicalMaterial({
      color: 0x2b181d,
      bumpMap: velvetTex.bumpMap,
      bumpScale: 0.018,
      roughnessMap: velvetTex.roughnessMap,
      roughness: 1.0,
      metalness: 0.0,
      specularIntensity: 0.08,
      sheen: 0.32,
      sheenRoughness: 0.85,
      sheenColor: new THREE.Color(0x70484e),
    });

    // Organic Botanical Matte Rose Petals
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
      dustyRoseSatinMat,
      waxSealMat,
      roseTrimMat,
      rosePearlCrinkleFoilMat,
      darkRoseBronzeFoilMat,
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

    // 1. Hollow Blush-Pink Linen Vessel with Lined Interior (zero obstructing inner ribbon blocks!)
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

    // Interior Cotton-Rag Lining Panels
    const innerW = boxW - wallT * 2.02;
    const innerD = boxD - wallT * 2.02;
    const innerPanelFBGeo = new THREE.PlaneGeometry(innerW, boxH - 0.14);
    const innerPanelLRGeo = new THREE.PlaneGeometry(innerD, boxH - 0.14);
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

    // Subtle Muted Blush-Rose Inner Rim Trim (flush on top wall edge, never floating)
    const rimFBGeo = new THREE.BoxGeometry(boxW - wallT * 0.4, 0.018, 0.04);
    const rimLRGeo = new THREE.BoxGeometry(0.04, 0.018, boxD - wallT * 0.4);
    const rimF = new THREE.Mesh(rimFBGeo, linenTrimMat);
    rimF.position.set(0, boxH + 0.004, boxD / 2 - wallT * 0.5);
    const rimB = new THREE.Mesh(rimFBGeo, linenTrimMat);
    rimB.position.set(0, boxH + 0.004, -boxD / 2 + wallT * 0.5);
    const rimL = new THREE.Mesh(rimLRGeo, linenTrimMat);
    rimL.position.set(-boxW / 2 + wallT * 0.5, boxH + 0.004, 0);
    const rimR = new THREE.Mesh(rimLRGeo, linenTrimMat);
    rimR.position.set(boxW / 2 - wallT * 0.5, boxH + 0.004, 0);
    vesselGroup.add(rimF, rimB, rimL, rimR);
    disposables.push(rimFBGeo, rimLRGeo);

    // Tufted & Pleated Rose Silk Cushioning Inside Box
    const silkBedGeo = createSilkCushionGeometry(boxW - wallT * 2.05, boxD - wallT * 2.05);
    const silkBed = new THREE.Mesh(silkBedGeo, silkLiningMat);
    silkBed.position.y = 0.62;
    silkBed.receiveShadow = !isSoftwareGl;
    vesselGroup.add(silkBed);
    disposables.push(silkBedGeo);

    // Nestled Artisanal Macarons & Truffle Bonbons Resting on the Silk Cushion
    const confectionGroup = new THREE.Group();
    vesselGroup.add(confectionGroup);

    const macaronRose = createMacaronGroup(macaronRoseMat, ganacheFillingMat, disposables);
    macaronRose.position.set(-0.64, 0.76, 0.56);
    macaronRose.rotation.set(0.16, 0.35, -0.12);
    confectionGroup.add(macaronRose);

    const macaronNoir = createMacaronGroup(macaronNoirMat, macaronRoseMat, disposables);
    macaronNoir.position.set(0.66, 0.76, -0.52);
    macaronNoir.rotation.set(-0.14, -0.45, 0.14);
    confectionGroup.add(macaronNoir);

    const truffleConfigs = [
      { pos: [0.64, 0.7, 0.58], rotY: 0.3, body: cocoaTruffleMat, drizzle: rosePearlCrinkleFoilMat },
      { pos: [-0.64, 0.7, -0.56], rotY: -0.5, body: cocoaTruffleMat, drizzle: roseTrimMat },
      { pos: [0.02, 0.72, 0.68], rotY: 0.9, body: rosePearlCrinkleFoilMat, drizzle: ganacheFillingMat },
    ];
    truffleConfigs.forEach((cfg) => {
      const truffle = createTruffleBonbonGroup(
        noirSatinMat,
        cfg.body,
        cfg.drizzle,
        disposables
      );
      truffle.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      truffle.rotation.y = cfg.rotY;
      confectionGroup.add(truffle);
    });

    // Exterior-Only Espresso-Noir Satin Wrap Bands (4 thin outer strips, leaving inside clear!)
    const outerBandThin = 0.022;
    const outerBandFBGeo = new THREE.BoxGeometry(0.36, boxH - 0.02, outerBandThin);
    const outerBandLRGeo = new THREE.BoxGeometry(outerBandThin, boxH - 0.02, 0.36);
    const bandFront = new THREE.Mesh(outerBandFBGeo, noirSatinMat);
    bandFront.position.set(0, boxH / 2, boxD / 2 + outerBandThin * 0.45);
    const bandBack = new THREE.Mesh(outerBandFBGeo, noirSatinMat);
    bandBack.position.set(0, boxH / 2, -boxD / 2 - outerBandThin * 0.45);
    const bandLeft = new THREE.Mesh(outerBandLRGeo, noirSatinMat);
    bandLeft.position.set(-boxW / 2 - outerBandThin * 0.45, boxH / 2, 0);
    const bandRight = new THREE.Mesh(outerBandLRGeo, noirSatinMat);
    bandRight.position.set(boxW / 2 + outerBandThin * 0.45, boxH / 2, 0);
    vesselGroup.add(bandFront, bandBack, bandLeft, bandRight);
    disposables.push(outerBandFBGeo, outerBandLRGeo);

    // Obsidian Noir & Rose-Champagne Front Wax Seal Medallion
    const sealDiscGeo = new THREE.CylinderGeometry(0.21, 0.23, 0.045, 28);
    const sealRingGeo = new THREE.TorusGeometry(0.15, 0.016, 10, 28);
    const sealDisc = new THREE.Mesh(sealDiscGeo, waxSealMat);
    sealDisc.rotation.x = Math.PI / 2;
    sealDisc.position.set(0, boxH * 0.52, boxD / 2 + 0.028);
    const sealRing = new THREE.Mesh(sealRingGeo, roseTrimMat);
    sealRing.position.set(0, boxH * 0.52, boxD / 2 + 0.052);
    vesselGroup.add(sealDisc, sealRing);
    disposables.push(sealDiscGeo, sealRingGeo);

    // 2. Hinged Cushioned Blush Lid + Noir & Blush Satin Bow
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

    const ribbonStrapCurveA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.144, lidD / 2 + 0.01),
      new THREE.Vector3(0, 0.075, lidD / 2 + 0.01),
      new THREE.Vector3(0, 0.162, lidD / 2 - 0.03),
      new THREE.Vector3(0, 0.186, lidD / 4),
      new THREE.Vector3(0, 0.19, 0),
      new THREE.Vector3(0, 0.186, -lidD / 4),
      new THREE.Vector3(0, 0.162, -lidD / 2 + 0.03),
      new THREE.Vector3(0, 0.075, -lidD / 2 - 0.01),
      new THREE.Vector3(0, -0.144, -lidD / 2 - 0.01),
    ]);
    const lidRibbonAGeo = createSatinRibbonStripGeometry(
      ribbonStrapCurveA,
      56,
      () => 0.34,
      0.016,
      0
    );
    const lidRibbonA = new THREE.Mesh(lidRibbonAGeo, noirSatinMat);
    lidRibbonA.castShadow = !isSoftwareGl;

    const ribbonStrapCurveB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-lidW / 2 - 0.01, -0.144, 0),
      new THREE.Vector3(-lidW / 2 - 0.01, 0.075, 0),
      new THREE.Vector3(-lidW / 2 + 0.03, 0.162, 0),
      new THREE.Vector3(-lidW / 4, 0.187, 0),
      new THREE.Vector3(0, 0.193, 0),
      new THREE.Vector3(lidW / 4, 0.187, 0),
      new THREE.Vector3(lidW / 2 - 0.03, 0.162, 0),
      new THREE.Vector3(lidW / 2 + 0.01, 0.075, 0),
      new THREE.Vector3(lidW / 2 + 0.01, -0.144, 0),
    ]);
    const lidRibbonBGeo = createSatinRibbonStripGeometry(
      ribbonStrapCurveB,
      56,
      () => 0.34,
      0.016,
      0
    );
    const lidRibbonB = new THREE.Mesh(lidRibbonBGeo, noirSatinMat);
    lidRibbonB.castShadow = !isSoftwareGl;
    lidGroup.add(lidRibbonA, lidRibbonB);
    disposables.push(lidRibbonAGeo, lidRibbonBGeo);

    // Wide Woven Satin Bow (Obsidian Noir & Soft Blush)
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

    // 3. Sculpted 3D Pillowed Velvet & Rose-Foil Hearts + Satin Coils + Veined Rose Petals (Poised, Calm Motion)
    const pillowHeartGeo = createSculptedPillowHeartGeometry(0.76);
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
    disposables.push(pillowHeartGeo, petalGeo, coilGeoA, coilGeoB);

    const burstPieces: BurstPiece[] = [];

    // Poised, subtle orientations (kept facing viewer cleanly, no wild tumbling)
    const heartConfigs = [
      {
        mat: velvetNoirHeartMat,
        scale: 0.95,
        rest: [0, 0.86, 0],
        burst: [0, 2.05, 0.28],
        restRot: [0, 0.35, 0],
        burstRot: [0.08, 0.42, 0.04],
      },
      {
        mat: rosePearlCrinkleFoilMat,
        scale: 0.78,
        rest: [-0.5, 0.8, 0.22],
        burst: [-1.72, 1.75, 0.7],
        restRot: [0, 0.2, 0.08],
        burstRot: [-0.08, 0.28, 0.14],
      },
      {
        mat: velvetBlushHeartMat,
        scale: 0.82,
        rest: [0.52, 0.82, -0.16],
        burst: [1.78, 1.88, 0.58],
        restRot: [0, 0.5, -0.08],
        burstRot: [0.1, 0.58, -0.14],
      },
      {
        mat: darkRoseBronzeFoilMat,
        scale: 0.68,
        rest: [-0.3, 0.78, -0.38],
        burst: [-1.05, 2.45, -0.45],
        restRot: [0, 0.4, -0.05],
        burstRot: [-0.1, 0.52, -0.12],
      },
      {
        mat: velvetPlumHeartMat,
        scale: 0.72,
        rest: [0.3, 0.8, 0.38],
        burst: [1.05, 2.38, 0.88],
        restRot: [0, 0.3, 0.06],
        burstRot: [0.08, 0.38, 0.12],
      },
    ];

    heartConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(pillowHeartGeo, cfg.mat);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      mesh.scale.setScalar(cfg.scale);
      giftBoxRoot.add(mesh);

      burstPieces.push({
        mesh,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(...cfg.restRot),
        burstRot: new THREE.Euler(...cfg.burstRot),
        phaseOffset: idx * 1.1,
        floatAmp: 0.04,
      });
    });

    const coilConfigs = [
      {
        geo: coilGeoA,
        mat: noirSatinMat,
        rest: [-0.56, 0.82, -0.12],
        burst: [-2.08, 1.56, 0.32],
        restRot: [Math.PI / 2, 0.2, 0],
        burstRot: [0.45, 0.45, 0.18],
      },
      {
        geo: coilGeoB,
        mat: blushSatinMat,
        rest: [0.56, 0.82, 0.12],
        burst: [2.1, 1.68, 0.34],
        restRot: [Math.PI / 2, -0.25, 0],
        burstRot: [0.42, -0.1, -0.2],
      },
      {
        geo: coilGeoB,
        mat: dustyRoseSatinMat,
        rest: [0.06, 0.8, -0.5],
        burst: [0.28, 2.25, -0.88],
        restRot: [Math.PI / 2, 0.5, 0],
        burstRot: [0.5, 0.72, 0.15],
      },
      {
        geo: coilGeoA,
        mat: blushSatinMat,
        rest: [-0.14, 0.8, 0.48],
        burst: [-0.46, 1.68, 1.18],
        restRot: [Math.PI / 2, -0.4, 0],
        burstRot: [0.48, -0.22, -0.14],
      },
    ];

    coilConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(cfg.geo, cfg.mat);
      mesh.castShadow = !isSoftwareGl;
      giftBoxRoot.add(mesh);
      burstPieces.push({
        mesh,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(...cfg.restRot),
        burstRot: new THREE.Euler(...cfg.burstRot),
        phaseOffset: idx * 1.4 + 0.5,
        floatAmp: 0.045,
      });
    });

    const petalConfigs = [
      { mat: petalLightMat, rest: [-0.44, 0.8, 0.4], burst: [-2.22, 2.08, 0.78] },
      { mat: petalDeepMat, rest: [0.45, 0.8, -0.38], burst: [2.26, 2.14, -0.42] },
      { mat: petalLightMat, rest: [0.2, 0.82, 0.1], burst: [1.18, 2.6, 0.4] },
      { mat: petalDeepMat, rest: [-0.2, 0.82, -0.2], burst: [-1.24, 2.55, -0.32] },
      { mat: petalLightMat, rest: [0.62, 0.78, 0.32], burst: [2.44, 1.38, 0.92] },
      { mat: petalDeepMat, rest: [-0.62, 0.78, -0.32], burst: [-2.4, 1.44, -0.68] },
      { mat: petalLightMat, rest: [0, 0.78, 0.56], burst: [0.08, 1.9, 1.38] },
      { mat: petalDeepMat, rest: [0.08, 0.78, -0.56], burst: [-0.2, 1.98, -1.12] },
    ];

    petalConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(petalGeo, cfg.mat);
      mesh.scale.setScalar(0.88 + (idx % 3) * 0.1);
      giftBoxRoot.add(mesh);
      const baseYaw = idx * 0.65;
      burstPieces.push({
        mesh,
        restPos: new THREE.Vector3(...cfg.rest),
        burstOffset: new THREE.Vector3(...cfg.burst),
        restRot: new THREE.Euler(Math.PI / 2.2, baseYaw, 0.15),
        burstRot: new THREE.Euler(0.75 + (idx % 2) * 0.25, baseYaw + 0.25, -0.2 + (idx % 3) * 0.12),
        phaseOffset: idx * 0.75,
        floatAmp: 0.055,
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

      giftBoxRoot.rotation.y = -0.5 + smoothOpen * 0.42 + pointerX * 0.14;

      pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, 5.0, delta);
      pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, 5.0, delta);
      camera.position.x = pointerX * 0.36;
      camera.position.y = 3.25 - pointerY * 0.2 + smoothOpen * 0.34;
      camera.lookAt(0, 1.0 + smoothOpen * 0.28, 0);

      const lidPhase = THREE.MathUtils.smoothstep(smoothOpen, 0.0, 0.48);
      lidPivot.rotation.x = -lidPhase * 1.44;
      lidPivot.position.y = boxH + lidPhase * 0.24;
      lidPivot.position.z = -boxD / 2 - lidPhase * 0.16;

      bowGroup.scale.setScalar(1 - lidPhase * 0.12);
      confectionGroup.position.y = lidPhase * 0.14;

      const burstPhase = THREE.MathUtils.smoothstep(smoothOpen, 0.08, 0.88);
      for (let i = 0; i < burstPieces.length; i++) {
        const item = burstPieces[i];
        _targetPos.copy(item.restPos).add(item.burstOffset);
        _vec3.copy(item.restPos).lerp(_targetPos, burstPhase);
        const floatY =
          burstPhase > 0.05
            ? Math.sin(elapsed * 1.15 + item.phaseOffset) * item.floatAmp * burstPhase
            : 0;
        item.mesh.position.set(_vec3.x, _vec3.y + floatY, _vec3.z);

        // Calm, serene micro-sway only — zero continuous spinning
        const swayX = Math.sin(elapsed * 0.75 + item.phaseOffset) * 0.04 * burstPhase;
        const swayY = Math.cos(elapsed * 0.65 + item.phaseOffset) * 0.06 * burstPhase;
        item.mesh.rotation.x =
          THREE.MathUtils.lerp(item.restRot.x, item.burstRot.x, burstPhase) + swayX;
        item.mesh.rotation.y =
          THREE.MathUtils.lerp(item.restRot.y, item.burstRot.y, burstPhase) + swayY;
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
