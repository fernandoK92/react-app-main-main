import * as THREE from 'three';
import { ROOM_WIDTH, ROOM_DEPTH, WALL_HEIGHT } from './roomStructure';

/* ============================================
   PARTITION WALL — movable divider wall

   ROOM_WIDTH  = 16  → la pared abarca 16m en X
   ROOM_DEPTH  = 11  → la pared se desliza en Z
   WALL_HEIGHT = 4.2 → altura de la pared

   USO EN TU ESCENA:
   ─────────────────
   // 1. Crear UNA sola vez al inicializar
   let wallGroup = createPartitionWall();
   updatePartitionWallPosition(wallGroup, 50); // centro
   scene.add(wallGroup);

   // 2. Al hacer clic en botones — solo mover, NO recrear
   updatePartitionWallPosition(wallGroup, 100); // Capacitación
   updatePartitionWallPosition(wallGroup, 0);   // Auditorio
   ============================================ */

export function createPartitionWall() {
  const WH    = WALL_HEIGHT;  // 4.2
  const RD    = ROOM_DEPTH;   // 11
  const THICK = 0.20;

  const wallGroup = new THREE.Group();
  wallGroup.name = 'partition_wall';

  // ── Panel principal: 11m largo (Z) × 4.2m alto × 0.20m grosor ──
  const wallMat = new THREE.MeshStandardMaterial({
    color:     0x3a5a8a,
    roughness: 0.30,
    metalness: 0.05,
    side:      THREE.DoubleSide,
  });
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(THICK, WH, RD),
    wallMat
  );
  wall.position.set(0, WH / 2, 0);
  wall.castShadow    = true;
  wall.receiveShadow = true;
  wallGroup.add(wall);

  // ── Riel superior ─────────────────────────────────────
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x888888, metalness: 0.6, roughness: 0.3,
  });
  const topRail = new THREE.Mesh(
    new THREE.BoxGeometry(THICK + 0.06, 0.08, RD + 0.2),
    railMat
  );
  topRail.position.set(0, WH + 0.04, 0);
  wallGroup.add(topRail);

  // ── Riel inferior ─────────────────────────────────────
  const botRail = new THREE.Mesh(
    new THREE.BoxGeometry(THICK + 0.04, 0.06, RD + 0.2),
    railMat
  );
  botRail.position.set(0, 0.03, 0);
  wallGroup.add(botRail);

  // ── Paneles de sección cada 2m a lo largo de X ────────
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x4a6a9a, roughness: 0.25, side: THREE.DoubleSide,
  });
  const dividerMat = new THREE.MeshStandardMaterial({
    color: 0x2a3a5a, roughness: 0.4, metalness: 0.3,
  });
  const grooveMat = new THREE.MeshStandardMaterial({
    color: 0x2a3a5a, roughness: 0.5,
  });

  const sectionD   = 2.0;
  const numSections = Math.floor(RD / sectionD); // secciones a lo largo de Z
  for (let i = 0; i < numSections; i++) {
    const sz = -(RD / 2) + sectionD * (i + 0.5);

    // Panel de sección
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(THICK - 0.02, WH - 0.12, sectionD - 0.06),
      panelMat
    );
    panel.position.set(0, WH / 2, sz);
    wallGroup.add(panel);

    // Divisor entre secciones
    if (i < numSections - 1) {
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(THICK + 0.02, WH, 0.06),
        dividerMat
      );
      div.position.set(0, WH / 2, sz + sectionD / 2);
      wallGroup.add(div);
    }

    // Ranuras decorativas en cada panel (ambas caras)
    [-sectionD / 5, sectionD / 5].forEach(gz => {
      [THICK / 2 + 0.006, -(THICK / 2 + 0.006)].forEach(xOff => {
        const groove = new THREE.Mesh(
          new THREE.BoxGeometry(0.006, WH - 0.5, 0.025),
          grooveMat
        );
        groove.position.set(xOff, WH / 2, sz + gz);
        wallGroup.add(groove);
      });
    });
  }

  // ── Manijas centradas (cada 4m, ambas caras) ──────────
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x444444, metalness: 0.8, roughness: 0.2,
  });
  [-4, 0, 4].forEach(hz => {
    [-1, 1].forEach(side => {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.06, 0.06), handleMat
      );
      base.position.set(side * (THICK / 2 + 0.02), WH * 0.5, hz);
      wallGroup.add(base);

      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.28, 0.035), handleMat
      );
      bar.position.set(side * (THICK / 2 + 0.05), WH * 0.5, hz);
      wallGroup.add(bar);
    });
  });

  // ── Sombra proyectada en el suelo ─────────────────────
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0.15,
  });
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, RD), shadowMat
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(THICK / 2 + 0.3, 0.001, 0);
  wallGroup.add(shadowMesh);

  return wallGroup;
}

/* ============================================
   Mueve la pared sin recrearla.
   Llama esto SIEMPRE en lugar de remove+create.

   percent = 0   → Z = +5.5  (frente de la sala)
   percent = 50  → Z =  0    (centro)
   percent = 100 → Z = -5.5  (fondo)
   ============================================ */
export function updatePartitionWallPosition(wallGroup, percent) {
  if (!wallGroup) return;
  const RW = ROOM_WIDTH; // 16
  // percent=0 → pared en extremo izquierdo
  // percent=50 → pared en el centro
  // percent=100 → pared en extremo derecho
  // Centro exacto: x = 0
  wallGroup.position.x = RW * (percent - 50) / 100;
  console.log('[DEBUG] updatePartitionWallPosition:', {
    percent,
    x: wallGroup.position.x,
    RW,
    wallGroup,
  });
}

/* ============================================
   Helpers de modo (sin cambios)
   ============================================ */
export function getPartitionMode(percent) {
  if (percent < 30)  return 'general';
  if (percent >= 70) return 'divided';
  return 'transitioning';
}

export function getDivisibleFurnitureType(percent) {
  if (percent < 30)  return 'general';
  if (percent >= 70) return 'divided';
  return null;
}