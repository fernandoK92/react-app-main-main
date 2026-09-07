import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { buildRoomStructure } from '../three/roomStructure';
import { addFurnitureForType } from '../three/furniture';

export default function PreviewCanvas({ canvasId, type }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 260;
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x4e5a6e);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 2.8, 7.8);
    camera.lookAt(0, 1.8, -3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Build full room structure
    buildRoomStructure(scene);
    addFurnitureForType(scene, type);

    // Initial render
    renderer.render(scene, camera);

    // Auto-rotation animation
    let angle = 0;
    function animate() {
      animIdRef.current = requestAnimationFrame(animate);
      angle += 0.003;
      const radius = 8.5;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 2.8;
      camera.lookAt(0, 1.5, -1);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      id={canvasId}
      className="preview-canvas"
    />
  );
}
