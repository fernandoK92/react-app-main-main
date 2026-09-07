import * as THREE from 'three';

// Tween simple para animar valores
function animateValue(obj, prop, from, to, duration = 600) {
  const start = performance.now();
  function animate(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    obj[prop] = from + (to - from) * elapsed;
    if (elapsed < 1) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

/* ============================================
   PANTALLA INTERACTIVA ZKTeco — modelo 3D
   
   USO en tu escena principal:
   
     import { buildPantallaInteractiva } from './pantallaInteractiva';
     
     // Posición ejemplo: al costado del podio en el escenario
     buildPantallaInteractiva(scene, {
       x: 4,      // posición X en la sala
       y: 0,      // Y = 0 → las ruedas tocan el suelo
       z: -4.0,   // posición Z (cerca de la pared frontal)
       rotY: 0,   // rotación en Y (radianes), 0 = mira hacia la audiencia
       imageUrl: '/mi-imagen.png'  // opcional
     });
   ============================================ */

export function buildPantallaInteractiva(scene, options = {}) {
  const {
    x = 0,
    y = 0,
    z = 0,
    rotY = 0,
    imageUrl = null,
  } = options;

  const group = new THREE.Group();
  group.name = 'pantalla_interactiva_zkteco';

  // ── Dimensiones ────────────────────────────────────────────
  const W  = 3.6;    // ancho pantalla  (aprox 65" a escala de sala 16m)
  const H  = 2.6;   // alto pantalla
  const D  = 0.055;  // profundidad cuerpo
  const mT = 0.045;  // grosor marco

  // ── Materiales ─────────────────────────────────────────────
  const marcoMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d35, roughness: 0.35, metalness: 0.75,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e2028, roughness: 0.4, metalness: 0.6,
  });
  const soporteMat = new THREE.MeshStandardMaterial({
    color: 0x1c1f27, roughness: 0.3, metalness: 0.85,
  });
  const ruedaMetMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, roughness: 0.4, metalness: 0.7,
  });
  const ruedaNegMat = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.85,
  });

  // ── Cuerpo principal ───────────────────────────────────────
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // ── Display (superficie de pantalla) ──────────────────────
  const scrW = W - mT * 2;
  const scrH = H - mT * 2;

  // Material inicial: apagado
  const scrMatInit = new THREE.MeshStandardMaterial({
    color: 0x050508, roughness: 0.04, emissive: new THREE.Color(0x000000), emissiveIntensity: 0.0
  });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(scrW, scrH), scrMatInit);
  screenMesh.name = 'pantalla_interactiva_mesh';
  screenMesh.position.z = D / 2 + 0.001;
  group.add(screenMesh);

  // Cargar imagen si se provee
  if (imageUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace    = THREE.SRGBColorSpace;
        texture.minFilter     = THREE.LinearFilter;
        texture.magFilter     = THREE.LinearFilter;
        texture.flipY         = true;
        screenMesh.material.dispose();
        screenMesh.material = new THREE.MeshStandardMaterial({
          map:               texture,
          roughness:         0.04,
          emissive:          new THREE.Color(0xffffff),
          emissiveMap:       texture,
          emissiveIntensity: 0.0,
        });
        screenMesh.material.needsUpdate = true;
        // Animación de encendido (fade-in de brillo)
        animateValue(screenMesh.material, 'emissiveIntensity', 0.0, 0.85, 700);
      },
      undefined,
      () => {
        // fallback: pantalla negra
        screenMesh.material = new THREE.MeshStandardMaterial({
          color: 0x050508, roughness: 0.04,
        });
      }
    );
  } else {
    // Si no hay imagen, animar el brillo del negro a un gris claro
    screenMesh.material.emissive = new THREE.Color(0xffffff);
    animateValue(screenMesh.material, 'emissiveIntensity', 0.0, 0.5, 700);
  }

  // ── Marco frontal ──────────────────────────────────────────
  const mZ = D / 2 + 0.016;
  const addBox = (w, h, d, px, py, pz, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    group.add(m);
  };
  addBox(W,         mT,          0.03, 0,             H/2 - mT/2,  mZ, marcoMat); // top
  addBox(W,         mT,          0.03, 0,            -H/2 + mT/2,  mZ, marcoMat); // bottom
  addBox(mT,        H - mT*2,   0.03, -W/2 + mT/2,  0,            mZ, marcoMat); // left
  addBox(mT,        H - mT*2,   0.03,  W/2 - mT/2,  0,            mZ, marcoMat); // right

  // ── Cámara superior central ────────────────────────────────
  const camMat = new THREE.MeshStandardMaterial({ color: 0x18181f, roughness: 0.2, metalness: 0.5 });
  addBox(0.1, 0.026, 0.035, 0, H/2 + 0.013, D/2 - 0.008, camMat);

  const lensGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.018, 12);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.05, metalness: 0.4 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, H/2 + 0.013, D/2 + 0.009);
  group.add(lens);

  // LED verde indicador
  const ledMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.004, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff55 })
  );
  ledMesh.position.set(0.053, H/2 + 0.013, D/2 + 0.018);
  group.add(ledMesh);

  // ── Barra inferior / bandeja ───────────────────────────────
  addBox(W * 0.84, 0.038, 0.11, 0, -H/2 - 0.019, -0.01, marcoMat);

  // ── Logo ZKTeco (placa metálica inferior) ──────────────────
  const logoMat = new THREE.MeshStandardMaterial({ color: 0x778888, roughness: 0.3, metalness: 0.8 });
  addBox(0.16, 0.018, 0.003, 0, -H/2 + 0.009, D/2 + 0.002, logoMat);

  // ── Puertos USB/HDMI (lado derecho) ───────────────────────
  const pMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.012, 0.02), pMat);
    p.position.set(W/2 + 0.003, -H/2 + 0.08 + i * 0.028, 0.008 - i * 0.004);
    group.add(p);
  }

  // ── Botones de encendido (lado derecho) ───────────────────
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.5 });
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 10), btnMat);
    btn.rotation.z = Math.PI / 2;
    btn.position.set(W/2 + 0.005, -H/2 + 0.055 + i * 0.032, 0.004);
    group.add(btn);
  }

  // ── SOPORTE EN "A" ─────────────────────────────────────────
  const sH = 0.62;   // altura soporte (desde base pantalla al suelo)
  const sW = 0.95;   // ancho base soporte
  const sT = 0.028;  // grosor tubos

  // Columna central vertical
  addBox(sT, sH * 0.48, sT, 0, -H/2 - sH*0.24, 0, soporteMat);

  // Patas diagonales izquierda y derecha
  buildDiagLeg(group, 0, -H/2, -sW/2, -H/2 - sH, sT, soporteMat);
  buildDiagLeg(group, 0, -H/2,  sW/2, -H/2 - sH, sT, soporteMat);

  // Barra base horizontal
  addBox(sW + sT*2, sT, sT*2.8, 0, -H/2 - sH + sT/2, 0, soporteMat);

  // Barra media (triangulación)
  addBox(sW * 0.52, sT, sT*1.8, 0, -H/2 - sH*0.5, 0, soporteMat);

  // ── Ruedas (4) ─────────────────────────────────────────────
  const wPos = [
    [-sW/2 - 0.032, -H/2 - sH + 0.004],
    [-sW/2 + 0.055, -H/2 - sH + 0.004],
    [ sW/2 - 0.055, -H/2 - sH + 0.004],
    [ sW/2 + 0.032, -H/2 - sH + 0.004],
  ];
  wPos.forEach(([wx, wy]) => buildWheel(group, wx, wy, ruedaMetMat, ruedaNegMat));

  // ── Posicionar el grupo en la sala ─────────────────────────
  // El centro del grupo está en el medio de la pantalla.
  // Para que las ruedas toquen el suelo (y=0), subimos H/2 + sH
  group.position.set(x, y + H/2 + sH, z);
  group.rotation.y = rotY;

  scene.add(group);
  return group;
}

// ── Helpers internos ───────────────────────────────────────────────────────

function buildDiagLeg(grp, x1, y1, x2, y2, thickness, mat) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx);
  const geo = new THREE.BoxGeometry(len, thickness, thickness * 2.2);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((x1+x2)/2, (y1+y2)/2, 0);
  m.rotation.z = angle;
  m.castShadow = true;
  grp.add(m);
}

function buildWheel(grp, x, y, metalMat, tireMat) {
  const r = 0.032, w = 0.022;

  // Horquilla
  const hMat = new THREE.MeshStandardMaterial({ color: 0x888898, roughness: 0.4, metalness: 0.65 });
  const hq = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.048, 0.014), hMat);
  hq.position.set(x, y + 0.024, 0);
  grp.add(hq);

  // Neumático negro
  const torus = new THREE.Mesh(new THREE.TorusGeometry(r, w * 0.42, 8, 20), tireMat);
  torus.rotation.y = Math.PI / 2;
  torus.position.set(x, y, 0);
  grp.add(torus);

  // Rin metálico
  const rin = new THREE.Mesh(new THREE.CylinderGeometry(r*0.5, r*0.5, w, 12), metalMat);
  rin.rotation.z = Math.PI / 2;
  rin.position.set(x, y, 0);
  grp.add(rin);

  // Perno central
  const bolt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, w + 0.003, 6),
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.9 })
  );
  bolt.rotation.z = Math.PI / 2;
  bolt.position.set(x, y, 0);
  grp.add(bolt);
}

/* ============================================
   HELPER: cambia la imagen de la pantalla
   después de haberla construido
   ============================================ */
export function updatePantallaInteractivaTextura(scene, imageUrl) {
  const mesh = scene.getObjectByName('pantalla_interactiva_mesh');
  if (!mesh) return;

  if (!imageUrl) {
    mesh.material.dispose();
    mesh.material = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.04 });
    mesh.material.needsUpdate = true;
    return;
  }

  const loader = new THREE.TextureLoader();
  loader.load(imageUrl, (texture) => {
    texture.colorSpace    = THREE.SRGBColorSpace;
    texture.minFilter     = THREE.LinearFilter;
    texture.magFilter     = THREE.LinearFilter;
    texture.flipY         = true;
    mesh.material.dispose();
    mesh.material = new THREE.MeshStandardMaterial({
      map:               texture,
      roughness:         0.04,
      emissive:          new THREE.Color(0xffffff),
      emissiveMap:       texture,
      emissiveIntensity: 0.85,
    });
    mesh.material.needsUpdate = true;
  });
}
