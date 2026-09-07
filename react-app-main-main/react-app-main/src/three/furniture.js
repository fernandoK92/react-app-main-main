import * as THREE from 'three';
import { ROOM_DEPTH } from './roomStructure';
import { createDeskSet } from './desk-set';

const hD = ROOM_DEPTH / 2;

/* ======= Podium Desk with 2 Laptops ======= */
export function addPodiumDesk(scene, x, z) {
  const dM = new THREE.MeshStandardMaterial({ color: 0xb89040, roughness: 0.4 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.78, 0.55), dM);
  desk.position.set(x, 0.54, z);
  desk.castShadow = true;
  scene.add(desk);

  const topM = new THREE.MeshStandardMaterial({ color: 0xccaa55, roughness: 0.35 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.04, 0.6), topM);
  top.position.set(x, 0.96, z);
  scene.add(top);
  

  const lnM = new THREE.MeshStandardMaterial({ color: 0x8a6a20 });
  for (let dx = -0.8; dx <= 0.8; dx += 0.8) {
    const ln = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.68, 0.004), lnM);
    ln.position.set(x + dx, 0.5, z + 0.276);
    scene.add(ln);
  }

  // Laptop 1 (right)
  const lbM = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 });
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), lbM);
  base1.position.set(x + 0.5, 0.99, z);
  scene.add(base1);
  const scrM = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: 0.4 });
  const scr1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.008), scrM);
  scr1.position.set(x + 0.5, 1.1, z - 0.11);
  scr1.rotation.x = -0.22;
  scene.add(scr1);
  const glowM = new THREE.MeshBasicMaterial({ color: 0x4488cc });
  const glow1 = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), glowM);
  glow1.position.set(x + 0.5, 1.1, z - 0.106);
  glow1.rotation.x = -0.22;
  scene.add(glow1);

  // Laptop 2 (left)
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), lbM);
  base2.position.set(x - 0.5, 0.99, z);
  scene.add(base2);
  const scr2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.008), scrM);
  scr2.position.set(x - 0.5, 1.1, z - 0.11);
  scr2.rotation.x = -0.22;
  scene.add(scr2);
  const glow2 = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), glowM);
  glow2.position.set(x - 0.5, 1.1, z - 0.106);
  glow2.rotation.x = -0.22;
  scene.add(glow2);
}

/* ======= Tripod Speaker ======= */
export function addTripodSpeaker(scene, x, z) {
  const g = new THREE.Group();
  const legM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.02, 1.25, 6), legM);
    leg.position.set(Math.sin(a) * 0.22, 0.625, Math.cos(a) * 0.22);
    leg.rotation.z = Math.sin(a) * 0.11;
    leg.rotation.x = Math.cos(a) * 0.11;
    g.add(leg);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.85, 7), legM);
  pole.position.set(0, 1.1, 0);
  g.add(pole);
  const spkM = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.3 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.28), spkM);
  box.position.set(0, 1.8, 0);
  box.castShadow = true;
  g.add(box);
  const grM = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.45 });
  const grill = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.48), grM);
  grill.position.set(0, 1.8, 0.141);
  g.add(grill);
  const indM = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const ind = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.01), indM);
  ind.position.set(0, 1.55, 0.145);
  g.add(ind);

  g.position.set(x, 0, z);
  scene.add(g);
}

/* ======= Instanced Chairs (2 symmetric blocks + center aisle) ======= */
export function addInstancedChairs(scene, rows, colsPerSide, aisleW, startZ) {
  const rowSp = 0.82, colSp = 0.58;
  const total = rows * colsPerSide * 2;
  const dummy = new THREE.Object3D();

  const seatGeo = new THREE.BoxGeometry(0.44, 0.06, 0.40);
  const backGeo = new THREE.BoxGeometry(0.40, 0.40, 0.035);
  const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 5);
  const frmGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.50, 5);
  const armGeo = new THREE.BoxGeometry(0.045, 0.024, 0.15);

  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2b5797, roughness: 0.52 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1e4070, roughness: 0.48 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
  const armMat = new THREE.MeshStandardMaterial({ color: 0xc0a050, roughness: 0.38 });

  const seatIM = new THREE.InstancedMesh(seatGeo, seatMat, total); seatIM.castShadow = true;
  const backIM = new THREE.InstancedMesh(backGeo, backMat, total); backIM.castShadow = true;
  const legIM = new THREE.InstancedMesh(legGeo, legMat, total * 4);
  const frmIM = new THREE.InstancedMesh(frmGeo, legMat, total * 2);
  const armIM = new THREE.InstancedMesh(armGeo, armMat, total * 2);

  let ci = 0;
  for (let r = 0; r < rows; r++) {
    const z = startZ + r * rowSp;
    for (let side = 0; side < 2; side++) {
      for (let c = 0; c < colsPerSide; c++) {
        const x = side === 0
          ? -(aisleW / 2) - c * colSp - colSp / 2
          : (aisleW / 2) + c * colSp + colSp / 2;

        dummy.rotation.set(0, 0, 0);
        dummy.position.set(x, 0.44, z); dummy.updateMatrix(); seatIM.setMatrixAt(ci, dummy.matrix);
        dummy.position.set(x, 0.72, z + 0.17); dummy.updateMatrix(); backIM.setMatrixAt(ci, dummy.matrix);

        [[x - 0.16, 0.21, z - 0.15], [x + 0.16, 0.21, z - 0.15],
        [x - 0.16, 0.21, z + 0.13], [x + 0.16, 0.21, z + 0.13]].forEach((p, li) => {
          dummy.position.set(p[0], p[1], p[2]); dummy.updateMatrix();
          legIM.setMatrixAt(ci * 4 + li, dummy.matrix);
        });

        dummy.position.set(x - 0.15, 0.54, z + 0.15); dummy.updateMatrix(); frmIM.setMatrixAt(ci * 2, dummy.matrix);
        dummy.position.set(x + 0.15, 0.54, z + 0.15); dummy.updateMatrix(); frmIM.setMatrixAt(ci * 2 + 1, dummy.matrix);
        dummy.position.set(x - 0.21, 0.50, z - 0.02); dummy.updateMatrix(); armIM.setMatrixAt(ci * 2, dummy.matrix);
        dummy.position.set(x + 0.21, 0.50, z - 0.02); dummy.updateMatrix(); armIM.setMatrixAt(ci * 2 + 1, dummy.matrix);

        ci++;
      }
    }
  }

  [seatIM, backIM, legIM, frmIM, armIM].forEach(im => {
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
  });
}

/* ======= Instanced Chairs (Half — for divisible auditorio half) ======= */
export function addInstancedChairsHalf(scene, rows, colsPerSide, aisleW, startZ, centerX) {
  const rowSp = 0.82, colSp = 0.58;
  const total = rows * colsPerSide * 2;
  const dummy = new THREE.Object3D();

  const seatGeo = new THREE.BoxGeometry(0.44, 0.06, 0.40);
  const backGeo = new THREE.BoxGeometry(0.40, 0.40, 0.035);
  const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 5);
  const frmGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.50, 5);
  const armGeo = new THREE.BoxGeometry(0.045, 0.024, 0.15);

  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2b5797, roughness: 0.52 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1e4070, roughness: 0.48 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
  const armMat = new THREE.MeshStandardMaterial({ color: 0xc0a050, roughness: 0.38 });

  const seatIM = new THREE.InstancedMesh(seatGeo, seatMat, total); seatIM.castShadow = true;
  const backIM = new THREE.InstancedMesh(backGeo, backMat, total); backIM.castShadow = true;
  const legIM = new THREE.InstancedMesh(legGeo, legMat, total * 4);
  const frmIM = new THREE.InstancedMesh(frmGeo, legMat, total * 2);
  const armIM = new THREE.InstancedMesh(armGeo, armMat, total * 2);

  let ci = 0;
  for (let r = 0; r < rows; r++) {
    const z = startZ + r * rowSp;
    for (let side = 0; side < 2; side++) {
      for (let c = 0; c < colsPerSide; c++) {
        const x = centerX + (side === 0
          ? -(aisleW / 2) - c * colSp - colSp / 2
          : (aisleW / 2) + c * colSp + colSp / 2);

        dummy.rotation.set(0, 0, 0);
        dummy.position.set(x, 0.44, z); dummy.updateMatrix(); seatIM.setMatrixAt(ci, dummy.matrix);
        dummy.position.set(x, 0.72, z + 0.17); dummy.updateMatrix(); backIM.setMatrixAt(ci, dummy.matrix);

        [[x - 0.16, 0.21, z - 0.15], [x + 0.16, 0.21, z - 0.15],
        [x - 0.16, 0.21, z + 0.13], [x + 0.16, 0.21, z + 0.13]].forEach((p, li) => {
          dummy.position.set(p[0], p[1], p[2]); dummy.updateMatrix();
          legIM.setMatrixAt(ci * 4 + li, dummy.matrix);
        });

        dummy.position.set(x - 0.15, 0.54, z + 0.15); dummy.updateMatrix(); frmIM.setMatrixAt(ci * 2, dummy.matrix);
        dummy.position.set(x + 0.15, 0.54, z + 0.15); dummy.updateMatrix(); frmIM.setMatrixAt(ci * 2 + 1, dummy.matrix);
        dummy.position.set(x - 0.21, 0.50, z - 0.02); dummy.updateMatrix(); armIM.setMatrixAt(ci * 2, dummy.matrix);
        dummy.position.set(x + 0.21, 0.50, z - 0.02); dummy.updateMatrix(); armIM.setMatrixAt(ci * 2 + 1, dummy.matrix);

        ci++;
      }
    }
  }

  [seatIM, backIM, legIM, frmIM, armIM].forEach(im => {
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
  });
}

/* ======= Instanced Desks + Chairs ======= */
export function addInstancedDesks(scene, rows, cols, startZ) {
  const rowSp = 1.1, colSp = 0.8;
  const total = rows * cols;
  const dummy = new THREE.Object3D();

  const dkGeo = new THREE.BoxGeometry(0.56, 0.035, 0.40);
  const dkMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.4 });
  const dkIM = new THREE.InstancedMesh(dkGeo, dkMat, total); dkIM.castShadow = true;
  const dlGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.67, 5);
  const dlMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5 });
  const dlIM = new THREE.InstancedMesh(dlGeo, dlMat, total * 4);
  const seatGeo = new THREE.BoxGeometry(0.44, 0.06, 0.40);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2b5797, roughness: 0.52 });
  const seatIM = new THREE.InstancedMesh(seatGeo, seatMat, total); seatIM.castShadow = true;
  const backGeo = new THREE.BoxGeometry(0.40, 0.40, 0.035);
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1e4070, roughness: 0.48 });
  const backIM = new THREE.InstancedMesh(backGeo, backMat, total);
  const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 5);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
  const legIM = new THREE.InstancedMesh(legGeo, legMat, total * 4);

  let di = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * colSp;
      const z = startZ + r * rowSp;
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(x, 0.67, z - 0.2); dummy.updateMatrix(); dkIM.setMatrixAt(di, dummy.matrix);

      [[x - 0.22, 0.335, z - 0.15], [x + 0.22, 0.335, z - 0.15],
      [x - 0.22, 0.335, z - 0.38], [x + 0.22, 0.335, z - 0.38]].forEach((p, li) => {
        dummy.position.set(p[0], p[1], p[2]); dummy.updateMatrix();
        dlIM.setMatrixAt(di * 4 + li, dummy.matrix);
      });

      const cz = z + 0.22;
      dummy.position.set(x, 0.44, cz); dummy.updateMatrix(); seatIM.setMatrixAt(di, dummy.matrix);
      dummy.position.set(x, 0.72, cz + 0.17); dummy.updateMatrix(); backIM.setMatrixAt(di, dummy.matrix);

      [[x - 0.16, 0.21, cz - 0.15], [x + 0.16, 0.21, cz - 0.15],
      [x - 0.16, 0.21, cz + 0.13], [x + 0.16, 0.21, cz + 0.13]].forEach((p, li) => {
        dummy.position.set(p[0], p[1], p[2]); dummy.updateMatrix();
        legIM.setMatrixAt(di * 4 + li, dummy.matrix);
      });

      di++;
    }
  }

  [dkIM, dlIM, seatIM, backIM, legIM].forEach(im => {
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
  });
}

/* ======= Single Chair (for group tables) ======= */
export function addSingleChair(scene, x, z, rotY) {
  const g = new THREE.Group();
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
  const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 5);
  [[-0.16, 0.15], [0.16, 0.15], [-0.16, -0.13], [0.16, -0.13]].forEach(([lx, lz]) => {
    const l = new THREE.Mesh(legGeo, legMat);
    l.position.set(lx, 0.21, lz);
    g.add(l);
  });
  const seatM = new THREE.MeshStandardMaterial({ color: 0x2b5797, roughness: 0.52 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.40), seatM);
  seat.position.set(0, 0.44, 0);
  g.add(seat);
  const backM = new THREE.MeshStandardMaterial({ color: 0x1e4070, roughness: 0.48 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.40, 0.035), backM);
  back.position.set(0, 0.72, -0.17);
  g.add(back);

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
}

/* ======= Group Tables ======= */
export function addGroupTables(scene, tables, seatsPerTable) {
  const perSide = Math.floor(seatsPerTable / 2);
  const positions = [[-3.2, -1.5], [3.2, -1.5], [-3.2, 2.5], [3.2, 2.5]];
  const tM = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.4 });
  const lgM = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5 });

  positions.slice(0, tables).forEach(([tx, tz]) => {
    const tb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.8), tM);
    tb.position.set(tx, 0.67, tz);
    tb.castShadow = true;
    scene.add(tb);
    const lgG = new THREE.CylinderGeometry(0.02, 0.02, 0.67, 5);
    [[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 0.35]].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(lgG, lgM);
      l.position.set(tx + lx, 0.335, tz + lz);
      scene.add(l);
    });
    for (let s = 0; s < perSide; s++) {
      const cx = tx - 0.7 + s * 0.7;
      addSingleChair(scene, cx, tz + 0.7, Math.PI);
      addSingleChair(scene, cx, tz - 0.7, Math.PI);
    }
  });
}

/* ======= Group Tables (Half — for divisible capacitación half) ======= */
export function addGroupTablesHalf(scene, tables, seatsPerTable, centerX) {
  const perSide = Math.floor(seatsPerTable / 2);
  const positions = [
    [centerX - 1.8, -1.5], [centerX + 1.8, -1.5],
    [centerX - 1.8, 2.5], [centerX + 1.8, 2.5],
  ];
  const tM = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.4 });
  const lgM = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5 });

  positions.slice(0, tables).forEach(([tx, tz]) => {
    const tb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.8), tM);
    tb.position.set(tx, 0.67, tz);
    tb.castShadow = true;
    scene.add(tb);
    const lgG = new THREE.CylinderGeometry(0.02, 0.02, 0.67, 5);
    [[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(lgG, lgM);
      l.position.set(tx + lx, 0.335, tz + lz);
      scene.add(l);
    });
    for (let s = 0; s < perSide; s++) {
      const cx = tx - 0.65 + s * 0.65;
      addSingleChair(scene, cx, tz + 0.7, Math.PI);
      addSingleChair(scene, cx, tz - 0.7, Math.PI);
    }
  });
}

/* ======= Add furniture by room type ======= */
export function addFurnitureForType(scene, type) {
  // Create named groups for toggleable equipment
  const podioGroup = new THREE.Group();
  podioGroup.name = 'equipment_podio';
  const bocinasTriGroup = new THREE.Group();
  bocinasTriGroup.name = 'equipment_bocinas_tripode';

  if (type === 'auditorio') {
    addPodiumDesk(podioGroup, 0, -hD + 1.6);
    addTripodSpeaker(bocinasTriGroup, -4.2, -hD + 1.8);
    addTripodSpeaker(bocinasTriGroup, 4.2, -hD + 1.8);
    addInstancedChairs(scene, 8, 5, 1.8, -2.2);
  } else if (type === 'computo') {
    // SOLO modelado nuevo para computo, sin instanced ni desk-set ni otros restos
    addComputoTablesAndChairs(scene);
  } else if (type === 'capacitacion') {
    addPodiumDesk(podioGroup, 0, -hD + 1.6);
    addGroupTables(scene, 4, 6);
  } else if (type === 'general') {
    // MODELO SIMILAR A LA FOTO REAL:
    addPodiumDesk(podioGroup, 0, -hD + 1.6);
    addTripodSpeaker(bocinasTriGroup, -4.2, -hD + 1.8);
    addTripodSpeaker(bocinasTriGroup, 4.2, -hD + 1.8);
    // Mesas individuales separadas con 2 sillas cada una, para 60 personas
    addGeneralRoomTablesAndChairs(scene);
    // TV grande al frente
    if (typeof addTVOnStand === 'function') {
      addTVOnStand(scene, 0, -hD + 0.8);
    }
    // Pizarra blanca en la pared izquierda
    if (typeof addWhiteboard === 'function') {
      addWhiteboard(scene, -4.8, 1.8, -hD + 0.15, 0);
    }
  } else if (type === 'divided') {
    // LEFT HALF: Auditorio
    addPodiumDesk(podioGroup, -4, -hD + 1.6);
    addTripodSpeaker(bocinasTriGroup, -6.5, -hD + 1.8);
    addInstancedChairsHalf(scene, 6, 4, 0.8, -2.2, -4);
    // RIGHT HALF: Capacitación
    addPodiumDesk(podioGroup, 4, -hD + 1.6);
    addGroupTablesHalf(scene, 4, 6, 4);
  }

  scene.add(podioGroup);
  if (bocinasTriGroup.children.length > 0) {
    scene.add(bocinasTriGroup);
  }
}

function addGeneralRoomTablesAndChairs(scene) {
  // 30 conjuntos de escritorio + 2 sillas mirando hacia la pantalla principal
  const totalSets = 30;
  const filas = 5;
  const setsPorFila = totalSets / filas; // 6 por fila
  const espacioEntreSets = 1.7;
  const espacioEntreFilas = 1.7;
  const inicioZ = -2.5;
  const inicioX = -5.0;
  // La pantalla está en Z negativo, así que rotación 0
  // Forzar giro de 180 grados para que miren hacia la pantalla (eje Z positivo)
  const rotationY = Math.PI;

  let setIndex = 0;
  for (let fila = 0; fila < filas; fila++) {
    const z = inicioZ + fila * espacioEntreFilas;
    for (let set = 0; set < setsPorFila; set++) {
      const x = inicioX + set * espacioEntreSets;
      const deskSet = createDeskSet(rotationY);
      deskSet.position.set(x, 0, z);
      scene.add(deskSet);
      setIndex++;
      if (setIndex >= totalSets) break;
    }
  }
}

function addLaptop(scene, x, z) {
  // Base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.16), baseMat);
  base.position.set(x, 0.755, z);
  scene.add(base);
  // Screen
  const scrMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: 0.4 });
  const scr = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.13, 0.008), scrMat);
  scr.position.set(x, 0.82, z - 0.07);
  scr.rotation.x = -0.9;
  scene.add(scr);
  // Glow
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x4488cc });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.10), glowMat);
  glow.position.set(x, 0.82, z - 0.069);
  glow.rotation.x = -0.9;
  scene.add(glow);
}

// Nuevo modelado para sala de cómputo
function addComputoTablesAndChairs(scene) {
  // Materiales
  const M = {
    wood:     new THREE.MeshStandardMaterial({ color:0xd4a96a, roughness:0.55 }),
    woodD:    new THREE.MeshStandardMaterial({ color:0xa0784a, roughness:0.65 }),
    metal:    new THREE.MeshStandardMaterial({ color:0xb0b8c0, metalness:0.6, roughness:0.4 }),
    rubber:   new THREE.MeshStandardMaterial({ color:0x181818, roughness:0.95 }),
    chairB:   new THREE.MeshStandardMaterial({ color:0x1a4080, roughness:0.6 }),
    laptopB:  new THREE.MeshStandardMaterial({ color:0x2a2a2a, roughness:0.4, metalness:0.4 }),
    screen:   new THREE.MeshStandardMaterial({ color:0x0a1830, roughness:0.05, emissive:0x0033aa, emissiveIntensity:0.55 }),
    silver:   new THREE.MeshStandardMaterial({ color:0xc8cdd2, metalness:0.7, roughness:0.3 }),
    offBlack: new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.7, metalness:0.1 }),
    offMesh:  new THREE.MeshStandardMaterial({ color:0x2a2a2a, roughness:0.9, side:THREE.DoubleSide, transparent:true, opacity:0.92 }),
    offChrome:new THREE.MeshStandardMaterial({ color:0xd0d8e0, metalness:0.95, roughness:0.1 }),
    offSeat:  new THREE.MeshStandardMaterial({ color:0x0d0d0d, roughness:0.85 }),
    offArm:   new THREE.MeshStandardMaterial({ color:0x1a1a1a, roughness:0.7, metalness:0.15 })
  };
  function ledMat(c){ return new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:2 }); }

  // Helpers
  function box(w, h, d, mat, px, py, pz, parent) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(px, py, pz);
    m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  }
  function cyl(rt, rb, h, seg, mat, px, py, pz, parent) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(px, py, pz);
    m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  }

  // Builders
  function buildDesk(g) {
    box(2, 0.07, 0.85,    M.wood,   0, 1.18,  0, g);
    box(1.6, 0.04, 0.65,  M.metal,  0, 0.97, -0.08, g);
    box(1.8, 0.04, 0.04,  M.metal,  0, 0.58, -0.38, g);
    box(1.8, 0.04, 0.04,  M.metal,  0, 0.58,  0.38, g);
    [[-0.88,-0.38],[0.88,-0.38],[-0.88,0.38],[0.88,0.38]].forEach(([x,z]) => {
      box(0.06, 1.18, 0.06, M.metal,  x, 0.59, z, g);
      box(0.11, 0.04, 0.11, M.rubber, x, 0.02, z, g);
    });
  }
  function buildChair(g) {
    const cz = 0.82;
    box(0.52, 0.07, 0.52, M.chairB, 0, 0.79, cz, g);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.46, 0.06), M.woodD);
    br.position.set(0, 1.065, cz - 0.24); br.rotation.x = 0.17;
    br.castShadow = true; g.add(br);
    [[-0.2,0.22],[0.2,0.22],[-0.2,-0.22],[0.2,-0.22]].forEach(([x,z]) => {
      box(0.05, 0.79, 0.05, M.metal,  x, 0.395, cz + z, g);
      box(0.09, 0.04, 0.09, M.rubber, x, 0.02,  cz + z, g);
    });
    box(0.04, 0.04, 0.44, M.metal, -0.2, 0.4, cz, g);
    box(0.04, 0.04, 0.44, M.metal,  0.2, 0.4, cz, g);
    box(0.42, 0.04, 0.04, M.metal,    0, 0.4, cz + 0.22, g);
  }
  function buildLaptop(g) {
    box(0.42, 0.025, 0.30, M.laptopB, 0, 0.013,  0,    g);
    box(0.36, 0.005, 0.22, M.metal,   0, 0.027,  0.02, g);
    box(0.38, 0.02,  0.02, M.silver,  0, 0.028, -0.13, g);
    const sg = new THREE.Group();
    sg.position.set(0, 0.028, -0.13); sg.rotation.x = -1.15;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.018), M.laptopB);
    lid.position.set(0, 0.14, 0); lid.castShadow = true; sg.add(lid);
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.24, 0.004), M.screen);
    scr.position.set(0, 0.14, 0.011); sg.add(scr);
    g.add(sg);
    box(0.12, 0.003, 0.08, M.silver, 0, 0.028, 0.08, g);
  }
  function buildPC(g) {
    box(0.18, 0.40, 0.36, M.plastic,           0,    0.20,  0,    g);
    box(0.02, 0.30, 0.01, ledMat(0x00ffcc),    0.09, 0.20,  0.185,g);
    box(0.26, 0.025,0.16, M.plastic,           0.55, 0.013, 0.04, g);
    box(0.05, 0.26, 0.05, M.metal,             0.55, 0.155, 0.04, g);
    box(0.70, 0.42, 0.045,M.plastic,           0.55, 0.505, 0.04, g);
    box(0.62, 0.35, 0.008,M.screen,            0.55, 0.505, 0.065,g);
    box(0.44, 0.02, 0.15, M.plastic,           0.55, 0.012, 0.26, g);
    box(0.08, 0.022,0.12, M.plastic,           0.85, 0.012, 0.24, g);
  }
  function buildOfficeChair(g) {
    const starY = 0.08;
    for (let i = 0; i < 5; i++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.045, 0.07), M.offChrome);
      arm.position.set(0, starY, 0);
      arm.rotation.y = (i / 5) * Math.PI * 2;
      arm.castShadow = true; g.add(arm);
      const wx = Math.sin((i / 5) * Math.PI * 2) * 0.27;
      const wz = Math.cos((i / 5) * Math.PI * 2) * 0.27;
      const ws = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 8), M.offChrome);
      ws.position.set(wx, starY - 0.04, wz); ws.rotation.z = Math.PI / 2;
      ws.castShadow = true; g.add(ws);
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12), M.offBlack);
      wh.position.set(wx, starY - 0.065, wz); wh.rotation.z = Math.PI / 2;
      wh.castShadow = true; g.add(wh);
    }
    cyl(0.045, 0.055, 0.12, 12, M.offChrome, 0, starY + 0.06,  0, g);
    cyl(0.032, 0.032, 0.32, 12, M.offChrome, 0, starY + 0.26,  0, g);
    cyl(0.028, 0.028, 0.10, 12, M.offBlack,  0, starY + 0.47,  0, g);
    box(0.28, 0.06, 0.24, M.offBlack, 0, starY + 0.55, 0, g);

    const seatY = starY + 0.62;
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.28, 0.08, 20), M.offSeat);
    seat.position.set(0, seatY, 0.02); seat.castShadow = true; g.add(seat);
    const seatRim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.045, 8, 20), M.offBlack);
    seatRim.position.set(0, seatY - 0.01, 0.02); seatRim.rotation.x = Math.PI / 2;
    seatRim.castShadow = true; g.add(seatRim);

    const armY = seatY + 0.01;
    [-0.28, 0.28].forEach(ax => {
      cyl(0.022, 0.022, 0.22, 8, M.offArm, ax, armY + 0.11, -0.02, g);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.22), M.offBlack);
      pad.position.set(ax, armY + 0.235, 0.04); pad.castShadow = true; g.add(pad);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 10, Math.PI), M.offArm);
      arc.position.set(ax, armY + 0.09, 0.12);
      arc.rotation.x = -Math.PI / 2; arc.rotation.z = ax > 0 ? Math.PI : 0;
      arc.castShadow = true; g.add(arc);
    });

    const backBaseY = seatY + 0.02;
    const bp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.38, 0.055), M.offBlack);
    bp.position.set(0, backBaseY + 0.19, -0.30); bp.castShadow = true; g.add(bp);
    [-0.13, 0.13].forEach(bx => {
      const bf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), M.offBlack);
      bf.position.set(bx, backBaseY + 0.46, -0.26);
      bf.rotation.z = bx > 0 ? -0.3 : 0.3; bf.castShadow = true; g.add(bf);
    });

    const backY = backBaseY + 0.55;
    const backZ = -0.32;
    box(0.50, 0.42, 0.04,  M.offBlack, 0, backY + 0.18, backZ,        g);
    box(0.40, 0.33, 0.015, M.offMesh,  0, backY + 0.19, backZ + 0.012,g);
    box(0.46, 0.07, 0.045, M.offBlack, 0, backY + 0.07, backZ - 0.005,g);
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.50, 10), M.offBlack);
    topBar.position.set(0, backY + 0.37, backZ); topBar.rotation.z = Math.PI / 2;
    topBar.castShadow = true; g.add(topBar);
    [-0.24, 0.24].forEach(bx => {
      const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), M.offBlack);
      sl.position.set(bx, backY + 0.18, backZ); sl.castShadow = true; g.add(sl);
    });
  }

  // Replicar la mesa larga con computadoras y sillas en 4 filas
  const numFilas = 4;
  const espacioFilas = 1.7; // Separación entre filas en Z
  const zInicial = -2.55;   // Posición inicial en Z (ajustar si es necesario)
  for (let fila = 0; fila < numFilas; fila++) {
    const zFila = zInicial + fila * espacioFilas;
    // Mesa larga
    const mesaLarga = new THREE.Group();
    box(6, 0.12, 0.85, M.wood, 0, 1.18, 0, mesaLarga); // tablero principal
    box(5.6, 0.04, 0.65, M.metal, 0, 0.97, -0.08, mesaLarga);
    box(5.8, 0.04, 0.04, M.metal, 0, 0.58, -0.38, mesaLarga);
    box(5.8, 0.04, 0.04, M.metal, 0, 0.58, 0.38, mesaLarga);
    // Patas y pies de goma
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const x = -2.8 + i * 5.6;
        const z = -0.38 + j * 0.76;
        box(0.08, 1.18, 0.08, M.metal, x, 0.59, z, mesaLarga);
        box(0.13, 0.04, 0.13, M.rubber, x, 0.02, z, mesaLarga);
      }
    }
    mesaLarga.position.set(0, 0, zFila);
    scene.add(mesaLarga);

    // PCs y sillas alineadas
    for (let i = 0; i < 5; i++) {
      const x = -2.4 + i * 1.2;
      // PC
      const pcGroup = new THREE.Group();
      buildPC(pcGroup);
      pcGroup.position.set(x, 1.22, zFila);
      scene.add(pcGroup);
      // Solo agregar sillas si NO es la primera fila (fila 0)
      if (fila !== 0) {
        const offChairGroup = new THREE.Group();
        buildOfficeChair(offChairGroup);
        offChairGroup.position.set(x, 0, zFila - 0.7);
        offChairGroup.rotation.y = Math.PI;
        scene.add(offChairGroup);
      }
    }
  }
}
