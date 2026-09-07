import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ROOMS, HOURS, SETUP_TYPES, GENERAL_ROOM, RESERVATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { useReservations } from '../context/ReservationsContext';
import { getSlotStatus } from '../services/reservationService';
import Alert from './Alert';

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
const isLegacyDate = (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value || '');
const todayIso = () => new Date().toISOString().slice(0, 10);
const SCROLLABLE_DAYS = 3650;
const DAY_COLUMN_WIDTH = 92;
const HOUR_COLUMN_WIDTH = 72;
const DATE_HEADER_HEIGHT = 72;
const SLOT_ROW_HEIGHT = 34;
const DAY_BUFFER = 3;
const isWeekendDate = (date) => {
  if (!date) return false;
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const toIsoDate = (value) => {
  if (!value) return '';
  if (isIsoDate(value)) return value;
  if (isLegacyDate(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
  return '';
};

const ReservationForm = ({
  formHook,
  showCodeField = false,
  onCancel,
  splitLayout = false,
  onViewReservations,
  revealAvailabilityOnUserRoomSelection = false,
  alwaysShowAvailability = false,
}) => {
  const { form, update, submit, reset, error, success, loading } = formHook;
  const { reservations } = useReservations();
  const availabilityScrollRef = useRef(null);
  const hourColumnRef = useRef(null);
  const calendarStartDateRef = useRef(todayIso());
  const [availabilityScrollLeft, setAvailabilityScrollLeft] = useState(0);
  const [availabilityViewportWidth, setAvailabilityViewportWidth] = useState(900);
  const [pressedNavButton, setPressedNavButton] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasUserSelectedRoom, setHasUserSelectedRoom] = useState(!revealAvailabilityOnUserRoomSelection);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      setShowSuccessModal(true);
    }
  };

  const handleNewReservation = () => {
    if (typeof reset === 'function') {
      reset({
        rdth449RequesterEmail: form.rdth449RequesterEmail || '',
        rdth449RequesterName: form.rdth449RequesterName || '',
        createdByUserId: form.createdByUserId || '',
      });
    }
    setShowSuccessModal(false);
  };

  const handleViewReservations = () => {
    setShowSuccessModal(false);
    if (typeof onViewReservations === 'function') {
      onViewReservations();
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  useEffect(() => {
    if (!showSuccessModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseSuccessModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showSuccessModal]);

  const getDuration = () => {
    if (!form.startTime || !form.endTime) return 0;
    const [startH] = form.startTime.split(':').map(Number);
    const [endH] = form.endTime.split(':').map(Number);
    return endH - startH;
  };

  const duration = getDuration();

  const addDays = (dateStr, daysToAdd) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day + daysToAdd);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const selectedRoom = form.roomId === 'general'
    ? GENERAL_ROOM
    : ROOMS.find(r => r.id === form.roomId);
  const showAvailabilitySidebar = splitLayout && (
    alwaysShowAvailability
    || (Boolean(form.roomId) && (!revealAvailabilityOnUserRoomSelection || hasUserSelectedRoom))
  );

  const attendees = parseInt(form.rdth449AttendeesCount, 10) || 0;
  let capacityInfo = null;

  if (selectedRoom && attendees > 0) {
    const maxCapacity = form.setupType === SETUP_TYPES.MESAS_SILLAS
      ? selectedRoom.capacityWithTables
      : selectedRoom.capacityChairsOnly;

    if (attendees > maxCapacity) {
      capacityInfo = { type: 'error', message: `Capacidad máxima: ${maxCapacity} personas` };
    }
  
  }

  const allRooms = [...ROOMS, GENERAL_ROOM];

  const reservationDate = toIsoDate(form.rdth449StartDate || form.date) || todayIso();
  const todayDate = todayIso();
  const [availabilityDate, setAvailabilityDate] = useState(reservationDate);
  const [selectedStartHour, setSelectedStartHour] = useState(null);
  // --- Drag selection state ---
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null); // {date, hour}
  const [dragEndCell, setDragEndCell] = useState(null); // {date, hour}
  const [dragError, setDragError] = useState('');
  const isTodayActive = availabilityDate === todayDate;

  const availabilityDates = useMemo(
    () => Array.from({ length: SCROLLABLE_DAYS }, (_, i) => addDays(calendarStartDateRef.current, i)),
    []
  );

  useEffect(() => {
    setAvailabilityDate(reservationDate);
    setSelectedStartHour(null);
  }, [reservationDate]);

  useEffect(() => {
    const normalizedStart = toIsoDate(form.rdth449StartDate);
    const normalizedDate = toIsoDate(form.date);
    const today = todayIso();

    if (!normalizedStart) {
      update('rdth449StartDate', today);
      update('rdth449EndDate', today);
      update('date', today);
      return;
    }

    if (!normalizedDate) {
      update('date', normalizedStart);
    }
  }, []);

  const hourSlots = useMemo(() => {
    if (!form.roomId || !availabilityDate) return [];
    return HOURS
      .filter((hour) => {
        const numeric = parseInt(hour.split(':')[0], 10);
        return numeric >= 7 && numeric <= 18;
      })
      .map((hour) => ({
      hour,
      ...getSlotStatus(reservations, form.roomId, availabilityDate, hour),
      }));
  }, [reservations, form.roomId, availabilityDate]);

  const maxBodyHeight = splitLayout ? 368 : 258;
  const bodyHeight = Math.min(hourSlots.length * SLOT_ROW_HEIGHT, maxBodyHeight);
  const gridViewportHeight = DATE_HEADER_HEIGHT + bodyHeight;

  const visibleAvailabilityDates = availabilityDates;
  const totalDateColumns = availabilityDates.length;

  const visibleStartIndex = useMemo(() => {
    const start = Math.floor(availabilityScrollLeft / DAY_COLUMN_WIDTH) - DAY_BUFFER;
    return Math.max(0, start);
  }, [availabilityScrollLeft]);

  const visibleEndIndex = useMemo(() => {
    const end = Math.ceil((availabilityScrollLeft + availabilityViewportWidth) / DAY_COLUMN_WIDTH) + DAY_BUFFER;
    return Math.min(totalDateColumns, end);
  }, [availabilityScrollLeft, availabilityViewportWidth, totalDateColumns]);

  const renderedAvailabilityDates = useMemo(
    () => availabilityDates.slice(visibleStartIndex, visibleEndIndex),
    [availabilityDates, visibleStartIndex, visibleEndIndex]
  );

  const leftDateSpacerWidth = visibleStartIndex * DAY_COLUMN_WIDTH;
  const rightDateSpacerWidth = Math.max(0, (totalDateColumns - visibleEndIndex) * DAY_COLUMN_WIDTH);
  const dateIndexMap = useMemo(() => {
    const map = new Map();
    availabilityDates.forEach((date, index) => map.set(date, index));
    return map;
  }, [availabilityDates]);

  useEffect(() => {
    const updateViewport = () => {
      if (!availabilityScrollRef.current) return;
      setAvailabilityViewportWidth(availabilityScrollRef.current.clientWidth || 900);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const selectRoomFromTab = (roomId) => {
    const room = allRooms.find((item) => item.id === roomId);
    update('roomId', roomId);
    update('rdth449Location', room?.name || '');
    if (revealAvailabilityOnUserRoomSelection) {
      setHasUserSelectedRoom(Boolean(roomId));
    }
  };

  const handleRoomSelectChange = (roomId) => {
    const room = allRooms.find((item) => item.id === roomId);
    update('roomId', roomId);
    update('rdth449Location', room?.name || '');
    if (revealAvailabilityOnUserRoomSelection) {
      setHasUserSelectedRoom(Boolean(roomId));
    }
  };

  const applySelectedDateToForm = (date) => {
    if (!date) return;
    if (isWeekendDate(date)) return;
    update('date', date);
    update('rdth449StartDate', date);
    update('rdth449EndDate', date);
    setAvailabilityDate(date);
  };

  const forceDateToForm = (date) => {
    if (!date) return;
    update('date', date);
    update('rdth449StartDate', date);
    update('rdth449EndDate', date);
    setAvailabilityDate(date);
  };

  const scrollToDateInGrid = (date) => {
    if (!availabilityScrollRef.current || !date) return;
    const index = dateIndexMap.get(date);
    if (typeof index !== 'number') return;
    const targetLeft = (index * DAY_COLUMN_WIDTH);
    availabilityScrollRef.current.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  };

  const goToToday = () => {
    const today = todayIso();
    forceDateToForm(today);
    setSelectedStartHour(null);
    requestAnimationFrame(() => scrollToDateInGrid(today));
  };

  const scrollDatesBy = (direction = 1) => {
    if (!availabilityScrollRef.current) return;
    availabilityScrollRef.current.scrollBy({
      left: direction * DAY_COLUMN_WIDTH * 3,
      behavior: 'smooth',
    });
  };

  const handleAvailabilityScroll = (event) => {
    setAvailabilityScrollLeft(event.currentTarget.scrollLeft || 0);
    if (hourColumnRef.current) {
      hourColumnRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  // --- Drag selection handlers ---
  const handleGridCellMouseDown = (date, hour) => {
    if (isWeekendDate(date)) return;
    setDragSelecting(true);
    setDragStartCell({ date, hour });
    setDragEndCell({ date, hour });
    setDragError('');
    document.body.style.userSelect = 'none';
  };

  const handleGridCellMouseEnter = (date, hour) => {
    if (!dragSelecting) return;
    if (isWeekendDate(date)) return;
    setDragEndCell({ date, hour });
  };

  const handleGridCellMouseUp = () => {
    if (!dragSelecting || !dragStartCell || !dragEndCell) return;
    setDragSelecting(false);
    document.body.style.userSelect = '';

    // Calcular rango seleccionado
    const dates = renderedAvailabilityDates;
    const hours = hourSlots.map(h => h.hour);
    const startDateIdx = dates.indexOf(dragStartCell.date);
    const endDateIdx = dates.indexOf(dragEndCell.date);
    const startHourIdx = hours.indexOf(dragStartCell.hour);
    const endHourIdx = hours.indexOf(dragEndCell.hour);
    if (startDateIdx === -1 || endDateIdx === -1 || startHourIdx === -1 || endHourIdx === -1) return;
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);
    const minHourIdx = Math.min(startHourIdx, endHourIdx);
    const maxHourIdx = Math.max(startHourIdx, endHourIdx);
    // Validar que todas las celdas del rango estén libres
    let allFree = true;
    for (let d = minDateIdx; d <= maxDateIdx; d++) {
      for (let h = minHourIdx; h <= maxHourIdx; h++) {
        const date = dates[d];
        const hour = hours[h];
        const slot = getSlotStatus(reservations, form.roomId, date, hour);
        if (isWeekendDate(date) || slot.status !== 'free') {
          allFree = false;
          break;
        }
      }
      if (!allFree) break;
    }
    if (!allFree) {
      setDragError('No se puede reservar: el rango contiene horarios ocupados o no disponibles.');
      setDragStartCell(null);
      setDragEndCell(null);
      return;
    }
    // Tomar la esquina superior izquierda como inicio, la inferior derecha como fin
    const selectedStartDate = dates[minDateIdx];
    const selectedEndDate = dates[maxDateIdx];
    const selectedStartHour = hours[minHourIdx];
    const selectedEndHour = hours[maxHourIdx];
    // Actualizar el formulario con el rango
    update('date', selectedStartDate);
    update('rdth449StartDate', selectedStartDate);
    update('rdth449EndDate', selectedEndDate);
    setAvailabilityDate(selectedStartDate);
    setSelectedStartHour(selectedStartHour);
    update('startTime', selectedStartHour);
    update('rdth449StartTime', selectedStartHour);
    update('endTime', selectedEndHour);
    update('rdth449EndTime', selectedEndHour);
    setDragStartCell(null);
    setDragEndCell(null);
    setDragError('');
  };

  // Limpiar drag si se suelta el mouse fuera
  useEffect(() => {
    if (!dragSelecting) return;
    const handleUp = () => handleGridCellMouseUp();
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragSelecting, dragStartCell, dragEndCell]);

  const handleHourChipClick = (hour, status) => {
    if (status !== 'free') return;

    update('date', availabilityDate);
    update('rdth449StartDate', availabilityDate);
    update('rdth449EndDate', availabilityDate);

    if (!selectedStartHour) {
      setSelectedStartHour(hour);
      update('startTime', hour);
      update('rdth449StartTime', hour);
    } else {
      setSelectedStartHour(null);
      update('endTime', hour);
      update('rdth449EndTime', hour);
    }
  };

  const canUseSnackArea = duration > 3;

  useEffect(() => {
    if (canUseSnackArea) return;
    if (form.servesSnack === 'yes') {
      update('servesSnack', 'no');
      update('snackTime', '');
      update('snackEndTime', '');
    }
  }, [canUseSnackArea, form.servesSnack]);

  // ---- Dark theme styles ----
  const s = {
    card: {
      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    },
    label: {
      display: 'block', fontSize: '13px', fontWeight: 600,
      color: '#c4c9d4', marginBottom: '6px',
    },
    input: {
      width: '100%', padding: '10px 12px', boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
    },
    select: {
      width: '100%', padding: '10px 12px', boxSizing: 'border-box',
      background: '#0f1629',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
    },
    textarea: {
      width: '100%', padding: '10px 12px', boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
      resize: 'vertical',
    },
    fg: { marginBottom: '16px', flex: 1 },
    fr: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
    hint: { fontSize: '11px', color: '#8892b0', marginTop: '4px' },
    sectionLabel: {
      color: 'rgba(255,255,255,0.4)', fontSize: '11px',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px',
    },
    heading: {
      fontSize: '20px', fontWeight: 700, color: '#e2e8f0',
      marginBottom: '6px', fontFamily: "'Georgia', serif",
    },
    subtext: { fontSize: '12px', color: '#8892b0', marginBottom: '12px' },
    btnPrimary: {
      padding: '12px 28px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff', border: 'none', borderRadius: '10px',
      fontWeight: 600, fontSize: '14px', cursor: 'pointer',
    },
    btnGhost: {
      padding: '12px 28px', background: 'transparent', color: '#8892b0',
      border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px',
      fontWeight: 600, fontSize: '14px', cursor: 'pointer',
    },
    dot: (color) => ({
      width: '8px', height: '8px', borderRadius: '50%',
      background: color, display: 'inline-block',
    }),
    dateBtnActive: {
      padding: '6px 14px', borderRadius: '8px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    },
    dateBtnInactive: {
      padding: '6px 14px', borderRadius: '8px',
      background: 'rgba(255,255,255,0.06)', color: '#8892b0',
      border: '1px solid rgba(99,102,241,0.2)',
      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    },
    availabilityShell: {
      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      overflow: 'hidden',
      marginTop: 8,
      marginBottom: 14,
    },
    availabilityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.04)',
      gap: 8,
      flexWrap: 'wrap',
    },
    navBtn: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#cdd6ea',
      borderRadius: 8,
      width: 30,
      height: 28,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      transition: 'all 0.12s ease',
    },
  };

  const chipBase = {
    padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
  };
  const chipMap = {
    free: { ...chipBase, border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.1)', color: '#86efac' },
    busy: { ...chipBase, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', cursor: 'not-allowed', opacity: 0.6 },
    pending: { ...chipBase, border: '1px solid rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.1)', color: '#fde047', cursor: 'not-allowed', opacity: 0.6 },
  };
  const dotColors = { free: '#22c55e', busy: '#ef4444', pending: '#eab308' };

  const availabilityPanel = (
    <>
      <div style={s.availabilityShell}>
        <div style={s.availabilityHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>🗓️</span>
            <p style={{ fontSize: 18, color: '#e2e8f0', margin: 0, fontWeight: 700 }}>Disponibilidad</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={{
                ...s.navBtn,
                ...(pressedNavButton === 'prev'
                  ? {
                    transform: 'translateY(1px) scale(0.97)',
                    background: 'rgba(99,102,241,0.28)',
                    border: '1px solid rgba(129,140,248,0.85)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }
                  : {}),
              }}
              onClick={() => scrollDatesBy(-1)}
              onMouseDown={() => setPressedNavButton('prev')}
              onMouseUp={() => setPressedNavButton('')}
              onMouseLeave={() => setPressedNavButton('')}
              onTouchStart={() => setPressedNavButton('prev')}
              onTouchEnd={() => setPressedNavButton('')}
              title="Fechas anteriores"
            >
              ◀
            </button>
            <button
              type="button"
              style={{
                ...s.navBtn,
                ...(pressedNavButton === 'next'
                  ? {
                    transform: 'translateY(1px) scale(0.97)',
                    background: 'rgba(99,102,241,0.28)',
                    border: '1px solid rgba(129,140,248,0.85)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }
                  : {}),
              }}
              onClick={() => scrollDatesBy(1)}
              onMouseDown={() => setPressedNavButton('next')}
              onMouseUp={() => setPressedNavButton('')}
              onMouseLeave={() => setPressedNavButton('')}
              onTouchStart={() => setPressedNavButton('next')}
              onTouchEnd={() => setPressedNavButton('')}
              title="Fechas siguientes"
            >
              ▶
            </button>
            <button
              type="button"
              style={{
                ...(isTodayActive ? s.dateBtnActive : s.dateBtnInactive),
                padding: '5px 9px',
                borderRadius: 8,
                transition: 'all 0.12s ease',
                ...(pressedNavButton === 'today'
                  ? {
                    transform: 'translateY(1px) scale(0.97)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
                  }
                  : {}),
              }}
              onClick={goToToday}
              onMouseDown={() => setPressedNavButton('today')}
              onMouseUp={() => setPressedNavButton('')}
              onMouseLeave={() => setPressedNavButton('')}
              onTouchStart={() => setPressedNavButton('today')}
              onTouchEnd={() => setPressedNavButton('')}
            >
              Hoy
            </button>
          </div>
        </div>

        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => selectRoomFromTab(room.id)}
              style={{
                borderRadius: 999,
                border: form.roomId === room.id ? '1px solid rgba(99,102,241,0.9)' : '1px solid rgba(255,255,255,0.14)',
                background: form.roomId === room.id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                color: form.roomId === room.id ? '#e2e8f0' : '#94a3b8',
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  ...s.dot(
                    room.id === 'auditorio'
                      ? '#3b82f6'
                      : room.id === 'capacitacion'
                        ? '#8b5cf6'
                        : room.id === 'computo'
                          ? '#14b8a6'
                          : '#f59e0b'
                  ),
                  marginRight: 8,
                }}
              />
              {room.name.replace('Sala de ', 'Sala ')}
            </button>
          ))}
        </div>

        <div style={{ padding: '7px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={s.dot('#10b981')} /> Disponible</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={s.dot('#fbbf24')} /> Pendiente</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={s.dot('#f87171')} /> Ocupado</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={s.dot('#fca5a5')} /> Fin de semana (no disponible)</span>
        </div>

        {!form.roomId || !availabilityDate ? (
          <div style={{ padding: 12 }}>
            <Alert type="info">Selecciona primero el lugar y la fecha para ver la disponibilidad.</Alert>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `${HOUR_COLUMN_WIDTH}px 1fr` }}>
            <div
              style={{
                borderRight: '1px solid rgba(255,255,255,0.08)',
                background: '#101a33',
              }}
            >
              <div
                style={{
                  padding: '10px 8px',
                  fontSize: 11,
                  color: '#8892b0',
                  fontWeight: 700,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  height: DATE_HEADER_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                HORA
              </div>
              <div ref={hourColumnRef} style={{ height: bodyHeight, overflow: 'hidden' }}>
                {hourSlots.map(({ hour }) => (
                  <div
                    key={`fixed-hour-${hour}`}
                    style={{
                      height: SLOT_ROW_HEIGHT,
                      padding: '7px 6px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 11,
                      color: hour === '09:00' ? '#ef4444' : '#94a3b8',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={availabilityScrollRef}
              onScroll={handleAvailabilityScroll}
              style={{ height: gridViewportHeight, overflow: 'auto' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${leftDateSpacerWidth > 0 ? `${leftDateSpacerWidth}px ` : ''}repeat(${renderedAvailabilityDates.length}, ${DAY_COLUMN_WIDTH}px)${rightDateSpacerWidth > 0 ? ` ${rightDateSpacerWidth}px` : ''}`,
                  minWidth: 620,
                }}
              >
                {leftDateSpacerWidth > 0 && (
                  <div
                    key="header-left-spacer"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 4,
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      background: '#16233f',
                      height: DATE_HEADER_HEIGHT,
                    }}
                  />
                )}

                {renderedAvailabilityDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    disabled={isWeekendDate(date)}
                    onClick={() => applySelectedDateToForm(date)}
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                      height: DATE_HEADER_HEIGHT,
                      padding: '6px 2px',
                      textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      background: isWeekendDate(date)
                        ? '#422534'
                        : (date === availabilityDate ? '#1f3a63' : '#16233f'),
                      cursor: isWeekendDate(date) ? 'not-allowed' : 'pointer',
                      opacity: isWeekendDate(date) ? 0.85 : 1,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.05 }}>
                      {new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 28, color: '#e2e8f0', fontWeight: 700, lineHeight: 1 }}>
                      {new Date(`${date}T00:00:00`).getDate().toString().padStart(2, '0')}
                    </div>
                  </button>
                ))}

                {rightDateSpacerWidth > 0 && (
                  <div
                    key="header-right-spacer"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 4,
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      background: '#16233f',
                      height: DATE_HEADER_HEIGHT,
                    }}
                  />
                )}

                {hourSlots.map(({ hour }) => (
                  <div key={`row-${hour}`} style={{ display: 'contents' }}>
                    {leftDateSpacerWidth > 0 && (
                      <div
                        key={`left-spacer-${hour}`}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          borderLeft: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.01)',
                          height: SLOT_ROW_HEIGHT,
                        }}
                      />
                    )}

                    {renderedAvailabilityDates.map((date) => {
                      const weekend = isWeekendDate(date);
                      const slot = getSlotStatus(reservations, form.roomId, date, hour);
                      const isSelectedStart = selectedStartHour === hour && availabilityDate === date;

                      const cellStyle = weekend
                        ? {
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          color: '#fca5a5',
                        }
                        : slot.status === 'free'
                          ? {
                            background: 'rgba(16,185,129,0.18)',
                            border: '1px solid rgba(16,185,129,0.12)',
                            color: '#10b981',
                          }
                          : slot.status === 'pending'
                            ? {
                              background: 'rgba(245,158,11,0.22)',
                              border: '1px solid rgba(245,158,11,0.2)',
                              color: '#fbbf24',
                            }
                            : {
                              background: 'rgba(239,68,68,0.2)',
                              border: '1px solid rgba(239,68,68,0.18)',
                              color: '#fca5a5',
                            };

                      // Determinar si la celda está dentro del rango de selección por drag
                      let isInDragSelection = false;
                      if (dragStartCell && dragEndCell) {
                        const dates = renderedAvailabilityDates;
                        const hours = hourSlots.map(h => h.hour);
                        const startDateIdx = dates.indexOf(dragStartCell.date);
                        const endDateIdx = dates.indexOf(dragEndCell.date);
                        const startHourIdx = hours.indexOf(dragStartCell.hour);
                        const endHourIdx = hours.indexOf(dragEndCell.hour);
                        if (startDateIdx !== -1 && endDateIdx !== -1 && startHourIdx !== -1 && endHourIdx !== -1) {
                          const minDateIdx = Math.min(startDateIdx, endDateIdx);
                          const maxDateIdx = Math.max(startDateIdx, endDateIdx);
                          const minHourIdx = Math.min(startHourIdx, endHourIdx);
                          const maxHourIdx = Math.max(startHourIdx, endHourIdx);
                          const thisDateIdx = dates.indexOf(date);
                          const thisHourIdx = hours.indexOf(hour);
                          isInDragSelection =
                            thisDateIdx >= minDateIdx && thisDateIdx <= maxDateIdx &&
                            thisHourIdx >= minHourIdx && thisHourIdx <= maxHourIdx;
                        }
                      }
                      return (
                        <button
                          key={`${date}-${hour}`}
                          type="button"
                          onMouseDown={() => handleGridCellMouseDown(date, hour)}
                          onMouseEnter={() => handleGridCellMouseEnter(date, hour)}
                          

                          // onMouseUp handled globally
                          disabled={weekend || slot.status !== 'free'}
                          style={{
                            height: SLOT_ROW_HEIGHT,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                            padding: '3px 5px',
                            textAlign: 'center',
                            cursor: weekend ? 'not-allowed' : (slot.status === 'free' ? 'pointer' : 'not-allowed'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...cellStyle,
                            ...(isSelectedStart ? { boxShadow: 'inset 0 0 0 2px #60a5fa' } : {}),
                            ...(isInDragSelection ? { boxShadow: 'inset 0 0 0 2px #f59e42' } : {}),
                          }}
                        >
                          {weekend ? (
                            <span style={{ fontSize: 10, fontWeight: 700 }}>No disponible</span>
                          ) : slot.status === 'free' ? (
                            <span style={{ fontSize: 12, fontWeight: 700 }}>Reservar</span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700 }}>
                              {slot.status === 'pending' ? 'Pendiente' : 'Ocupado'}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {rightDateSpacerWidth > 0 && (
                      <div
                        key={`right-spacer-${hour}`}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          borderLeft: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.01)',
                          height: SLOT_ROW_HEIGHT,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>↔️ Puedes desplazar horizontalmente por años de fechas</span>
        </div>
        {dragError && (
          <div style={{ color: '#ef4444', fontWeight: 600, margin: '8px 0 0 0', fontSize: 14 }}>
            {dragError}
          </div>
        )}
      </div>

      {duration > 0 && (
        <p style={{ marginTop: 0, marginBottom: 6, fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>
          Duración: {duration} hora{duration !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <Alert type="error">{error}</Alert>}
      {success && !showSuccessModal && <Alert type="success">{success}</Alert>}

      {showCodeField && (
        <div style={{
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 14,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={Boolean(form.isUrgentRequest)}
              onChange={(e) => {
                const checked = e.target.checked;
                update('isUrgentRequest', checked);
                if (!checked) {
                  update('uniqueCode', '');
                  update('code', '');
                }
              }}
              style={{ width: 16, height: 16, accentColor: '#ef4444', cursor: 'pointer' }}
            />
            🚨 Reserva urgente con código único proporcionado por Administrador (se prioriza en revisión)
          </label>
        </div>
      )}

      <div
        style={splitLayout
          ? {
            display: 'grid',
            gridTemplateColumns: showAvailabilitySidebar
              ? 'minmax(0, 1fr) minmax(560px, 0.9fr)'
              : 'minmax(0, 1fr)',
            gap: 16,
            alignItems: 'start',
            transition: 'all 0.25s ease',
          }
          : undefined}
      >
      <div style={s.card}>
        <div style={s.sectionLabel}>SOLICITUD Y AUTORIZACIÓN DE EVENTOS</div>
        <h4 style={s.heading}>R-DTH-449</h4>
        <p style={s.subtext}>SERVICIOS GENERALES • ADECUACIÓN SALAS</p>

        {showCodeField && form.isUrgentRequest && (
          <div style={s.fg}>
            <label style={s.label}>🔑 Código único (Administrador)</label>
            <input
              style={{ ...s.input, fontFamily: 'monospace' }}
              type="text"
              placeholder="Ingresa el código entregado por el Administrador"
              value={form.uniqueCode || form.code || ''}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                update('uniqueCode', value);
                update('code', value);
              }}
            />
            <p style={s.hint}>Si ingresas un código válido, la reserva se registrará como prioridad urgente.</p>
          </div>
        )}

        <div style={s.fg}>
          <label style={s.label}>Nombre de Curso o Evento *</label>
          <input style={s.input} placeholder="Título del evento"
            value={form.rdth449CourseName} onChange={(e) => update('rdth449CourseName', e.target.value)} />
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Nombre del solicitante *</label>
            <input style={s.input} placeholder="Nombre y apellido"
              value={form.rdth449RequesterName} onChange={(e) => update('rdth449RequesterName', e.target.value)} />
          </div>
          <div style={s.fg}>
            <label style={s.label}>Correo electrónico institucional *</label>
            <input style={s.input} type="email" placeholder="usuario@centrosur.ec"
              value={form.rdth449RequesterEmail} onChange={(e) => update('rdth449RequesterEmail', e.target.value)} />
            <p style={s.hint}>Se usarán correos institucionales para notificaciones automáticas.</p>
          </div>
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Dirección/Departamento *</label>
            <input style={s.input} placeholder="Ej: Talento Humano"
              value={form.rdth449Department} onChange={(e) => update('rdth449Department', e.target.value)} />
          </div>
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Configuración de sala *</label>
            <select style={s.select} value={form.setupType}
              onChange={(e) => update('setupType', e.target.value)}>
              <option value={SETUP_TYPES.MESAS_SILLAS}>Mesas y sillas</option>
              <option value={SETUP_TYPES.SOLO_SILLAS}>Solo sillas</option>
            </select>
          </div>
        </div>

        {capacityInfo && <Alert type={capacityInfo.type}>{capacityInfo.message}</Alert>}

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Lugar *</label>
            <select style={s.select} value={form.roomId}
              onChange={(e) => {
                const roomId = e.target.value;
                handleRoomSelectChange(roomId);
              }}>
              <option value="">— Seleccionar sala —</option>
              {allRooms.map(r => {
                const cap = form.setupType === SETUP_TYPES.MESAS_SILLAS ? r.capacityWithTables : r.capacityChairsOnly;
                return <option key={r.id} value={r.id}>{r.name} (cap. {cap})</option>;
              })}
            </select>
          </div>
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Uso de cafetería *</label>
            <select style={{ ...s.select, opacity: canUseSnackArea ? 1 : 0.6 }} value={form.servesSnack}
              disabled={!canUseSnackArea}
              onChange={(e) => {
                const value = e.target.value;
                update('servesSnack', value);
                if (value !== 'yes') { update('snackTime', ''); update('snackEndTime', ''); }
              }}>
              <option value="">— Seleccionar —</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
            <p style={s.hint}>
              Área de cafetería disponible únicamente cuando la duración de la capacitación es mayor a 3 horas.
            </p>
          </div>
        </div>

        {form.servesSnack === 'yes' && (
          <>
            <div style={s.fr}>
              <div style={s.fg}>
                <label style={s.label}>Inicio refrigerio *</label>
                <input style={s.input} type="time" step="60"
                  min={form.startTime} max={form.endTime}
                  value={form.snackTime} onChange={(e) => update('snackTime', e.target.value)} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Fin refrigerio *</label>
                <input style={s.input} type="time" step="60"
                  min={form.startTime} max={form.endTime}
                  value={form.snackEndTime || ''} onChange={(e) => update('snackEndTime', e.target.value)} />
              </div>
            </div>
            <p style={{ ...s.hint, marginBottom: '12px' }}>Máximo 1 hora de tiempo límite.</p>
          </>
        )}

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>N° Asistentes *</label>
            <input style={s.input} type="number" min="1" placeholder="0"
              value={form.rdth449AttendeesCount} onChange={(e) => update('rdth449AttendeesCount', e.target.value)} />
          </div>
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Fecha inicio *</label>
            <input
              style={s.input}
              type="date"
              value={form.rdth449StartDate}
              onChange={(e) => {
                const value = e.target.value;
                update('rdth449StartDate', value);
                update('date', value);
                if (!form.rdth449EndDate || form.rdth449EndDate < value) {
                  update('rdth449EndDate', value);
                }
              }}
            />
          </div>
          <div style={s.fg}>
            <label style={s.label}>Fecha fin *</label>
            <input
              style={s.input}
              type="date"
              min={form.rdth449StartDate || undefined}
              value={form.rdth449EndDate}
              onChange={(e) => update('rdth449EndDate', e.target.value)}
            />
          </div>
        </div>

        <div style={s.fr}>
          <div style={s.fg}>
            <label style={s.label}>Inicio *</label>
            <input style={s.input} type="time" step="60" value={form.rdth449StartTime}
              onChange={(e) => { update('rdth449StartTime', e.target.value); update('startTime', e.target.value); }} />
          </div>
          <div style={s.fg}>
            <label style={s.label}>Término *</label>
            <input style={s.input} type="time" step="60" value={form.rdth449EndTime}
              onChange={(e) => { update('rdth449EndTime', e.target.value); update('endTime', e.target.value); }} />
          </div>
        </div>

        {!splitLayout && availabilityPanel}

        <div style={s.fg}>
          <label style={s.label}>Compañía que presta el servicio</label>
          <input style={s.input} placeholder="Opcional"
            value={form.rdth449Company} onChange={(e) => update('rdth449Company', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Antecedentes (Objetivo General) *</label>
          <textarea style={s.textarea} rows={2} placeholder="Razones por las cuales requiere el curso o evento"
            value={form.rdth449GeneralObjective} onChange={(e) => update('rdth449GeneralObjective', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Objetivos Específicos *</label>
          <textarea style={s.textarea} rows={2} placeholder="¿Qué persigue el curso o evento?"
            value={form.rdth449SpecificObjectives} onChange={(e) => update('rdth449SpecificObjectives', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Conocimientos y destrezas que adquirirá *</label>
          <textarea style={s.textarea} rows={2} placeholder="¿Cómo contribuirá el evento en sus actividades?"
            value={form.rdth449Skills} onChange={(e) => update('rdth449Skills', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Participantes</label>
          <textarea style={s.textarea} rows={2} placeholder="Detalle opcional de participantes"
            value={form.rdth449OtherNeeds} onChange={(e) => update('rdth449OtherNeeds', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Observaciones y Requerimientos Adicionales *</label>
          <textarea style={s.textarea} rows={2} placeholder="Especifica cualquier requerimiento especial, catering, etc."
            value={form.rdth449Observations} onChange={(e) => update('rdth449Observations', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Forma de Contratación (Opcional)</label>
          <select style={s.select} value={form.rdth449HiringType}
            onChange={(e) => update('rdth449HiringType', e.target.value)}>
            <option value="">-- Selecciona una opción --</option>
            <option value="personal-centro-sur">Personal Centro Sur</option>
            <option value="contratista-externo">Contratista Externo</option>
            <option value="mixto">Mixto (Personal + Externos)</option>
            <option value="solo-recursos-internos">Solo recursos internos</option>
          </select>
        </div>

        <div style={s.fg}>
          <label style={s.label}>El evento corresponde</label>
          <input style={s.input} placeholder="Opcional"
            value={form.rdth449EventCorresponds || ''} onChange={(e) => update('rdth449EventCorresponds', e.target.value)} />
        </div>

        <div style={s.fg}>
          <label style={s.label}>Observaciones</label>
          <textarea style={s.textarea} rows={2} placeholder="Observaciones adicionales"
            value={form.rdth449OptionalNotes || ''} onChange={(e) => update('rdth449OptionalNotes', e.target.value)} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
          <input type="checkbox" checked={form.rdth449Confirmed}
            onChange={(e) => update('rdth449Confirmed', e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }} />
          <span style={{ fontSize: '13px', color: '#c4c9d4' }}>
            Confirmo que el Formulario R-DTH-449 está completo, la información es correcta y autorizo su procesamiento.
          </span>
        </label>
      </div>

      {showAvailabilitySidebar && (
        <div style={{ position: 'sticky', top: 8 }}>
          {availabilityPanel}
        </div>
      )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button type="submit" style={{ ...s.btnPrimary, opacity: loading ? 0.6 : 1 }} disabled={loading}>
          {loading ? 'Enviando…' : '📤 Solicitar Reserva'}
        </button>
        {onCancel && (
          <button type="button" style={s.btnGhost} onClick={onCancel}>Cancelar</button>
        )}
      </div>

      {showSuccessModal && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              borderRadius: 20,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'linear-gradient(145deg, #0d1425, #0a1020)',
              padding: '44px 34px',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={handleCloseSuccessModal}
              aria-label="Cerrar"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid rgba(148,163,184,0.35)',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#cbd5e1',
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              x
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                margin: '0 auto 22px',
                background: 'linear-gradient(180deg, #86efac, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 38,
                fontWeight: 700,
                boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.2), 0 8px 24px rgba(16,185,129,0.25)',
              }}
            >
              ✓
            </div>

            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 48, fontWeight: 700 }}>Reserva Creada</h3>

            <p style={{ margin: '16px 0 0', color: '#94a3b8', fontSize: 36, lineHeight: 1.35 }}>
              Tu solicitud fue registrada con estado{' '}
              <span
                style={{
                  display: 'inline-block',
                  border: '1px solid rgba(245,158,11,0.4)',
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.08)',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                PENDIENTE
              </span>
              <br />
              El Administrador deberá confirmarla.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleNewReservation}
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '11px 22px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Nueva reserva
              </button>

              {typeof onViewReservations === 'function' && (
                <button
                  type="button"
                  onClick={handleViewReservations}
                  style={{
                    background: 'transparent',
                    color: '#cbd5e1',
                    border: '1px solid rgba(148,163,184,0.3)',
                    borderRadius: 12,
                    padding: '11px 22px',
                    fontSize: 16,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Ver reservas
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </form>
  );
};

export default ReservationForm;
