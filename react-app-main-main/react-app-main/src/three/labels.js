import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- Setup del renderer de etiquetas ---
export function setupLabelRenderer(container) {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(labelRenderer.domElement);
  return labelRenderer;
}

// --- Función para crear etiqueta ---
export function createRoomLabel(name, sub, icon, delaySeconds = 0) {
  const div = document.createElement('div');
  div.className = 'label';
  div.style.animationDelay = `${delaySeconds}s`;
  div.innerHTML = `
    <div class="card">
      <div class="scan"></div>
      <div class="room-icon">${icon}</div>
      <div class="room-name">${name}</div>
      <div class="room-sub">${sub}</div>
    </div>
    <div class="connector"></div>
  `;
  return new CSS2DObject(div);
}
