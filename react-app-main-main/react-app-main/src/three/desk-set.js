// desk-set.js
// Nuevo modelado: Escritorio + 2 Sillas para Three.js
import * as THREE from 'three';

// ── Materiales PBR ────────────────────────────────────────
const materials = {
  wood:   new THREE.MeshStandardMaterial({ color: 0xC79A60, roughness: 0.75, metalness: 0.00 }),
  steel:  new THREE.MeshStandardMaterial({ color: 0x8C9194, roughness: 0.55, metalness: 0.15 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95, metalness: 0.00 }),
};

// ── Helper interno ────────────────────────────────────────
function box(parent, mat, cx, cy, cz, w, h, d) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(cx, cy, cz);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// ── Escritorio ────────────────────────────────────────────
function createDesk(parent) {
  const DW=1.20, DD=0.45, DH=0.75;
  const T=0.04, LW=0.04, RH=0.015, SHT=0.02, LH=DH-T;

  const g = new THREE.Group();
  g.name = 'desk';

  // Tablero
  box(g, materials.wood, 0, DH-T/2, 0, DW, T, DD);

  // Patas + pies de goma
  [[-DW/2+LW/2, -DD/2+LW/2],
   [ DW/2-LW/2, -DD/2+LW/2],
   [-DW/2+LW/2,  DD/2-LW/2],
   [ DW/2-LW/2,  DD/2-LW/2]].forEach(([x, z]) => {
    box(g, materials.steel,  x, LH/2, z, LW, LH, LW);
    box(g, materials.rubber, x, RH/2, z, LW+0.004, RH, LW+0.004);
  });

  // Travesaños front/back
  [-DD/2+LW/2, DD/2-LW/2].forEach(z =>
    box(g, materials.steel, 0, 0.15, z, DW-LW, 0.04, LW));

  // Paneles laterales decorativos
  [-DW/2+LW+0.004, DW/2-LW-0.004].forEach(x =>
    box(g, materials.steel, x, LH*0.35, 0, 0.008, LH*0.65, DD-LW*2));

  // Estante inferior
  box(g, materials.steel, 0, 0.20+SHT/2, 0, DW-LW*2-0.02, SHT, DD-LW*2-0.02);

  parent.add(g);
  return g;
}

// ── Silla ─────────────────────────────────────────────────
function createChair(parent, px, pz, rotY = 0) {
  const CSW=0.42, CSD=0.40, CSH=0.04;
  const CBW=0.40, CBD=0.04, CBH=0.36;
  const CL=0.025, SH=0.45, CLH=SH-CSH, sRY=SH*0.35, RH=0.015;

  const g = new THREE.Group();
  g.name = 'chair';

  // Asiento
  box(g, materials.wood, 0, SH-CSH/2, 0, CSW, CSH, CSD);

  // Respaldo
  box(g, materials.wood, 0, SH+CBH/2+0.04, -CSD/2+CBD/2, CBW, CBH, CBD);

  // Patas + pies de goma
  [[-CSW/2+CL/2, -CSD/2+CL/2],
   [ CSW/2-CL/2, -CSD/2+CL/2],
   [-CSW/2+CL/2,  CSD/2-CL/2],
   [ CSW/2-CL/2,  CSD/2-CL/2]].forEach(([x, z]) => {
    box(g, materials.steel,  x, CLH/2, z, CL, CLH, CL);
    box(g, materials.rubber, x, RH/2,  z, CL+0.004, RH, CL+0.004);
  });

  // Postes del respaldo
  [-CBW/2+CL/2, CBW/2-CL/2].forEach(x =>
    box(g, materials.steel, x, SH+0.22, -CSD/2+CL/2, CL, 0.44, CL));

  // Rieles laterales
  [-CSW/2+CL/2, CSW/2-CL/2].forEach(x =>
    box(g, materials.steel, x, sRY, 0, CL, CL*0.8, CSD-CL*2));

  // Riel frontal
  box(g, materials.steel, 0, sRY, CSD/2-CL/2, CSW-CL*2, CL*0.8, CL);

  // Posición y rotación en la sala
  g.position.set(px, 0, pz);
  g.rotation.y = rotY;

  parent.add(g);
  return g;
}

// ── Función principal: crea el conjunto completo ──────────
/**
 * Crea un conjunto de escritorio + 2 sillas mirando hacia la pantalla principal.
 * @param {THREE.Object3D} parent - Nodo padre
 * @param {number} rotationY - Ángulo de rotación Y en radianes (por defecto 0, mirando eje Z negativo)
 *        Para mirar hacia la pantalla, debe coincidir con la orientación de la pantalla (usualmente 0)
 */
export function createDeskSet(rotationY = 0) {
  const root = new THREE.Group();
  root.name = 'desk_set';

  createDesk(root);
  createChair(root, -0.21, -0.49, 0); // Silla 1
  createChair(root,  0.34, -0.50, 0); // Silla 2

  // Rotar todo el conjunto hacia la pantalla
  root.rotation.y = rotationY;

  return root;
}
