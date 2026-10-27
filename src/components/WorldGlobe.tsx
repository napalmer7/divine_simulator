/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Army, Avatar, City, Civilization, MapViewMode, TerritorialConflict, TradeRoute, WorldCell } from '../types/game';
import { GRID_COLS, GRID_ROWS, latLonToVector3, cellIndexToVector3 } from '../simulation/worldGrid';

interface WorldGlobeProps {
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  armies: Army[];
  avatars: Avatar[];
  tradeRoutes: TradeRoute[];
  conflicts: TerritorialConflict[];
  selectedCellIndex: number | null;
  onSelectCell: (cellIndex: number) => void;
  onHoverCell?: (cellIndex: number | null) => void;
  viewMode: MapViewMode;
}

const GLOBE_RADIUS = 3.0;

// Reusable math objects to prevent garbage collection in render loop
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _vecMid = new THREE.Vector3();

export const WorldGlobe: React.FC<WorldGlobeProps> = ({
  cells,
  cities,
  civilizations,
  armies,
  avatars,
  tradeRoutes,
  conflicts,
  selectedCellIndex,
  onSelectCell,
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
  const selectionMarkerRef = useRef<THREE.Group | null>(null);
  const hoverMarkerRef = useRef<THREE.Group | null>(null);
  const tradeArcsGroupRef = useRef<THREE.Group | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

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
        if (cell.resource && cell.elevation > 0 && viewMode === 'physical') {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2, 2, 0, Math.PI * 2);
          ctx.fill();
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

    // Selection Indicator Group (child of globeMesh for 100% accurate alignment)
    const selGroup = new THREE.Group();
    selGroup.visible = false;

    // 1. Highlight circular disc on the cell
    const discGeo = new THREE.CircleGeometry(0.18, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    selGroup.add(disc);

    // 2. Outer golden ring
    const ringGeo = new THREE.RingGeometry(0.16, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const selRing = new THREE.Mesh(ringGeo, ringMat);
    selGroup.add(selRing);

    // 3. Four corner ticks / celestial reticle brackets
    const tickGeo = new THREE.PlaneGeometry(0.04, 0.08);
    const tickMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = 0; i < 4; i++) {
      const tick = new THREE.Mesh(tickGeo, tickMat);
      const angle = (i * Math.PI) / 2;
      tick.position.set(Math.cos(angle) * 0.23, Math.sin(angle) * 0.23, 0.002);
      tick.rotation.z = angle + Math.PI / 2;
      selGroup.add(tick);
    }

    globeMesh.add(selGroup);
    selectionMarkerRef.current = selGroup;

    // Hover Indicator Group (subtle cyan reticle)
    const hoverGroup = new THREE.Group();
    hoverGroup.visible = false;
    const hoverRingGeo = new THREE.RingGeometry(0.15, 0.19, 32);
    const hoverRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const hoverRing = new THREE.Mesh(hoverRingGeo, hoverRingMat);
    hoverGroup.add(hoverRing);
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
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      controls.update();

      // Gentle subtle rotation when not actively dragging
      if (!isInteracting && viewMode === 'physical') {
        globeMesh.rotation.y += 0.0006;
        atmoMesh.rotation.y += 0.0006;
        if (selGroup.visible) {
          selGroup.rotation.z += delta * 0.8;
        }
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
      const colorHex = civ ? civ.color : '#e2e8f0';

      // Keep Base Cylinder
      const baseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.06, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.8,
        metalness: 0.2,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.03;
      cityGroup.add(base);

      // Citadel Spire
      const spireGeo = new THREE.ConeGeometry(0.045, 0.12, 6);
      const spireMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.4,
        roughness: 0.4,
      });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.y = 0.09;
      cityGroup.add(spire);

      // Beacon Light
      const beaconGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.16;
      cityGroup.add(beacon);

      group.add(cityGroup);
    });

    // 2. Render Avatars (celestial glowing beacons)
    avatars.forEach((avatar) => {
      if (!avatar.isAlive) return;
      const [x, y, z] = latLonToVector3(avatar.lat, avatar.lon, GLOBE_RADIUS + 0.04);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const avGroup = new THREE.Group();
      avGroup.position.set(x, y, z);
      avGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const flameGeo = new THREE.OctahedronGeometry(0.08, 0);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.08;
      avGroup.add(flame);

      const coreGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.08;
      avGroup.add(core);

      group.add(avGroup);
    });

    // 3. Render Armies (marching banners)
    armies.forEach((army) => {
      const [x, y, z] = latLonToVector3(army.lat, army.lon, GLOBE_RADIUS + 0.03);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const armyGroup = new THREE.Group();
      armyGroup.position.set(x, y, z);
      armyGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const bannerGeo = new THREE.BoxGeometry(0.04, 0.08, 0.01);
      const civ = civilizations.find((c) => c.id === army.civilizationId);
      const bannerMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(civ?.color || '#ef4444'),
        roughness: 0.4,
      });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.y = 0.05;
      armyGroup.add(banner);

      group.add(armyGroup);
    });

    // 4. Render Territorial Conflicts (Crossed Flaming Points)
    conflicts.forEach((conflict) => {
      const [x, y, z] = latLonToVector3(conflict.lat, conflict.lon, GLOBE_RADIUS + 0.05);
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

  // Update Selection Marker on the Globe
  useEffect(() => {
    const selGroup = selectionMarkerRef.current;
    if (!selGroup) return;

    if (selectedCellIndex === null || !cells[selectedCellIndex]) {
      selGroup.visible = false;
      return;
    }

    const [x, y, z] = cellIndexToVector3(selectedCellIndex, GLOBE_RADIUS + 0.035);
    selGroup.position.set(x, y, z);
    selGroup.lookAt(x * 2, y * 2, z * 2);
    selGroup.visible = true;
  }, [selectedCellIndex, cells]);

  // Pointer Interaction (Raycasting & Cell Selection)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPos.current) return;
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    pointerDownPos.current = null;

    // Only treat as click if moved less than 6 pixels (distinguishes clicks from drag rotations)
    if (dx > 6 || dy > 6) return;

    if (!mountRef.current || !cameraRef.current || !globeMeshRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObject(globeMeshRef.current);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      const c = Math.floor(Math.min(0.99999, Math.max(0, uv.x)) * GRID_COLS);
      const r = Math.floor(Math.min(0.99999, Math.max(0, 1 - uv.y)) * GRID_ROWS);
      const cellIdx = Math.max(0, Math.min(cells.length - 1, r * GRID_COLS + c));
      onSelectCell(cellIdx);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !globeMeshRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObject(globeMeshRef.current);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      const c = Math.floor(Math.min(0.99999, Math.max(0, uv.x)) * GRID_COLS);
      const r = Math.floor(Math.min(0.99999, Math.max(0, 1 - uv.y)) * GRID_ROWS);
      const cellIdx = Math.max(0, Math.min(cells.length - 1, r * GRID_COLS + c));
      const cell = cells[cellIdx];
      if (cell) {
        setHoveredInfo({
          cell,
          screenX: e.clientX,
          screenY: e.clientY,
        });
        if (onHoverCell) onHoverCell(cellIdx);

        if (hoverMarkerRef.current) {
          const [hx, hy, hz] = cellIndexToVector3(cellIdx, GLOBE_RADIUS + 0.03);
          hoverMarkerRef.current.position.set(hx, hy, hz);
          hoverMarkerRef.current.lookAt(hx * 2, hy * 2, hz * 2);
          hoverMarkerRef.current.visible = true;
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
        setHoveredInfo(null);
        if (onHoverCell) onHoverCell(null);
        if (hoverMarkerRef.current) hoverMarkerRef.current.visible = false;
      }}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden bg-radial from-slate-900 via-slate-950 to-black"
    >
      {/* Quick Camera Presets (Floating top right, unobtrusive) */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
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
