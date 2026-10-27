/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Army,
  Avatar,
  City,
  Civilization,
  MapViewMode,
  TerritorialConflict,
  TradeRoute,
  WorldCell,
} from '../types/game';
import {
  GRID_COLS,
  GRID_ROWS,
  latLonToVector3,
  cellIndexToVector3,
} from '../simulation/worldGrid';
import { Pause, Play, Layers } from 'lucide-react';

interface WorldGlobeProps {
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  armies: Army[];
  avatars: Avatar[];
  tradeRoutes: TradeRoute[];
  conflicts: TerritorialConflict[];
  selectedCellIndex: number | null;
  selectedCellIndices?: number[];
  onSelectCell: (cellIndex: number, isMultiSelect?: boolean) => void;
  onClearSelection?: () => void;
  onHoverCell?: (cellIndex: number | null) => void;
  viewMode: MapViewMode;
}

const GLOBE_RADIUS = 3.0;

// Reusable math objects to prevent garbage collection in render loop
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _vecMid = new THREE.Vector3();

/**
 * Calculate exact 3D spherical position from UV coordinate
 */
function getPointOnSphere(u: number, v: number, radius: number): THREE.Vector3 {
  const phi = v * Math.PI; // 0 at North Pole, PI at South Pole
  const theta = u * 2 * Math.PI; // 0 to 2*PI around equator
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Creates curved spherical quad surface mesh geometry matching the exact cell's boundaries on the globe
 */
function createCellSegmentGeometry(cellIndex: number, radius: number): THREE.BufferGeometry {
  const r = Math.floor(cellIndex / GRID_COLS);
  const c = cellIndex % GRID_COLS;
  const segments = 4; // 4x4 subdivision curves seamlessly to the sphere surface

  const uMin = c / GRID_COLS;
  const uMax = (c + 1) / GRID_COLS;
  const vMin = r / GRID_ROWS;
  const vMax = (r + 1) / GRID_ROWS;

  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const v = vMin + (vMax - vMin) * (i / segments);
    const phi = v * Math.PI;

    for (let j = 0; j <= segments; j++) {
      const u = uMin + (uMax - uMin) * (j / segments);
      const theta = u * 2 * Math.PI;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      positions.push(x, y, z);
    }
  }

  const stride = segments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const cIdx = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);

      // Two triangles per quad
      indices.push(a, b, d);
      indices.push(b, cIdx, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates curved spherical perimeter line loop geometry matching the exact borders of the world segment
 */
function createCellOutlineGeometry(cellIndex: number, radius: number): THREE.BufferGeometry {
  const r = Math.floor(cellIndex / GRID_COLS);
  const c = cellIndex % GRID_COLS;
  const segments = 4;

  const uMin = c / GRID_COLS;
  const uMax = (c + 1) / GRID_COLS;
  const vMin = r / GRID_ROWS;
  const vMax = (r + 1) / GRID_ROWS;

  const points: THREE.Vector3[] = [];

  // Top edge (West to East)
  for (let j = 0; j <= segments; j++) {
    const u = uMin + (uMax - uMin) * (j / segments);
    points.push(getPointOnSphere(u, vMin, radius));
  }
  // Right edge (North to South)
  for (let i = 1; i <= segments; i++) {
    const v = vMin + (vMax - vMin) * (i / segments);
    points.push(getPointOnSphere(uMax, v, radius));
  }
  // Bottom edge (East to West)
  for (let j = segments - 1; j >= 0; j--) {
    const u = uMin + (uMax - uMin) * (j / segments);
    points.push(getPointOnSphere(u, vMax, radius));
  }
  // Left edge (South to North)
  for (let i = segments - 1; i >= 0; i--) {
    const v = vMin + (vMax - vMin) * (i / segments);
    points.push(getPointOnSphere(uMin, v, radius));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

export const WorldGlobe: React.FC<WorldGlobeProps> = ({
  cells,
  cities,
  civilizations,
  armies,
  avatars,
  tradeRoutes,
  conflicts,
  selectedCellIndex,
  selectedCellIndices = [],
  onSelectCell,
  onClearSelection,
  onHoverCell,
  viewMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const dynamicTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  // Exact segment shape meshes and outlines (child of globeMesh for 100% lockstep alignment)
  const selectionMarkerRef = useRef<THREE.Group | null>(null);
  const selMeshMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const selLineMatRef = useRef<THREE.LineBasicMaterial | null>(null);

  const hoverMarkerRef = useRef<THREE.Group | null>(null);
  const hoverMeshRef = useRef<THREE.Mesh | null>(null);
  const hoverLineRef = useRef<THREE.Line | null>(null);

  const tradeArcsGroupRef = useRef<THREE.Group | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // Rotation pause state
  const [isRotationPaused, setIsRotationPaused] = useState(false);
  const isRotationPausedRef = useRef(false);

  // Drag selection mode state
  const [isDragSelectMode, setIsDragSelectMode] = useState(false);
  const isDragSelectingRef = useRef(false);
  const lastDragSelectedCellIdx = useRef<number | null>(null);

  useEffect(() => {
    isRotationPausedRef.current = isRotationPaused;
  }, [isRotationPaused]);

  // Active selection indices
  const effectiveSelection = selectedCellIndices.length > 0
    ? selectedCellIndices
    : (selectedCellIndex !== null ? [selectedCellIndex] : []);

  // Extra cost for multi-block selection
  const extraCost = effectiveSelection.length >= 2
    ? 1 + (effectiveSelection.length - 2) * 2
    : 0;

  const [hoveredInfo, setHoveredInfo] = useState<{
    cell: WorldCell;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Canvas texture generator for the globe surface
  const textureCanvas = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    return canvas;
  }, []);

  // Update dynamic procedural texture whenever cells, viewMode, or civilizations change
  useEffect(() => {
    const ctx = textureCanvas.getContext('2d');
    if (!ctx || cells.length === 0) return;

    const w = textureCanvas.width;
    const h = textureCanvas.height;
    const cellW = w / GRID_COLS;
    const cellH = h / GRID_ROWS;

    ctx.clearRect(0, 0, w, h);

    // Draw base cells
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const idx = r * GRID_COLS + c;
        const cell = cells[idx];
        if (!cell) continue;

        const x = c * cellW;
        const y = r * cellH;

        let fill = '#0f172a'; // Default deep slate

        if (viewMode === 'physical') {
          // Natural terrain satellite palette
          if (cell.terrain === 'deep_ocean') fill = '#082f49';
          else if (cell.terrain === 'ocean') fill = '#0284c7';
          else if (cell.terrain === 'shallow_water') fill = '#38bdf8';
          else if (cell.terrain === 'mountains') fill = '#78716c';
          else if (cell.terrain === 'hills') fill = '#a8a29e';
          else if (cell.terrain === 'forest') fill = '#15803d';
          else if (cell.terrain === 'desert') fill = '#d97706';
          else if (cell.terrain === 'tundra') fill = '#cbd5e1';
          else if (cell.terrain === 'swamp') fill = '#3f6212';
          else if (cell.terrain === 'volcanic') fill = '#b91c1c';
          else fill = '#4ade80'; // plains
        } else if (viewMode === 'climate') {
          if (cell.climate === 'arctic') fill = '#93c5fd';
          else if (cell.climate === 'cold') fill = '#67e8f9';
          else if (cell.climate === 'temperate') fill = '#22c55e';
          else if (cell.climate === 'tropical') fill = '#15803d';
          else if (cell.climate === 'arid') fill = '#f59e0b';
          else if (cell.climate === 'geothermal') fill = '#ef4444';
        } else if (viewMode === 'political') {
          if (cell.civilizationId) {
            const civ = civilizations.find((cv) => cv.id === cell.civilizationId);
            fill = civ ? civ.color : '#64748b';
          } else if (cell.elevation <= 0) {
            fill = '#0f172a';
          } else {
            fill = '#334155';
          }
        } else if (viewMode === 'population') {
          if (cell.elevation <= 0) {
            fill = '#090d16';
          } else if (cell.population > 500) {
            fill = '#ef4444';
          } else if (cell.population > 250) {
            fill = '#f59e0b';
          } else if (cell.population > 50) {
            fill = '#eab308';
          } else if (cell.population > 0) {
            fill = '#84cc16';
          } else {
            fill = '#1e293b';
          }
        } else {
          // Default physical base for trade & conflicts modes
          if (cell.elevation <= 0) fill = '#075985';
          else if (cell.terrain === 'mountains') fill = '#78716c';
          else if (cell.terrain === 'forest') fill = '#166534';
          else if (cell.terrain === 'desert') fill = '#b45309';
          else fill = '#22c55e';
        }

        ctx.fillStyle = fill;
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);

        // Render miracle aura ring if present
        if (cell.miracleAura) {
          ctx.strokeStyle = cell.miracleAura.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }

        // Render resource glimmer
        if (cell.resource && cell.elevation > 0 && (viewMode === 'physical' || viewMode === 'resources')) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2, viewMode === 'resources' ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (viewMode === 'resources') {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
    }

    if (dynamicTextureRef.current) {
      dynamicTextureRef.current.needsUpdate = true;
    }
  }, [cells, viewMode, civilizations, textureCanvas]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Detect software WebGL as per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4.2;
    controls.maxDistance = 14.0;
    controls.rotateSpeed = 0.7;
    controlsRef.current = controls;

    // Atmospheric lighting rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0284c7, 0.6);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    sunLight.position.set(8, 6, 8);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.9);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    // Dynamic texture
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    dynamicTextureRef.current = texture;

    // Globe Mesh
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32);
    const globeMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // Atmosphere Glow Shell
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 48, 24);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // Group for 3D City Markers, Avatars, Armies (child of globeMesh for lockstep rotation)
    const markersGroup = new THREE.Group();
    globeMesh.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Group for Trade Route Arcs (child of globeMesh for lockstep rotation)
    const tradeArcsGroup = new THREE.Group();
    globeMesh.add(tradeArcsGroup);
    tradeArcsGroupRef.current = tradeArcsGroup;

    // 1. Selection Indicator Group: Exact World Segment Quad Highlight (supports multi-block highlights)
    const selGroup = new THREE.Group();
    selGroup.visible = false;

    selMeshMatRef.current = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    selLineMatRef.current = new THREE.LineBasicMaterial({
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    globeMesh.add(selGroup);
    selectionMarkerRef.current = selGroup;

    // 2. Hover Indicator Group: Exact World Segment Quad Highlight
    const hoverGroup = new THREE.Group();
    hoverGroup.visible = false;

    const initialHoverGeo = createCellSegmentGeometry(0, GLOBE_RADIUS + 0.006);
    const hoverMeshMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const hoverMesh = new THREE.Mesh(initialHoverGeo, hoverMeshMat);
    hoverGroup.add(hoverMesh);
    hoverMeshRef.current = hoverMesh;

    const initialHoverLineGeo = createCellOutlineGeometry(0, GLOBE_RADIUS + 0.008);
    const hoverLineMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const hoverLine = new THREE.Line(initialHoverLineGeo, hoverLineMat);
    hoverGroup.add(hoverLine);
    hoverLineRef.current = hoverLine;

    globeMesh.add(hoverGroup);
    hoverMarkerRef.current = hoverGroup;

    // Ambient Starfield
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 25 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Track manual interaction
    let isInteracting = false;
    controls.addEventListener('start', () => {
      isInteracting = true;
    });
    controls.addEventListener('end', () => {
      isInteracting = false;
    });

    // Animation Loop
    let animId = 0;

    const tick = () => {
      controls.update();

      // Rotate globe automatically when not interacting, not paused, and in physical mode
      if (!isInteracting && !isRotationPausedRef.current && viewMode === 'physical') {
        globeMesh.rotation.y += 0.0006;
        atmoMesh.rotation.y += 0.0006;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D Markers (Cities, Avatars, Armies, Conflicts)
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    // Clear old markers
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    // 1. Render Cities (composite 3D Keeps)
    cities.forEach((city) => {
      const [x, y, z] = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS + 0.02);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const cityGroup = new THREE.Group();
      cityGroup.position.set(x, y, z);
      cityGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const civ = civilizations.find((c) => c.id === city.civilizationId);
      const cityColor = civ ? civ.color : '#e2e8f0';

      // Keep Base
      const baseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: cityColor,
        roughness: 0.4,
        metalness: 0.2,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.04;
      cityGroup.add(baseMesh);

      // Spire Tower
      const spireGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.2,
        metalness: 0.8,
      });
      const spireMesh = new THREE.Mesh(spireGeo, spireMat);
      spireMesh.position.y = 0.14;
      cityGroup.add(spireMesh);

      // Golden Beacon Ring for capital / major city
      if (civ?.capitalCityId === city.id) {
        const ringGeo = new THREE.TorusGeometry(0.1, 0.012, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.02;
        cityGroup.add(ring);
      }

      group.add(cityGroup);
    });

    // 2. Render Avatars (Divine manifestations)
    avatars.filter((a) => a.isAlive).forEach((avatar) => {
      const [x, y, z] = latLonToVector3(avatar.lat, avatar.lon, GLOBE_RADIUS + 0.04);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const avatarGroup = new THREE.Group();
      avatarGroup.position.set(x, y, z);
      avatarGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const orbGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.y = 0.12;
      avatarGroup.add(orbMesh);

      // Halo ring around Avatar
      const haloGeo = new THREE.RingGeometry(0.11, 0.13, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfffbeb,
        side: THREE.DoubleSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      haloMesh.position.y = 0.12;
      avatarGroup.add(haloMesh);

      group.add(avatarGroup);
    });

    // 3. Render Armies (Marching Banners)
    armies.forEach((army) => {
      const [x, y, z] = latLonToVector3(army.lat, army.lon, GLOBE_RADIUS + 0.02);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const armyGroup = new THREE.Group();
      armyGroup.position.set(x, y, z);
      armyGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const civ = civilizations.find((c) => c.id === army.civilizationId);
      const armyColor = civ ? civ.color : '#dc2626';

      const staffGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4);
      const staffMat = new THREE.MeshBasicMaterial({ color: 0x78716c });
      const staff = new THREE.Mesh(staffGeo, staffMat);
      staff.position.y = 0.07;
      armyGroup.add(staff);

      const pennantGeo = new THREE.BoxGeometry(0.06, 0.04, 0.01);
      const pennantMat = new THREE.MeshBasicMaterial({ color: armyColor });
      const pennant = new THREE.Mesh(pennantGeo, pennantMat);
      pennant.position.set(0.035, 0.11, 0);
      armyGroup.add(pennant);

      group.add(armyGroup);
    });

    // 4. Render Territorial Conflicts (Crossed Sword beacons)
    conflicts.forEach((conflict) => {
      const [x, y, z] = cellIndexToVector3(conflict.cellIndex, GLOBE_RADIUS + 0.05);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const confGroup = new THREE.Group();
      confGroup.position.set(x, y, z);
      confGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const blastGeo = new THREE.DodecahedronGeometry(0.06, 0);
      const blastMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
      });
      const blast = new THREE.Mesh(blastGeo, blastMat);
      blast.position.y = 0.06;
      confGroup.add(blast);

      group.add(confGroup);
    });
  }, [cities, civilizations, avatars, armies, conflicts]);

  // Update Trade Arcs
  useEffect(() => {
    const arcGroup = tradeArcsGroupRef.current;
    if (!arcGroup) return;

    while (arcGroup.children.length > 0) {
      const child = arcGroup.children[0];
      arcGroup.remove(child);
      if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
    }

    if (viewMode === 'trade' || viewMode === 'physical') {
      tradeRoutes.forEach((route) => {
        const cityA = cities.find((c) => c.id === route.cityAId);
        const cityB = cities.find((c) => c.id === route.cityBId);
        if (!cityA || !cityB) return;

        const [x1, y1, z1] = latLonToVector3(cityA.lat, cityA.lon, GLOBE_RADIUS + 0.02);
        const [x2, y2, z2] = latLonToVector3(cityB.lat, cityB.lon, GLOBE_RADIUS + 0.02);

        _vecA.set(x1, y1, z1);
        _vecB.set(x2, y2, z2);

        // Compute midpoint arched away from the globe center
        _vecMid.addVectors(_vecA, _vecB).multiplyScalar(0.5);
        const distance = _vecA.distanceTo(_vecB);
        _vecMid.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(0.8, distance * 0.25));

        const curve = new THREE.QuadraticBezierCurve3(_vecA, _vecMid, _vecB);
        const points = curve.getPoints(24);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

        const curveMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(route.color || '#38bdf8'),
          transparent: true,
          opacity: 0.65,
        });

        const line = new THREE.Line(curveGeo, curveMat);
        arcGroup.add(line);
      });
    }
  }, [tradeRoutes, cities, viewMode]);

  // Raycast helper to identify WorldCell index on the globe
  const raycastCellIndex = (clientX: number, clientY: number): number | null => {
    if (!mountRef.current || !cameraRef.current || !globeMeshRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObject(globeMeshRef.current);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      const c = Math.floor(Math.min(0.99999, Math.max(0, uv.x)) * GRID_COLS);
      const r = Math.floor(Math.min(0.99999, Math.max(0, 1 - uv.y)) * GRID_ROWS);
      return Math.max(0, Math.min(cells.length - 1, r * GRID_COLS + c));
    }
    return null;
  };

  // Update Selection Markers on the Globe (Exact Segment Spherical Quads for all selected blocks)
  useEffect(() => {
    const selGroup = selectionMarkerRef.current;
    if (!selGroup) return;

    // Dispose old geometries from the selection group
    while (selGroup.children.length > 0) {
      const child = selGroup.children[0];
      selGroup.remove(child);
      if ((child as THREE.Mesh | THREE.Line).geometry) {
        (child as THREE.Mesh | THREE.Line).geometry.dispose();
      }
    }

    if (effectiveSelection.length === 0) {
      selGroup.visible = false;
      return;
    }

    const meshMat = selMeshMatRef.current || new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const lineMat = selLineMatRef.current || new THREE.LineBasicMaterial({
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    // Create an exact curved spherical quad mesh and outline for each selected block
    effectiveSelection.forEach((cellIdx) => {
      if (!cells[cellIdx]) return;
      const geo = createCellSegmentGeometry(cellIdx, GLOBE_RADIUS + 0.009);
      const mesh = new THREE.Mesh(geo, meshMat);
      selGroup.add(mesh);

      const lineGeo = createCellOutlineGeometry(cellIdx, GLOBE_RADIUS + 0.012);
      const line = new THREE.Line(lineGeo, lineMat);
      selGroup.add(line);
    });

    selGroup.visible = true;
  }, [effectiveSelection, cells]);

  // Pointer Interaction (Raycasting & Cell Drag Selection)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    const isDragModeActive = isDragSelectMode || e.shiftKey;

    if (isDragModeActive) {
      isDragSelectingRef.current = true;
      if (controlsRef.current) controlsRef.current.enabled = false;

      const cellIdx = raycastCellIndex(e.clientX, e.clientY);
      if (cellIdx !== null) {
        lastDragSelectedCellIdx.current = cellIdx;
        onSelectCell(cellIdx, e.shiftKey || effectiveSelection.length > 0);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragSelectingRef.current) {
      isDragSelectingRef.current = false;
      lastDragSelectedCellIdx.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
      return;
    }

    if (!pointerDownPos.current) return;
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    pointerDownPos.current = null;

    // Only treat as click if moved less than 6 pixels (distinguishes clicks from drag rotations)
    if (dx > 6 || dy > 6) return;

    const cellIdx = raycastCellIndex(e.clientX, e.clientY);
    if (cellIdx !== null) {
      onSelectCell(cellIdx, e.shiftKey);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const cellIdx = raycastCellIndex(e.clientX, e.clientY);

    // If drag-selecting, continuously add adjacent or diagonally adjacent cells
    if (isDragSelectingRef.current && cellIdx !== null) {
      if (cellIdx !== lastDragSelectedCellIdx.current) {
        lastDragSelectedCellIdx.current = cellIdx;
        onSelectCell(cellIdx, true);
      }
    }

    // Hover state & exact quad shape outline for moused-over block
    if (cellIdx !== null) {
      const cell = cells[cellIdx];
      if (cell) {
        setHoveredInfo({
          cell,
          screenX: e.clientX,
          screenY: e.clientY,
        });
        if (onHoverCell) onHoverCell(cellIdx);

        // Highlight the entire moused-over segment in its exact quad shape
        if (hoverMarkerRef.current && hoverMeshRef.current && hoverLineRef.current) {
          if (effectiveSelection.includes(cellIdx)) {
            hoverMarkerRef.current.visible = false;
          } else {
            hoverMeshRef.current.geometry.dispose();
            hoverLineRef.current.geometry.dispose();

            hoverMeshRef.current.geometry = createCellSegmentGeometry(cellIdx, GLOBE_RADIUS + 0.006);
            hoverLineRef.current.geometry = createCellOutlineGeometry(cellIdx, GLOBE_RADIUS + 0.008);
            hoverMarkerRef.current.visible = true;
          }
        }
      }
    } else {
      setHoveredInfo(null);
      if (onHoverCell) onHoverCell(null);
      if (hoverMarkerRef.current) {
        hoverMarkerRef.current.visible = false;
      }
    }
  };

  const resetCamera = (view: 'equator' | 'north' | 'capital') => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (view === 'equator') {
      camera.position.set(0, 0, 7.5);
    } else if (view === 'north') {
      camera.position.set(0, 7.5, 0.1);
    } else if (view === 'capital' && cities.length > 0) {
      const city = cities[0];
      const [x, y, z] = cellIndexToVector3(city.cellIndex, 7.5);
      const worldPos = new THREE.Vector3(x, y, z);
      if (globeMeshRef.current) {
        worldPos.applyEuler(globeMeshRef.current.rotation);
      }
      camera.position.copy(worldPos);
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        if (isDragSelectingRef.current) {
          isDragSelectingRef.current = false;
          lastDragSelectedCellIdx.current = null;
          if (controlsRef.current) controlsRef.current.enabled = true;
        }
        setHoveredInfo(null);
        if (onHoverCell) onHoverCell(null);
        if (hoverMarkerRef.current) hoverMarkerRef.current.visible = false;
      }}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden bg-radial from-slate-900 via-slate-950 to-black"
    >
      {/* 3D Viewport Controls Bar: Drag Multi-Select, Pause Rotation, Multi-Block Badge, Camera Presets */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
        {/* Multi-Selection Counter & Cost Badge */}
        {effectiveSelection.length > 1 && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-500/70 text-xs shadow-md backdrop-blur-md">
            <span className="font-bold text-amber-300">
              {effectiveSelection.length} Blocks
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/40 font-mono">
              +{extraCost} Power
            </span>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-[10px] text-amber-400 hover:text-white underline ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Drag Multi-Select Mode Toggle */}
        <button
          onClick={() => setIsDragSelectMode(!isDragSelectMode)}
          className={`px-3 py-1 text-xs rounded-lg border font-semibold flex items-center gap-1.5 transition shadow backdrop-blur-md ${
            isDragSelectMode
              ? 'border-emerald-500/80 bg-emerald-950/90 text-emerald-300 ring-2 ring-emerald-500/40 shadow-emerald-500/20'
              : 'border-slate-700 bg-slate-900/85 text-slate-200 hover:text-white hover:bg-slate-800'
          }`}
          title={isDragSelectMode ? 'Click to exit Drag Select mode' : 'Toggle Drag Multi-Select mode (or hold Shift while dragging)'}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isDragSelectMode ? 'Drag Selecting' : 'Drag Multi-Select'}</span>
        </button>

        {/* Pause / Resume Globe Rotation Button */}
        <button
          onClick={() => setIsRotationPaused(!isRotationPaused)}
          className={`px-3 py-1 text-xs rounded-lg border font-semibold flex items-center gap-1.5 transition shadow backdrop-blur-md ${
            isRotationPaused
              ? 'border-amber-500/80 bg-amber-950/85 text-amber-300 hover:bg-amber-900/90'
              : 'border-slate-700 bg-slate-900/85 text-slate-200 hover:text-white hover:bg-slate-800'
          }`}
          title={isRotationPaused ? 'Resume globe rotation' : 'Pause globe rotation'}
        >
          {isRotationPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Resume Rotation</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause Rotation</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5 hidden sm:block" />

        <button
          onClick={() => resetCamera('equator')}
          className="px-2.5 py-1 text-xs rounded border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow backdrop-blur-sm"
          title="Align view with equator"
        >
          Equator
        </button>
        <button
          onClick={() => resetCamera('north')}
          className="px-2.5 py-1 text-xs rounded border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow backdrop-blur-sm"
          title="Align view with north celestial pole"
        >
          North Pole
        </button>
        {cities.length > 0 && (
          <button
            onClick={() => resetCamera('capital')}
            className="px-2.5 py-1 text-xs rounded border border-amber-600/60 bg-amber-950/60 text-amber-200 hover:text-white hover:bg-amber-900 transition shadow backdrop-blur-sm"
            title="Focus camera on civilization cradle"
          >
            Focus Cradle
          </button>
        )}
      </div>

      {/* Floating Hover Coordinates Tooltip */}
      {hoveredInfo && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(window.innerWidth - 240, hoveredInfo.screenX + 16),
            top: Math.max(16, hoveredInfo.screenY - 80),
            pointerEvents: 'none',
          }}
          className="z-50 px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700 text-xs text-slate-200 shadow-xl backdrop-blur-md max-w-xs"
        >
          <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
            <span className="capitalize">{hoveredInfo.cell.terrain.replace('_', ' ')}</span>
            <span className="text-[10px] text-slate-400">
              {hoveredInfo.cell.lat.toFixed(0)}°, {hoveredInfo.cell.lon.toFixed(0)}°
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>
              <span className="text-slate-400">Climate:</span>{' '}
              <span className="capitalize text-cyan-300">{hoveredInfo.cell.climate}</span>
            </div>
            {hoveredInfo.cell.resource && (
              <div>
                <span className="text-slate-400">Resource:</span>{' '}
                <span className="text-amber-400 font-medium">{hoveredInfo.cell.resource}</span>
              </div>
            )}
            {hoveredInfo.cell.population > 0 && (
              <div>
                <span className="text-slate-400">Population:</span>{' '}
                <span className="text-emerald-400 font-medium">
                  {hoveredInfo.cell.population.toLocaleString()} souls
                </span>
              </div>
            )}
            {hoveredInfo.cell.cityId && (
              <div className="text-sky-300 font-medium">
                Settlement: {cities.find((c) => c.id === hoveredInfo.cell.cityId)?.name}
              </div>
            )}
            {hoveredInfo.cell.miracleAura && (
              <div className="text-purple-300 text-[10px] italic">
                Aura: {hoveredInfo.cell.miracleAura.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
