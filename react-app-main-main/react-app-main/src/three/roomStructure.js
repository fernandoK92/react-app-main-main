import * as THREE from 'three';

/* ============================================
   ROOM STRUCTURE — walls, floor, ceiling, 
   lighting, platform, screen, projector, 
   speakers, window, plants
   ============================================ */

export const ROOM_WIDTH = 16;
export const ROOM_DEPTH = 11;
export const WALL_HEIGHT = 4.2;

export const COMPUTO_ROOM_WIDTH_TOP = 4.5;
export const COMPUTO_ROOM_WIDTH_BOTTOM = 4.5;
export const COMPUTO_ROOM_DEPTH = 4.5;

export function getRoomDimensions(type) {
  if (type === 'computo') {
    return {
      widthTop: COMPUTO_ROOM_WIDTH_TOP,
      widthBottom: COMPUTO_ROOM_WIDTH_BOTTOM,
      depth: COMPUTO_ROOM_DEPTH,
      height: 3.2
    };
  }
}

export function buildRoomStructure(scene, screenImageUrl = null) {
  const RW = ROOM_WIDTH, RD = ROOM_DEPTH, WH = WALL_HEIGHT;
  const hW = RW / 2, hD = RD / 2;

  scene.background = new THREE.Color(0x4e5a6e);

  // ========== LIGHTING ==========
  scene.add(new THREE.AmbientLight(0xe8e2f0, 0.55));
  scene.add(new THREE.HemisphereLight(0xd0d8f0, 0xb8a880, 0.25));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const lx = (col - 1.5) * 3.5;
      const lz = -4.0 + row * 3.5;

      const sl = new THREE.SpotLight(0xfff5d0, 80, 12, Math.PI / 5.5, 0.75, 1.6);
      sl.position.set(lx, WH - 0.06, lz);
      sl.target.position.set(lx, 0, lz);
      sl.castShadow = true;
      sl.shadow.mapSize.set(256, 256);
      sl.shadow.bias = -0.002;
      scene.add(sl);
      scene.add(sl.target);

      const fixGeo = new THREE.CircleGeometry(0.14, 12);
      const fixMat = new THREE.MeshBasicMaterial({ color: 0xfffde8 });
      const fix = new THREE.Mesh(fixGeo, fixMat);
      fix.rotation.x = Math.PI / 2;
      fix.position.set(lx, WH - 0.008, lz);
      scene.add(fix);

      const ringGeo = new THREE.RingGeometry(0.14, 0.19, 16);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(lx, WH - 0.006, lz);
      scene.add(ring);
    }
  }

  const screenLight = new THREE.RectAreaLight(0xffffff, 2.5, 6, 3.5);
  screenLight.position.set(0, WH * 0.56, -hD + 0.15);
  screenLight.lookAt(0, WH * 0.56, 0);
  scene.add(screenLight);

  // ========== FLOOR ==========
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x787880, roughness: 0.92, metalness: 0.02 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const aisleM = new THREE.MeshStandardMaterial({ color: 0x999aa2, roughness: 0.88 });
  const centerAisle = new THREE.Mesh(new THREE.PlaneGeometry(1.8, RD), aisleM);
  centerAisle.rotation.x = -Math.PI / 2;
  centerAisle.position.set(0, 0.003, 0);
  scene.add(centerAisle);

  [[-hW + 0.8], [hW - 0.8]].forEach(([sx]) => {
    const sa = new THREE.Mesh(new THREE.PlaneGeometry(1.4, RD), aisleM);
    sa.rotation.x = -Math.PI / 2;
    sa.position.set(sx, 0.003, 0);
    scene.add(sa);
  });

  const rearAisle = new THREE.Mesh(new THREE.PlaneGeometry(RW, 1.4), aisleM);
  rearAisle.rotation.x = -Math.PI / 2;
  rearAisle.position.set(0, 0.003, hD - 0.7);
  scene.add(rearAisle);

  // ========== CEILING ==========
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x4e5a6e, roughness: 0.8 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW + 0.1, RD + 0.1), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = WH;
  scene.add(ceil);

  const panelGridM = new THREE.MeshStandardMaterial({ color: 0x5a6678, metalness: 0.05 });
  for (let z = -hD + 0.6; z < hD; z += 0.6) {
    const ln = new THREE.Mesh(new THREE.BoxGeometry(RW - 0.5, 0.005, 0.018), panelGridM);
    ln.position.set(0, WH - 0.003, z);
    scene.add(ln);
  }
  for (let x = -hW + 0.8; x < hW; x += 0.8) {
    const ln = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.005, RD - 0.5), panelGridM);
    ln.position.set(x, WH - 0.003, 0);
    scene.add(ln);
  }

  // ========== WALLS ==========
  const wallBeige = new THREE.MeshStandardMaterial({ color: 0xd8ccaa, roughness: 0.62 });
  const wallFront = new THREE.MeshStandardMaterial({ color: 0xe0d4b2, roughness: 0.58 });
  const grooveM = new THREE.MeshStandardMaterial({ color: 0xc8bc96 });

  const fW = new THREE.Mesh(new THREE.PlaneGeometry(RW, WH), wallFront);
  fW.position.set(0, WH / 2, -hD);
  scene.add(fW);
  for (let x = -hW + 2; x < hW; x += 2.0) {
    const gv = new THREE.Mesh(new THREE.BoxGeometry(0.015, WH - 0.3, 0.006), grooveM);
    gv.position.set(x, WH / 2, -hD + 0.006);
    scene.add(gv);
  }
  const dadoFr = new THREE.Mesh(new THREE.BoxGeometry(RW, 0.025, 0.008), grooveM);
  dadoFr.position.set(0, WH * 0.4, -hD + 0.006);
  scene.add(dadoFr);

  const lW = new THREE.Mesh(new THREE.PlaneGeometry(RD, WH), wallBeige);
  lW.position.set(-hW, WH / 2, 0);
  lW.rotation.y = Math.PI / 2;
  scene.add(lW);
  for (let z = -hD + 2; z < hD; z += 2.0) {
    const gv = new THREE.Mesh(new THREE.BoxGeometry(0.006, WH - 0.3, 0.015), grooveM);
    gv.position.set(-hW + 0.006, WH / 2, z);
    scene.add(gv);
  }
  const dadoL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.025, RD), grooveM);
  dadoL.position.set(-hW + 0.006, WH * 0.4, 0);
  scene.add(dadoL);

  const rW = new THREE.Mesh(new THREE.PlaneGeometry(RD, WH), wallBeige);
  rW.position.set(hW, WH / 2, 0);
  rW.rotation.y = -Math.PI / 2;
  scene.add(rW);
  for (let z = -hD + 2; z < hD; z += 2.0) {
    const gv = new THREE.Mesh(new THREE.BoxGeometry(0.006, WH - 0.3, 0.015), grooveM);
    gv.position.set(hW - 0.006, WH / 2, z);
    scene.add(gv);
  }
  const dadoR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.025, RD), grooveM);
  dadoR.position.set(hW - 0.006, WH * 0.4, 0);
  scene.add(dadoR);

  const bW = new THREE.Mesh(new THREE.PlaneGeometry(RW, WH), wallBeige);
  bW.position.set(0, WH / 2, hD);
  bW.rotation.y = Math.PI;
  scene.add(bW);

  // ========== WALL-CEILING COVE / TRIM ==========
  const coveM = new THREE.MeshStandardMaterial({ color: 0xece6d8, roughness: 0.5 });
  const coveH = 0.22, coveD = 0.22;
  [
    [0, WH - coveH / 2, -hD + coveD / 2, RW, coveH, coveD],
    [-hW + coveD / 2, WH - coveH / 2, 0, coveD, coveH, RD],
    [hW - coveD / 2, WH - coveH / 2, 0, coveD, coveH, RD],
    [0, WH - coveH / 2, hD - coveD / 2, RW, coveH, coveD],
  ].forEach(([x, y, z, tw, th, td]) => {
    const cove = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), coveM);
    cove.position.set(x, y, z);
    scene.add(cove);
  });

  // ========== FRONT PLATFORM ========== 
  const platW = RW - 1.0, platD = 2.6, platH = 0.15;
  const platMat = new THREE.MeshStandardMaterial({ color: 0xc8a248, roughness: 0.42 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(platW, platH, platD), platMat);
  platform.position.set(0, platH / 2, -hD + platD / 2);
  platform.receiveShadow = true;
  platform.castShadow = true;
  scene.add(platform);

  const edgeM = new THREE.MeshStandardMaterial({ color: 0xaa8830 });
  const platEdge = new THREE.Mesh(new THREE.BoxGeometry(platW, platH, 0.04), edgeM);
  platEdge.position.set(0, platH / 2, -hD + platD + 0.02);
  scene.add(platEdge);

  const grainM = new THREE.MeshStandardMaterial({ color: 0xb09030 });
  for (let x = -platW / 2 + 0.3; x < platW / 2; x += 0.35) {
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.002, platD - 0.1), grainM);
    gr.position.set(x, platH + 0.001, -hD + platD / 2);
    scene.add(gr);
  }
  // Podio y escritorio removidos de esta posición según indicación del usuario

  // ========== PROJECTION SCREEN ==========
  // ── FIX PRINCIPAL ──
  // El problema anterior: el mesh se creaba DENTRO del callback async de loader.load(),
  // lo que causaba que a veces no se renderizara correctamente o llegara tarde.
  //
  // SOLUCIÓN: crear el mesh SINCRÓNICAMENTE con material negro (pantalla apagada),
  // agregarlo a la escena de inmediato, y solo actualizar el .material cuando
  // la textura termine de cargar. Así Three.js siempre tiene el mesh listo.

  const scrW = 6.5, scrH = 3.8, scrY = WH * 0.55;

  // Paso 1: mesh con material placeholder (negro = pantalla apagada)
  const scrMatInit = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.08,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(scrW, scrH), scrMatInit);
  screen.name = 'pantalla_mesh';
  // PlaneGeometry mira hacia +Z por defecto → la pantalla mira hacia la audiencia ✓
  screen.position.set(0, scrY, -hD + 0.12);
  scene.add(screen); // ← ya está en la escena antes de que cargue la imagen

  // Marco negro (sincrónico también)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9 });
  const bw = 0.13;
  [
    { w: scrW + bw * 2, h: bw,            x: 0,                  y: scrY + scrH / 2 + bw / 2 },
    { w: scrW + bw * 2, h: bw,            x: 0,                  y: scrY - scrH / 2 - bw / 2 },
    { w: bw,            h: scrH + bw * 2, x: -scrW / 2 - bw / 2, y: scrY },
    { w: bw,            h: scrH + bw * 2, x:  scrW / 2 + bw / 2, y: scrY },
  ].forEach((f) => {
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), frameMat);
    fr.position.set(f.x, f.y, -hD + 0.115);
    scene.add(fr);
  });

  // Paso 2: cargar textura y solo reemplazar el material del mesh existente
  const imageToLoad = screenImageUrl || '/centrosur.png';
  const loader = new THREE.TextureLoader();
  loader.load(
    imageToLoad,
    (texture) => {
      // Éxito: aplicar imagen en la pantalla
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter  = THREE.LinearFilter;
      texture.magFilter  = THREE.LinearFilter;
      texture.flipY      = true;

      // Reemplazar solo el material — el mesh ya está en la escena
      screen.material.dispose();
      screen.material = new THREE.MeshStandardMaterial({
        map:              texture,
        roughness:        0.05,
        emissive:         new THREE.Color(0xffffff),
        emissiveMap:      texture,
        emissiveIntensity: 0.9, // brillo de pantalla encendida
      });
      screen.material.needsUpdate = true;
    },
    undefined,
    (err) => {
      // Fallback: pantalla blanca si no carga la imagen
      console.warn('[roomStructure] No se pudo cargar:', imageToLoad, err);
      screen.material.dispose();
      screen.material = new THREE.MeshStandardMaterial({
        color:             0xf0f0f0,
        roughness:         0.08,
        emissive:          new THREE.Color(0xdddddd),
        emissiveIntensity: 0.1,
      });
      screen.material.needsUpdate = true;
    }
  );

  // ========== CEILING PROJECTOR ==========
  const proyectorGroup = new THREE.Group();
  proyectorGroup.name = 'equipment_proyector';
  const pjM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
  const pjPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8), pjM);
  pjPole.position.set(0, WH - 0.225, -3.2);
  proyectorGroup.add(pjPole);
  const pjMount = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.22), pjM);
  pjMount.position.set(0, WH - 0.03, -3.2);
  proyectorGroup.add(pjMount);
  const pjBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.38), pjM);
  pjBody.position.set(0, WH - 0.55, -3.2);
  pjBody.castShadow = true;
  proyectorGroup.add(pjBody);
  const lensM = new THREE.MeshStandardMaterial({ color: 0x4466bb, emissive: 0x2244aa, emissiveIntensity: 0.2 });
  const pjLens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), lensM);
  pjLens.position.set(0, WH - 0.57, -3.39);
  proyectorGroup.add(pjLens);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.04,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const beamGeo = new THREE.ConeGeometry(1.8, 3.0, 16, 1, true);
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.rotation.x = Math.PI / 2 - 0.18;
  beam.position.set(0, WH - 1.0, -4.7);
  proyectorGroup.add(beam);
  scene.add(proyectorGroup);

  // ========== WALL-MOUNTED SPEAKERS ==========
  const bocinasGroup = new THREE.Group();
  bocinasGroup.name = 'equipment_bocinas_pared';
  const wsMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.35 });
  [[-hW + 0.6, 3.1, -hD + 0.12, 0.15], [hW - 0.6, 3.1, -hD + 0.12, -0.15]].forEach(([sx, sy, sz, ry]) => {
    const ws = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.18), wsMat);
    ws.position.set(sx, sy, sz);
    ws.rotation.y = ry;
    bocinasGroup.add(ws);
    const grMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.5 });
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.38), grMat);
    gr.position.set(sx, sy, sz + 0.092);
    gr.rotation.y = ry;
    bocinasGroup.add(gr);
  });
  scene.add(bocinasGroup);

  // ========== WINDOW (right wall) ==========
  const wnW = 2.6, wnH = 3.2, wnZ = 2.5, wnY = 2.2;
  const wnFrameM = new THREE.MeshStandardMaterial({ color: 0xe0ddd5 });
  const wnF = new THREE.Mesh(new THREE.PlaneGeometry(wnW + 0.35, wnH + 0.35), wnFrameM);
  wnF.position.set(hW - 0.01, wnY, wnZ);
  wnF.rotation.y = -Math.PI / 2;
  scene.add(wnF);

  const glassM = new THREE.MeshStandardMaterial({
    color: 0x8ac0ee, roughness: 0.06, transparent: true, opacity: 0.4,
    emissive: 0x5599cc, emissiveIntensity: 0.12,
  });
  const pnW2 = wnW / 4 - 0.06, pnH2 = wnH / 3 - 0.06;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const pz = wnZ + (col - 1.5) * (wnW / 4);
      const py = wnY + (row - 1) * (wnH / 3);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(pnW2, pnH2), glassM);
      pane.position.set(hW - 0.008, py, pz);
      pane.rotation.y = -Math.PI / 2;
      scene.add(pane);
    }
  }

  const mullM = new THREE.MeshStandardMaterial({ color: 0xd0ccbe });
  for (let col = 1; col < 4; col++) {
    const mz = wnZ + (col - 2) * (wnW / 4);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.015, wnH, 0.03), mullM);
    m.position.set(hW - 0.005, wnY, mz);
    scene.add(m);
  }
  for (let row = 1; row < 3; row++) {
    const my = wnY + (row - 1.5) * (wnH / 3);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, wnW), mullM);
    m.position.set(hW - 0.005, my, wnZ);
    scene.add(m);
  }

  const winLight = new THREE.RectAreaLight(0xaaddff, 1.5, wnW, wnH);
  winLight.position.set(hW - 0.2, wnY, wnZ);
  winLight.rotation.y = -Math.PI / 2;
  scene.add(winLight);

  // ========== POTTED PLANTS ==========
  addPlant(scene, -hW + 1.3, -hD + 3.2);
  addPlant(scene, hW - 1.3, -hD + 3.2);
}

function addPlant(scene, x, z) {
  const g = new THREE.Group();
  const potM = new THREE.MeshStandardMaterial({ color: 0xf2f0e8, roughness: 0.5 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.19, 0.45, 12), potM);
  pot.position.set(0, 0.225, 0);
  pot.castShadow = true;
  g.add(pot);

  const soilM = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), soilM);
  soil.rotation.x = -Math.PI / 2;
  soil.position.set(0, 0.45, 0);
  g.add(soil);

  const lfM  = new THREE.MeshStandardMaterial({ color: 0x2a7830, roughness: 0.7 });
  const lfM2 = new THREE.MeshStandardMaterial({ color: 0x358538, roughness: 0.65 });
  [
    [0, 0.72, 0, 0.28, lfM], [-0.12, 0.88, 0.1, 0.2, lfM2], [0.14, 0.85, -0.08, 0.19, lfM],
    [-0.08, 1.0, -0.1, 0.17, lfM2], [0.1, 0.98, 0.08, 0.16, lfM], [0, 1.08, 0, 0.15, lfM2],
    [-0.18, 0.78, -0.05, 0.15, lfM], [0.16, 0.75, 0.1, 0.14, lfM2],
  ].forEach(([lx, ly, lz, r, mat]) => {
    const lf = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 7), mat);
    lf.position.set(lx, ly, lz);
    lf.castShadow = true;
    g.add(lf);
  });

  g.position.set(x, 0, z);
  scene.add(g);
}

/* ============================================
   HELPER: actualiza la textura de la pantalla
   en caliente sin reconstruir toda la sala.
   ============================================ */
export function updateScreenTexture(scene, mediaUrl) {
  const pantalla = scene.getObjectByName('pantalla_mesh');
  if (!pantalla) return;

  // Si no hay media, pantalla blanca
  if (!mediaUrl) {
    pantalla.material.dispose();
    pantalla.material = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0, roughness: 0.08,
      emissive: new THREE.Color(0xdddddd), emissiveIntensity: 0.1,
    });
    pantalla.material.needsUpdate = true;
    return;
  }

  // Si es un video
  if (mediaUrl.endsWith('.mp4')) {
    // Elimina video anterior si existe
    if (pantalla.material.map && pantalla.material.map instanceof THREE.VideoTexture) {
      if (pantalla.material.map.image && pantalla.material.map.image.pause) {
        pantalla.material.map.image.pause();
      }
      pantalla.material.map.dispose();
    }
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.style.display = 'none';
    document.body.appendChild(video);
    video.play();
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    pantalla.material.dispose();
    pantalla.material = new THREE.MeshStandardMaterial({
      map: videoTexture,
      roughness: 0.05,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: videoTexture,
      emissiveIntensity: 0.9,
    });
    pantalla.material.needsUpdate = true;
    return;
  }

  // Si es una imagen
  const loader = new THREE.TextureLoader();
  loader.load(mediaUrl, (texture) => {
    texture.colorSpace   = THREE.SRGBColorSpace;
    texture.minFilter    = THREE.LinearFilter;
    texture.magFilter    = THREE.LinearFilter;
    texture.flipY        = true;
    pantalla.material.dispose();
    pantalla.material = new THREE.MeshStandardMaterial({
      map:               texture,
      roughness:         0.05,
      emissive:          new THREE.Color(0xffffff),
      emissiveMap:       texture,
      emissiveIntensity: 0.9,
    });
    pantalla.material.needsUpdate = true;
  });
}