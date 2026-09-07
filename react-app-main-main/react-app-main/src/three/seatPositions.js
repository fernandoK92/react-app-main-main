import { ROOM_DEPTH } from './roomStructure';

const hD = ROOM_DEPTH / 2;

/* ============================================
   SEAT POSITIONS — compute 3D positions for 
   each seat index by room type
   ============================================ */

export function computeSeatPositions(type) {
  const positions = {};

  if (type === 'auditorio') {
    const aisleW = 1.8, startZ = -2.2, rowSp = 0.82, colSp = 0.58;
    let idx = 0;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 4; c++) {
        const x = -(aisleW / 2) - (3 - c) * colSp - colSp / 2;
        const z = startZ + r * rowSp;
        positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
        idx++;
      }
      for (let c = 0; c < 4; c++) {
        const x = (aisleW / 2) + c * colSp + colSp / 2;
        const z = startZ + r * rowSp;
        positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
        idx++;
      }
    }
  } else if (type === 'computo') {
    const rows = 4, cols = 5, startZ = -1.5, rowSp = 1.1, colSp = 0.8;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * colSp;
        const z = startZ + r * rowSp + 0.22;
        positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
        idx++;
      }
    }
  } else if (type === 'capacitacion') {
    const tablePos = [[-3.2, -1.5], [3.2, -1.5], [-3.2, 2.5], [3.2, 2.5]];
    let idx = 0;
    for (let t = 0; t < 4; t++) {
      const [tx, tz] = tablePos[t];
      for (let s = 0; s < 3; s++) {
        const cx = tx - 0.7 + s * 0.7;
        positions[idx] = { x: cx, y: 0.47, z: tz + 0.7, rotY: Math.PI };
        idx++;
      }
      for (let s = 0; s < 3; s++) {
        const cx = tx - 0.7 + s * 0.7;
        positions[idx] = { x: cx, y: 0.47, z: tz - 0.7, rotY: Math.PI };
        idx++;
      }
    }
  } else if (type === 'general') {
    const rows = 5, cols = 6, startZ = -1.5, rowSp = 1.1, colSp = 0.8;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * colSp;
        const z = startZ + r * rowSp + 0.22;
        positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
        idx++;
      }
    }
  }

  return positions;
}

export function computeSeatPositionsDivided() {
  const positions = {};

  // LEFT: Auditorio half (center at x=-4)
  const aisleW = 0.8, startZ = -2.2, rowSp = 0.82, colSp = 0.58, centerX = -4;
  let idx = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const x = centerX - (aisleW / 2) - (3 - c) * colSp - colSp / 2;
      const z = startZ + r * rowSp;
      positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
      idx++;
    }
    for (let c = 0; c < 4; c++) {
      const x = centerX + (aisleW / 2) + c * colSp + colSp / 2;
      const z = startZ + r * rowSp;
      positions[idx] = { x, y: 0.47, z, rotY: Math.PI };
      idx++;
    }
  }

  // RIGHT: Capacitación half (center at x=4)
  const tablePos = [[4 - 1.8, -1.5], [4 + 1.8, -1.5], [4 - 1.8, 2.5], [4 + 1.8, 2.5]];
  for (let t = 0; t < 4; t++) {
    const [tx, tz] = tablePos[t];
    for (let s = 0; s < 3; s++) {
      const cx = tx - 0.65 + s * 0.65;
      positions[idx] = { x: cx, y: 0.47, z: tz + 0.7, rotY: Math.PI };
      idx++;
    }
    for (let s = 0; s < 3; s++) {
      const cx = tx - 0.65 + s * 0.65;
      positions[idx] = { x: cx, y: 0.47, z: tz - 0.7, rotY: Math.PI };
      idx++;
    }
  }

  return positions;
}
