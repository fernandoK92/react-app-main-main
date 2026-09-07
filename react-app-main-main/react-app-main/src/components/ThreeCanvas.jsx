import { updateScreenTexture } from '../three/roomStructure';
import { buildPantallaInteractiva } from '../three/pantallaInteractiva';
import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildRoomStructure } from '../three/roomStructure';
import { addFurnitureForType } from '../three/furniture';
import { createPartitionWall } from '../three/partitionWall';
import { computeSeatPositions, computeSeatPositionsDivided } from '../three/seatPositions';
import { useState } from 'react';
import { updatePartitionWallPosition } from '../three/partitionWall';
import { createDeskSet } from '../three/desk-set';
import { addPodiumDesk } from '../three/furniture';
export default function ThreeCanvas({
  roomType,         // 'general' | 'computo' | 'd
  // ivided' etc.
  partitionPercent, // 0-100 (only for divisible)
  selectedSeats,    // Set<number>
  occupiedSeats,    // number[]
  equipmentVisibility, // { proyector: bool, pantalla: bool, ... }
}) {
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  // Estado para objetos editables y selección
  const [editableObjects, setEditableObjects] = useState([]); // [{id, type, object3D}]
  const [selectedId, setSelectedId] = useState(null);

  // Marcar todos los muebles existentes como editables al entrar en modo edición
  useEffect(() => {
    if (!editMode || !sceneRef.current) return;
    // Nombres de objetos fijos que NO deben ser editables
    const fixedNames = ['wall', 'floor', 'ceiling', 'platform', 'screen', 'pantalla_mesh', 'partition', 'window', 'plant', 'cove', 'dado', 'groove'];
    const found = [];
    sceneRef.current.traverse(obj => {
      if ((obj.type === 'Group' || obj.type === 'Mesh') && obj.visible) {
        // No marcar como editable si es parte de la estructura fija
        if (!fixedNames.some(n => (obj.name && obj.name.toLowerCase().includes(n)))) {
          if (!obj.userData.editable) {
            obj.userData.editable = true;
            obj.userData.id = obj.userData.id || (Date.now() + Math.random());
            obj.userData.type = obj.userData.type || (obj.name || obj.type);
          }
          found.push({ id: obj.userData.id, type: obj.userData.type, object3D: obj });
        }
      }
    });
    setEditableObjects(prev => {
      // Evitar duplicados
      const ids = new Set(prev.map(o => o.id));
      return [...prev, ...found.filter(o => !ids.has(o.id))];
    });
    // eslint-disable-next-line
  }, [editMode]);
  // (Animaciones flotantes deshabilitadas)
  // Actualiza la textura de la pantalla según el estado del proyector
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || equipmentVisibility == null) return;
    if (equipmentVisibility.proyector) {
      updateScreenTexture(scene, '/centrosur_animation.mp4');
    } else {
      updateScreenTexture(scene, null);
    }
  }, [equipmentVisibility?.proyector]);

  // Pantalla Interactiva: add/remove model when toggled
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || equipmentVisibility == null) return;
    // Remove previous pantalla interactiva if exists
    const prev = scene.getObjectByName('pantalla_interactiva_zkteco');
    if (prev) {
      scene.remove(prev);
    }
    if (equipmentVisibility.pantalla) {
      // Add pantalla interactiva at default position (next to podium)
      buildPantallaInteractiva(scene, {
        x: 0, // centro
        y: 0,
        z: -4.7, // sobre la tarima, cerca de la pared frontal
        rotY: 0,
        imageUrl: '/pantalla interactiva.png'
      });
    }
  }, [equipmentVisibility?.pantalla]);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animIdRef = useRef(null);
  const personsRef = useRef({});    // seatIdx -> THREE.Group
  const wallRef = useRef(null);
  const seatPosRef = useRef({});
  const prevSelectedRef = useRef(new Set());
  const prevRoomTypeRef = useRef(null);
  const [imgTexture, setImgTexture] = useState(null);

  // Dispose all person meshes (no-op, persons removed)
  const clearAllPersons = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    Object.keys(personsRef.current).forEach((key) => {
      const idx = parseInt(key);
      const mesh = personsRef.current[idx];
      if (mesh) {
        scene.remove(mesh);
      }
    });
    personsRef.current = {};
  }, []);

  // Remove partition wall
  const removeWall = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene || !wallRef.current) return;
    scene.remove(wallRef.current);
    wallRef.current = null;
  }, []);


  // Referencia al video
  const videoRef = useRef(null);

  // --- Integración de Drag & Drop ---

  function handleAddPodium() {
    if (sceneRef.current && editMode) {
      // Podio simple
      const podium = new THREE.Group();
      addPodiumDesk(podium, 0, 0);
      podium.userData.editable = true;
      podium.userData.type = 'podium';
      podium.userData.id = Date.now() + Math.random();
      sceneRef.current.add(podium);
      setEditableObjects(prev => [...prev, { id: podium.userData.id, type: 'podium', object3D: podium }]);
    }
  }
  // Puedes agregar más tipos aquí (silla, computadora, etc.)

  // --- Selección de objetos ---
  function handleSelectObject(id) {
    setSelectedId(id);
  }

  // --- Rotar objeto seleccionado ---
  function handleRotateSelected(angle) {
    const obj = editableObjects.find(o => o.id === selectedId);
    if (obj) {
      obj.object3D.rotation.y = angle;
    }
  }

  // --- Eliminar objeto seleccionado ---
  function handleDeleteSelected() {
    const obj = editableObjects.find(o => o.id === selectedId);
    if (obj && sceneRef.current) {
      sceneRef.current.remove(obj.object3D);
      setEditableObjects(prev => prev.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  }

  // Full scene rebuild
  const buildScene = useCallback((type) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cancel previous animation
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }

    // Dispose previous renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    clearAllPersons();
    wallRef.current = null;

    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 2.8, 7.8);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

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
    // (No agregar CSS2DRenderer ni etiquetas flotantes)

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, -1);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = 0.3;
    controls.minDistance = 2;
    controls.maxDistance = 14;
    controls.enablePan = false;
    controls.update();
    controlsRef.current = controls;

    // Build room structure (walls, floor, ceiling, etc.)
    buildRoomStructure(scene);
    // (No agregar etiquetas flotantes)


    // Add partition wall for certain room types
    console.log('[DEBUG] type:', type, 'partitionPercent:', partitionPercent);
    // Solo agregar la pared divisoria si NO es la sala de cómputo
    if (type !== 'computo') {
      // Siempre mostrar la pared divisoria al centro en estos modos
      // Crear la pared UNA sola vez y solo moverla
      if (!wallRef.current) {
        const wall = createPartitionWall();
        scene.add(wall);
        wallRef.current = wall;
        console.log('[DEBUG] Pared divisoria creada y agregada a la escena:', wall);
      }
      // Mover la pared según el modo
      if (type === 'divided' || type === 'general') {
        const percent = type === 'divided' ? 50 : 0; // 50 = centro
        updatePartitionWallPosition(wallRef.current, percent);
        console.log('[DEBUG] updatePartitionWallPosition:', percent, 'x:', wallRef.current.position.x);
      }
    }

    // Add furniture for this type
    addFurnitureForType(scene, type);

    // Proyectar imagen en pantalla solo cuando cambia el estado del proyector
    let imgTexture = null;
    const loader = new THREE.TextureLoader();
    loader.load(
      '/centrosur.png',
      (texture) => {
        imgTexture = texture;
        setTimeout(() => {
          const screenObj = scene.getObjectByName('equipment_pantalla');
          let screenMesh = null;
          if (screenObj) {
            screenObj.traverse((child) => {
              if (child.isMesh && child.geometry.type === 'PlaneGeometry') {
                screenMesh = child;
              }
            });
          }
          if (!screenMesh) return;
          if (equipmentVisibility?.proyector) {
            screenMesh.material = new THREE.MeshBasicMaterial({
              map: imgTexture,
              color: 0xffffff,
              side: THREE.DoubleSide
            });
            screenMesh.material.needsUpdate = true;
            screenMesh.visible = true;
          } else {
            screenMesh.material = new THREE.MeshStandardMaterial({
              color: 0xfafafa, roughness: 0.08, emissive: 0xf5f5f5, emissiveIntensity: 0.04,
              side: THREE.DoubleSide,
            });
            screenMesh.material.needsUpdate = true;
          }
        }, 300);
      },
      (err) => {
        console.error('Error cargando la imagen centrosur.png', err);
      }
    );

    // Compute seat positions
    if (type === 'divided') {
      seatPosRef.current = computeSeatPositionsDivided();
    } else {
      seatPosRef.current = computeSeatPositions(type);
    }

    // Initial render
    renderer.render(scene, camera);

    // Animation loop
    function animate() {
      animIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      // (No renderizar etiquetas flotantes)
    }
    animate();
  }, [clearAllPersons]);

  // Build scene when roomType changes
  useEffect(() => {
    if (!roomType) return;

    buildScene(roomType);
    prevRoomTypeRef.current = roomType;

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = null;
      }
      clearAllPersons();
      removeWall();
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [roomType, buildScene, clearAllPersons, removeWall]);

  // Add occupied persons when occupiedSeats or roomType change
  // (Eliminado) No manejar personas ocupadas

  // (Eliminado) No manejar personas seleccionadas

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      // const labelRenderer = null;
      if (!canvas || !camera || !renderer) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        // (No resize de labelRenderer)
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle equipment visibility toggles
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !equipmentVisibility) return;

    const equipNames = [
      'equipment_proyector',
      'equipment_pantalla',
      'equipment_bocinas_pared',
      'equipment_podio',
      'equipment_bocinas_tripode',
    ];

    equipNames.forEach((name) => {
      const key = name.replace('equipment_', '');
      const obj = scene.getObjectByName(name);
      if (obj) {
        obj.visible = equipmentVisibility[key] !== false;
      }
    });
  }, [equipmentVisibility, roomType]);

  // Render video tag oculto
  // Solo mostrar el editor si es sala de computo
  const isComputo = roomType === 'computo';

  return <>
    {/* Panel de edición eliminado para sala de computo */}
    <canvas ref={canvasRef} id="roomCanvas"
      onClick={e => {
        if (!editMode) return;
        // Selección de objeto editable por click
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, cameraRef.current);
        const intersects = raycaster.intersectObjects(editableObjects.map(o => o.object3D), true);
        if (intersects.length > 0) {
          // Buscar el objeto editable más cercano en la jerarquía
          let obj = intersects[0].object;
          while (obj && !obj.userData.editable) obj = obj.parent;
          if (obj && obj.userData.editable) {
            handleSelectObject(obj.userData.id);
          }
        } else {
          setSelectedId(null);
        }
      }}
    />
    <video
      ref={videoRef}
      src={'/centrosur_animation.mp4'}
      style={{ display: 'none' }}
      preload="auto"
      playsInline
      autoPlay
      muted
      onCanPlay={() => console.log('Video listo para reproducir')}
      onError={e => console.error('Error cargando video', e)}
    />
  </>;
}
