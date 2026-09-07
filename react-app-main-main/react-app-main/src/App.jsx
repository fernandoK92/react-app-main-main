import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ROOM_EQUIPMENT } from './config/rooms';
import { clearUniqueCodes } from './services/uniqueCodeService';
import { ReservationsProvider } from './context/ReservationsContext';

// Animación HTML como string (puedes mover esto a un archivo aparte si prefieres)
const projectorAnimationHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Rajdhani:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --blue-bright: #00c3ff; --blue-mid: #0080ee; --blue-deep: #003a80; --white: #d8eeff; --glow: rgba(0,195,255,0.6); }
  html, body { width: 100%; height: 100%; background: #000a1a; overflow: hidden; font-family: 'Oswald', sans-serif; }
  canvas#bg { position: fixed; inset: 0; z-index: 0; }
  .scene { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; perspective: 900px; }
  .logo-3d { transform-style: preserve-3d; animation: logo-enter 1.8s cubic-bezier(0.16,1,0.3,1) 0.4s both, logo-hover 6s ease-in-out 2.4s infinite; }
  @keyframes logo-enter { from { opacity: 0; transform: rotateX(40deg) rotateY(-20deg) translateZ(-400px) scale(0.4); } to { opacity: 1; transform: rotateX(0deg)  rotateY(0deg)   translateZ(0px)    scale(1);   } }
  @keyframes logo-hover { 0%,100% { transform: rotateX(2deg)  rotateY(-3deg)  translateZ(0); } 25% { transform: rotateX(-2deg) rotateY(4deg)   translateZ(10px); } 50% { transform: rotateX(3deg)  rotateY(2deg)   translateZ(5px); } 75% { transform: rotateX(-1deg) rotateY(-4deg)  translateZ(8px); } }
  .icon-wrap { position: relative; width: 180px; height: 180px; margin: 0 auto 28px; }
  .glow-ring { position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(circle, rgba(0,195,255,0.3) 0%, transparent 70%); animation: pulse-ring 3s ease-in-out infinite; }
  .glow-ring-2 { position: absolute; inset: -40px; border-radius: 50%; background: radial-gradient(circle, rgba(0,120,255,0.12) 0%, transparent 65%); animation: pulse-ring 3s ease-in-out 1.5s infinite; }
  @keyframes pulse-ring { 0%,100% { transform: scale(1);   opacity: 0.5; } 50% { transform: scale(1.15); opacity: 1; } }
  .cs-svg { width: 180px; height: 180px; filter: drop-shadow(0 0 18px rgba(0,195,255,0.9)) drop-shadow(0 0 40px rgba(0,120,255,0.5)); animation: icon-float 4s ease-in-out infinite; }
  @keyframes icon-float { 0%,100% { transform: translateY(0);    } 50% { transform: translateY(-8px); } }
  .cs-bolt { animation: bolt-flicker 2.5s ease-in-out 1.2s infinite; transform-origin: center; transform-box: fill-box; }
  @keyframes bolt-flicker { 0%,85%,100% { filter: brightness(1); } 88% { filter: brightness(3.5) drop-shadow(0 0 8px #fff); } 92% { filter: brightness(1); } 96% { filter: brightness(2.5) drop-shadow(0 0 6px #7df); } }
  .text-block { text-align: center; transform-style: preserve-3d; }
  .wordmark { display: flex; align-items: baseline; justify-content: center; gap: 0; overflow: hidden; }
  .word-dark, .word-blue { font-family: 'Oswald', sans-serif; font-weight: 900; font-size: clamp(52px, 9vw, 96px); letter-spacing: 10px; text-transform: uppercase; line-height: 1; display: inline-block; }
  .word-dark { color: #c8dff5; text-shadow: 0 0 20px rgba(150,210,255,0.4), 0 2px 6px rgba(0,0,0,0.8); animation: word-dark-enter 1s cubic-bezier(0.16,1,0.3,1) 1.6s both; }
  .word-blue { color: #00c3ff; text-shadow: 0 0 30px rgba(0,195,255,0.9), 0 0 60px rgba(0,130,255,0.5), 0 2px 6px rgba(0,0,0,0.8); animation: word-blue-enter 1s cubic-bezier(0.16,1,0.3,1) 1.8s both, shimmer 3s ease-in-out 3s infinite; }
  @keyframes word-dark-enter { from { opacity: 0; transform: translateX(-60px) skewX(-10deg); } to { opacity: 1; transform: translateX(0)     skewX(0deg);   } }
  @keyframes word-blue-enter { from { opacity: 0; transform: translateX(60px) skewX(10deg); } to { opacity: 1; transform: translateX(0)    skewX(0deg);  } }
  @keyframes shimmer { 0%,100% { color: #00c3ff; text-shadow: 0 0 30px rgba(0,195,255,0.9), 0 0 60px rgba(0,130,255,0.5); } 50% { color: #60dfff; text-shadow: 0 0 50px rgba(0,220,255,1),   0 0 90px rgba(0,170,255,0.7); } }
  .sep-line { width: 0; height: 1.5px; background: linear-gradient(90deg, transparent, var(--blue-bright), transparent); margin: 10px auto 10px; animation: line-expand 0.8s cubic-bezier(0.16,1,0.3,1) 2.4s both; box-shadow: 0 0 12px var(--blue-bright); }
  @keyframes line-expand { from { width: 0; opacity: 0; } to { width: min(520px, 80vw); opacity: 1; } }
  .subtitle { font-family: 'Rajdhani', sans-serif; font-weight: 300; font-size: clamp(12px, 2vw, 18px); letter-spacing: 8px; text-transform: uppercase; color: rgba(100,190,255,0.55); animation: sub-enter 1s ease 2.8s both; opacity: 0; }
  @keyframes sub-enter { from { opacity: 0; letter-spacing: 20px; } to { opacity: 1; letter-spacing: 8px;  } }
  .scan { position: fixed; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(0,195,255,0.6), transparent); box-shadow: 0 0 20px rgba(0,195,255,0.4); z-index: 20; animation: scan-line 5s linear 1s infinite; opacity: 0; }
  @keyframes scan-line { 0%   { top: 0%;   opacity: 0; } 5%   { opacity: 1; } 95%  { opacity: 1; } 100% { top: 100%; opacity: 0; } }
  .corners { position: fixed; inset: 30px; z-index: 15; pointer-events: none; animation: corners-enter 1s ease 0.2s both; opacity: 0; }
  @keyframes corners-enter { from { opacity: 0; inset: 60px; } to { opacity: 1; inset: 30px; } }
  .corner { position: absolute; width: 40px; height: 40px; border-color: rgba(0,195,255,0.4); border-style: solid; }
  .corner.tl { top: 0; left: 0;   border-width: 2px 0 0 2px; }
  .corner.tr { top: 0; right: 0;  border-width: 2px 2px 0 0; }
  .corner.bl { bottom: 0; left: 0;  border-width: 0 0 2px 2px; }
  .corner.br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }
  .sparks-canvas { position: fixed; inset: 0; z-index: 5; pointer-events: none; }
  .flash { position: fixed; inset: 0; background: rgba(0,195,255,0.15); z-index: 50; animation: flash-in 0.4s ease 0.3s both; pointer-events: none; }
  @keyframes flash-in { 0%   { opacity: 1; } 100% { opacity: 0; } }
  .restart-btn { position: fixed; bottom: 30px; right: 30px; z-index: 100; background: rgba(0,30,60,0.7); border: 1px solid rgba(0,195,255,0.3); color: rgba(0,195,255,0.7); font-family: 'Rajdhani', sans-serif; font-size: 13px; letter-spacing: 3px; padding: 10px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; opacity: 0; animation: sub-enter 1s ease 4s both; }
  .restart-btn:hover { background: rgba(0,195,255,0.15); border-color: rgba(0,195,255,0.8); color: #00c3ff; box-shadow: 0 0 20px rgba(0,195,255,0.3); }
</style>
<canvas id="bg"></canvas>
<canvas class="sparks-canvas" id="sparks"></canvas>
<div class="flash"></div>
<div class="scan"></div>
<div class="corners">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
</div>
<div class="scene">
  <div class="logo-3d">
    <div class="icon-wrap">
      <div class="glow-ring-2"></div>
      <div class="glow-ring"></div>
      <svg class="cs-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="csg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#1e90ff"/>
            <stop offset="100%" stop-color="#0050aa"/>
          </linearGradient>
          <linearGradient id="csg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#00c3ff"/>
            <stop offset="100%" stop-color="#0080ee"/>
          </linearGradient>
          <linearGradient id="csbolt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#a0deff"/>
          </linearGradient>
          <filter id="csglow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="M145,30 Q165,30 165,50 L165,75 Q150,75 150,60 Q150,45 135,45 L65,45 Q50,45 50,60 L50,140 Q50,155 65,155 L135,155 Q150,155 150,140 Q150,125 165,125 L165,150 Q165,170 145,170 L55,170 Q30,170 30,145 L30,55 Q30,30 55,30 Z" fill="url(#csg1)"/>
        <line x1="20" y1="125" x2="185" y2="72" stroke="url(#csg2)" stroke-width="3.5" stroke-linecap="round" opacity="0.9" filter="url(#csglow)"/>
        <polygon class="cs-bolt" points="108,68 90,105 103,105 88,138 120,95 106,95 122,68" fill="url(#csbolt)" filter="url(#csglow)"/>
      </svg>
    </div>
    <div class="text-block">
      <div class="wordmark">
        <span class="word-dark">CENTRO</span>
        <span class="word-blue">SUR</span>
      </div>
      <div class="sep-line"></div>
      <div class="subtitle">Distribución de Energía</div>
    </div>
  </div>
</div>
<button class="restart-btn" onclick="location.reload()">↺ &nbsp;Repetir</button>
<script>
// ... Animación JS ...
// (Por espacio, puedes pegar aquí el JS de la animación si lo necesitas)
</script>
`;
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import RoomSelector from './components/RoomSelector';
import RoomViewer from './components/RoomViewer';
import ReservationRequestModal from './components/ReservationRequestModal';
import SeatTooltip from './components/SeatTooltip';
import AdministradorPanel from './pages/Administrador/AdministradorPanel';
import {
  ROOMS_CONFIG,
  DIVISIBLE_GENERAL_OCCUPIED,
  DIVISIBLE_DIVIDED_OCCUPIED,
} from './config/rooms';
import { getDivisibleFurnitureType } from './three/partitionWall';

export default function App() {
  const USER_SESSION_KEY = 'centrosur_user_session_v1';

  // Eliminado overlay de animación
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [partitionPosition, setPartitionPosition] = useState(0);
  const [selectedDivisibleMode, setSelectedDivisibleMode] = useState('general');
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationRoomId, setReservationRoomId] = useState('');
  const [reservationRoomTitle, setReservationRoomTitle] = useState('');
  const [tooltip, setTooltip] = useState(null);
  const [lastDivisibleMode, setLastDivisibleMode] = useState('general');
  // Inicialmente todo desactivado
  const [equipmentVisibility, setEquipmentVisibility] = useState({});

  // Helper para obtener todos los equipos en false para la sala
  const getAllEquipmentOff = (roomType) => {
    const keys = ROOM_EQUIPMENT[roomType] || [];
    const obj = {};
    keys.forEach(k => { obj[k] = false; });
    return obj;
  };
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(USER_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(USER_SESSION_KEY);
      return;
    }
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    clearUniqueCodes();
  }, []);

  // If user is admin, show the admin panel
  const isAdmin = user && user.role === 'admin';

  // Handle logout (works for both admin and regular user)
  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentRoom(null);
    setSelectedSeats(new Set());
    setPartitionPosition(0);
    setLastDivisibleMode('general');
    setSelectedDivisibleMode('general');
    setTooltip(null);
    setEquipmentVisibility({});
  }, []);

  // Compute current room config with dynamic title for divisible
  const roomConfig = useMemo(() => {
    if (!currentRoom) return null;
    const base = { ...ROOMS_CONFIG[currentRoom] };
    if (currentRoom === 'divisible') {
      const mode = getDivisibleFurnitureType(partitionPosition);
      if (mode === 'general') {
        base.title = 'Sala General (Abierta)';
        base.occupied = DIVISIBLE_GENERAL_OCCUPIED;
      } else if (mode === 'divided') {
        base.title = 'Auditorio + Capacitación';
        base.occupied = DIVISIBLE_DIVIDED_OCCUPIED;
      } else {
        // Transitioning — keep last mode's config
        if (lastDivisibleMode === 'divided') {
          base.title = 'Auditorio + Capacitación';
          base.occupied = DIVISIBLE_DIVIDED_OCCUPIED;
        } else {
          base.title = 'Sala General (Abierta)';
          base.occupied = DIVISIBLE_GENERAL_OCCUPIED;
        }
      }
    }
    return base;
  }, [currentRoom, partitionPosition, lastDivisibleMode]);

  // Determine Three.js scene type
  const threeType = useMemo(() => {
    if (!currentRoom) return null;
    if (currentRoom === 'divisible') {
      const mode = getDivisibleFurnitureType(partitionPosition);
      if (mode === 'divided') return 'divided';
      if (mode === 'general') return 'general';
      // Transitioning: keep last mode
      return lastDivisibleMode === 'divided' ? 'divided' : 'general';
    }
    return currentRoom;
  }, [currentRoom, partitionPosition, lastDivisibleMode]);

  // Occupied seats for current view
  const occupied = useMemo(() => {
    return roomConfig?.occupied || [];
  }, [roomConfig]);

  // Select a room
  const handleSelectRoom = useCallback((type) => {
    setCurrentRoom(type);
    setSelectedSeats(new Set());
    setPartitionPosition(0);
    setLastDivisibleMode('general');
    setSelectedDivisibleMode('general');
    setEquipmentVisibility(getAllEquipmentOff(type)); // <-- todo desactivado al entrar
  }, []);

  // Go back to selector
  const handleGoBack = useCallback(() => {
    setCurrentRoom(null);
    setSelectedSeats(new Set());
    setPartitionPosition(0);
    setLastDivisibleMode('general');
    setSelectedDivisibleMode('general');
    setTooltip(null);
    setEquipmentVisibility({});
  }, []);

  // Handle partition slider
  const handlePartitionChange = useCallback((value) => {
    setPartitionPosition(value);
    const mode = getDivisibleFurnitureType(value);
    if (mode && mode !== lastDivisibleMode) {
      setLastDivisibleMode(mode);
      setSelectedSeats(new Set()); // Clear selections on mode change
    }
  }, [lastDivisibleMode]);

  // Toggle seat selection
  const handleToggleSeat = useCallback((idx, label) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  // Remove a seat from selection
  const handleRemoveSeat = useCallback((idx) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  }, []);

  // Tooltip handlers
  const handleHoverSeat = useCallback((e, idx, label, status) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      label,
      status,
    });
  }, []);

  const handleLeaveSeat = useCallback(() => {
    setTooltip(null);
  }, []);


  // Toggle equipment visibility
  const handleToggleEquipment = useCallback((key) => {
    setEquipmentVisibility((prev) => {
      const next = {
        ...prev,
        [key]: prev[key] === undefined ? false : !prev[key],
      };
      // Si el proyector se activa, mostrar animación
      // Eliminado: NO abrir modal ni overlay
      return next;
    });
  }, []);

  // Reserve
  const handleReserve = useCallback(() => {
    if (currentRoom === 'divisible') {
      if (selectedDivisibleMode === 'auditorio') {
        setReservationRoomId('auditorio');
        setReservationRoomTitle('Auditorio');
      } else if (selectedDivisibleMode === 'capacitacion') {
        setReservationRoomId('capacitacion');
        setReservationRoomTitle('Capacitación');
      } else {
        setReservationRoomId('general');
        setReservationRoomTitle('General');
      }
    } else {
      setReservationRoomId(currentRoom || '');
      setReservationRoomTitle(roomConfig?.title || '');
    }
    setModalOpen(true);
  }, [currentRoom, roomConfig?.title, selectedDivisibleMode]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setReservationRoomId('');
    setReservationRoomTitle('');
  }, []);

  return (
    <ReservationsProvider>
      {/* ========== ADMIN VIEW ========= */}
      {isAdmin ? (
        <AdministradorPanel onLogout={handleLogout} currentUser={user} />
      ) : (
        <>
          {/* ========== REGULAR USER VIEW ========= */}
          <Header
            onLoginClick={() => setShowLogin(true)}
            user={user}
            onLogout={handleLogout}
          />

          {/* Room Selector View */}
          {!currentRoom && (
            <RoomSelector onSelectRoom={handleSelectRoom} />
          )}


          {/* Room Viewer */}
          {currentRoom && roomConfig && (
            <RoomViewer
              roomType={currentRoom}
              roomConfig={roomConfig}
              partitionPosition={partitionPosition}
              selectedSeats={selectedSeats}
              threeType={threeType}
              occupied={occupied}
              equipmentVisibility={equipmentVisibility}
              onGoBack={handleGoBack}
              onPartitionChange={handlePartitionChange}
              onToggleSeat={handleToggleSeat}
              onRemoveSeat={handleRemoveSeat}
              onHoverSeat={handleHoverSeat}
              onLeaveSeat={handleLeaveSeat}
              onReserve={handleReserve}
              onToggleEquipment={handleToggleEquipment}
              onDivisibleModeSelect={setSelectedDivisibleMode}
            />
          )}

          {/* Tooltip */}
          <SeatTooltip data={tooltip} />

          {/* Login Screen */}
          {showLogin && (
            <LoginScreen
              onClose={() => setShowLogin(false)}
              onLogin={(userData) => {
                setUser(userData);
                setShowLogin(false);
              }}
            />
          )}

          {/* Reservation Request Modal */}
          <ReservationRequestModal
            isOpen={modalOpen}
            roomTitle={reservationRoomTitle || roomConfig?.title || ''}
            roomId={reservationRoomId || currentRoom || ''}
            roomType={currentRoom}
            onClose={handleCloseModal}
            equipmentVisibility={equipmentVisibility}
          />
        </>
      )}
    </ReservationsProvider>
  );
}
