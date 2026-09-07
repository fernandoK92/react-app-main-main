import React, { useEffect, useMemo, useState } from 'react';
import Alert from './Alert';
import { useReservations } from '../context/ReservationsContext';
import { formatDate } from '../utils/helpers';
import { GENERAL_ROOM, ROOMS, SETUP_TYPES } from '../utils/constants';
import { EQUIPMENT_LABELS } from '../config/rooms';

const statusMeta = {
  pending: { label: 'PENDIENTE', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  confirmed: { label: 'CONFIRMADA', bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  rejected: { label: 'RECHAZADA', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
};

const th = {
  padding: '10px 8px',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: '#556',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '10px 8px',
  fontSize: 12,
  color: '#c0c8d8',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'top',
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(3,7,18,0.72)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
  padding: 16,
};

const modalCardBase = {
  background: 'linear-gradient(160deg, #111a36, #121f42)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#dbe2f1',
  maxHeight: '90vh',
  overflow: 'auto',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#dbe2f1',
  outline: 'none',
  fontFamily: 'inherit',
};

const buttonGhost = {
  background: 'rgba(8,14,30,0.72)',
  color: '#9db3d8',
  border: '1px solid rgba(126,149,189,0.22)',
  borderRadius: 10,
  padding: '0 12px',
  height: 34,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
  minWidth: 94,
};

const buttonSuccess = {
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '0 14px',
  height: 34,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
};

const buttonDanger = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  width: 36,
  height: 34,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
};

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
const isLegacyDate = (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value || '');

const toIsoDate = (value) => {
  if (!value) return '';
  if (isIsoDate(value)) return value;
  if (isLegacyDate(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
  return '';
};

const toLegacyDate = (value) => {
  if (!value) return '';
  if (isLegacyDate(value)) return value;
  if (isIsoDate(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  return value;
};

const getTimeParts = (reservation) => {
  if (reservation.startTime && reservation.endTime) {
    return { startTime: reservation.startTime, endTime: reservation.endTime };
  }
  const range = reservation.time || '';
  const parts = range.split(/[–-]/).map((part) => part.trim());
  return {
    startTime: parts[0] || '',
    endTime: parts[1] || '',
  };
};

const renderDateLabel = (value) => {
  if (!value) return '—';
  if (isIsoDate(value)) return formatDate(value);
  return value;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-ES');
};

const mapEquipmentLabel = (item) => {
  if (!item) return null;
  if (typeof item !== 'string') return String(item);
  const normalized = item.trim();
  return EQUIPMENT_LABELS[normalized]?.label
    || normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const StatusBadge = ({ status }) => {
  const meta = statusMeta[status] || statusMeta.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        background: meta.bg,
        color: meta.color,
        border: meta.border,
        padding: '3px 12px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {meta.label}
    </span>
  );
};

const ModalBlock = ({ open, onClose, title, width = '720px', children }) => {
  if (!open) return null;

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div
        style={{ ...modalCardBase, width: '100%', maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button style={buttonGhost} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
};

const ReservationsTable = ({
  filter = 'all',
  showActions = false,
  title = 'Reservas',
  showSearch = false,
  currentUser = null,
}) => {
  const { reservations, updateReservation } = useReservations();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [detailing, setDetailing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  const getRequesterName = (reservation) => reservation.rDth449?.requesterName || reservation.requestedBy || reservation.requester || '—';
  const isAdministrador = currentUser?.role === 'admin';

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
    }, 180);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const allRooms = useMemo(() => {
    const preset = [...ROOMS, GENERAL_ROOM].map((room) => ({ id: room.id, name: room.name }));
    const extras = reservations
      .map((r) => ({ id: r.roomId || (r.room || '').toLowerCase().replace(/\s+/g, '-'), name: r.room || r.roomId }))
      .filter((r) => r.id && r.name && !preset.some((p) => p.id === r.id || p.name === r.name));
    return [...preset, ...extras];
  }, [reservations]);

  const roomNameById = (roomId) => allRooms.find((room) => room.id === roomId)?.name || roomId || '—';

  const isOwner = (reservation) => {
    const userId = currentUser?.id;
    const userEmail = (currentUser?.email || '').trim().toLowerCase();
    const userName = currentUser?.name || currentUser?.email;
    const createdBy = (reservation.createdByUserId || '').trim().toLowerCase();
    const requesterEmail = (
      reservation.requesterEmail
      || reservation.rDth449?.requesterEmail
      || reservation.requestedBy
      || ''
    ).trim().toLowerCase();

    if (reservation.createdByUserId && userId && reservation.createdByUserId === userId) return true;
    if (createdBy && userEmail && createdBy === userEmail) return true;
    if (requesterEmail && userEmail && requesterEmail === userEmail) return true;

    const requester = getRequesterName(reservation);
    return Boolean(userName && requester && requester === userName);
  };

  const canEditReservation = (reservation) => {
    if (filter === 'mine') return isOwner(reservation);
    if (isAdministrador) return false;
    return isOwner(reservation);
  };

  const filtered = useMemo(() => {
    return reservations
      .filter((reservation) => {
        if (filter === 'pending') return reservation.status === 'pending';
        if (filter === 'confirmed') return reservation.status === 'confirmed';
        if (filter === 'rejected') return reservation.status === 'rejected';
        if (filter === 'mine') return isOwner(reservation);
        return true;
      })
      .filter((reservation) => {
        if (!debouncedSearch) return true;
        return (
          (reservation.title || '').toLowerCase().includes(debouncedSearch)
          || getRequesterName(reservation).toLowerCase().includes(debouncedSearch)
          || (reservation.room || '').toLowerCase().includes(debouncedSearch)
        );
      })
      .sort((a, b) => {
        const toTimestamp = (reservation) => {
          const created = new Date(reservation.createdAt || 0).getTime();
          if (!Number.isNaN(created) && created > 0) return created;

          const updated = new Date(reservation.updatedAt || 0).getTime();
          if (!Number.isNaN(updated) && updated > 0) return updated;

          const normalizedDate = toIsoDate(reservation.date);
          if (normalizedDate) {
            const parsedDate = new Date(`${normalizedDate}T00:00:00`).getTime();
            if (!Number.isNaN(parsedDate) && parsedDate > 0) return parsedDate;
          }

          return Number(reservation.id) || 0;
        };

        const newestDiff = toTimestamp(b) - toTimestamp(a);
        if (newestDiff !== 0) return newestDiff;

        const urgentDiff = Number(Boolean(b.isUrgent)) - Number(Boolean(a.isUrgent));
        if (urgentDiff !== 0) return urgentDiff;

        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [reservations, filter, debouncedSearch, currentUser]);

  const canAct = showActions && isAdministrador;
  const hasActions = canAct || filtered.some((reservation) => canEditReservation(reservation));
  const colWidths = hasActions
    ? {
      title: '24%',
      room: '11%',
      date: '10%',
      schedule: '10%',
      requester: '12%',
      status: '11%',
      actions: '22%',
    }
    : {
      title: '31%',
      room: '13%',
      date: '12%',
      schedule: '12%',
      requester: '16%',
      status: '16%',
    };

  const openDetail = (reservation) => setDetailing(reservation);
  const closeDetail = () => setDetailing(null);

  const startEdit = (reservation) => {
    const { startTime, endTime } = getTimeParts(reservation);
    const selectedRoom = allRooms.find((room) => room.name === reservation.room || room.id === reservation.roomId);

    setEditError('');
    setEditing(reservation);
    setEditForm({
      title: reservation.title || '',
      roomId: reservation.roomId || selectedRoom?.id || '',
      date: toIsoDate(reservation.date),
      startTime,
      endTime,
      setupType: reservation.setupType || (reservation.config === 'Solo sillas' ? SETUP_TYPES.SOLO_SILLAS : SETUP_TYPES.MESAS_SILLAS),
      attendees: reservation.attendees || '',
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(null);
    setEditError('');
  };

  const saveEdit = () => {
    if (!editForm || !editing) return;

    if (!canEditReservation(editing)) {
      setEditError('No tienes permiso para editar esta reserva.');
      return;
    }
    if (!editForm.title.trim()) {
      setEditError('El título es obligatorio.');
      return;
    }
    if (!editForm.roomId) {
      setEditError('Selecciona una sala.');
      return;
    }
    if (!editForm.date) {
      setEditError('Selecciona una fecha.');
      return;
    }
    if (!editForm.startTime || !editForm.endTime) {
      setEditError('Selecciona horario de inicio y fin.');
      return;
    }
    if (editForm.startTime >= editForm.endTime) {
      setEditError('La hora de inicio debe ser anterior a la hora fin.');
      return;
    }
    if (!editForm.attendees || Number(editForm.attendees) <= 0) {
      setEditError('Ingresa el número de asistentes.');
      return;
    }

    const roomName = roomNameById(editForm.roomId);
    const setupIsChairsOnly = editForm.setupType === SETUP_TYPES.SOLO_SILLAS;

    updateReservation(editing.id, {
      title: editForm.title.trim(),
      roomId: editForm.roomId,
      room: roomName,
      date: toLegacyDate(editForm.date),
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      time: `${editForm.startTime}–${editForm.endTime}`,
      setupType: editForm.setupType,
      config: setupIsChairsOnly ? 'Solo sillas' : 'Mesas y sillas',
      configIcon: setupIsChairsOnly ? '🪑' : '🛋️',
      attendees: parseInt(editForm.attendees, 10),
      updatedAt: new Date().toISOString(),
    });

    closeEdit();
  };

  const handleApprove = (id) => updateReservation(id, { status: 'confirmed', updatedAt: new Date().toISOString() });
  const handleReject = (id) => updateReservation(id, { status: 'rejected', updatedAt: new Date().toISOString() });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        {title && <h3 style={{ marginBottom: 0, fontWeight: 600, color: '#fff' }}>{title}</h3>}

        {showSearch && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '8px 14px',
              width: 280,
            }}
          >
            <span style={{ fontSize: 14 }}>🔍</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#c0c8d8',
                fontSize: 13,
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ overflowX: 'hidden', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(5,10,25,0.35)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: colWidths.title }}>Título</th>
              <th style={{ ...th, width: colWidths.room }}>Sala</th>
              <th style={{ ...th, width: colWidths.date }}>Fecha</th>
              <th style={{ ...th, width: colWidths.schedule }}>Horario</th>
              <th style={{ ...th, width: colWidths.requester }}>Solicitante</th>
              <th style={{ ...th, width: colWidths.status }}>Estado</th>
              {hasActions && <th style={{ ...th, width: colWidths.actions }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={hasActions ? 7 : 6}
                  style={{
                    ...td,
                    borderBottom: 'none',
                    textAlign: 'center',
                    padding: '72px 16px',
                    color: '#7f8aa8',
                  }}
                >
                  <div style={{ fontSize: 38, lineHeight: 1, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 28, color: '#8e9ab6' }}>Sin reservas para mostrar</div>
                </td>
              </tr>
            ) : (
              filtered.map((reservation) => {
                const { startTime, endTime } = getTimeParts(reservation);
                return (
                  <tr
                    key={reservation.id}
                    style={{
                      transition: 'background 0.15s',
                      background: isAdministrador && reservation.isUrgent ? 'rgba(220,38,38,0.22)' : 'transparent',
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = isAdministrador && reservation.isUrgent
                        ? 'rgba(220,38,38,0.34)'
                        : 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = isAdministrador && reservation.isUrgent
                        ? 'rgba(220,38,38,0.22)'
                        : 'transparent';
                    }}
                  >
                    <td style={{ ...td, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 13, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reservation.title}</div>
                      {(reservation.description || reservation.notes) && (
                        <div style={{ fontSize: 11, color: '#667', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reservation.description || reservation.notes}</div>
                      )}
                      {reservation.equipment && (
                        <div style={{ fontSize: 10, color: '#778', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🟠 {reservation.equipment}</div>
                      )}
                      {reservation.warning && (
                        <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>⚠️ {reservation.warning}</div>
                      )}
                      {reservation.isUrgent && (
                        <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🚨 Prioridad urgente</div>
                      )}
                    </td>

                    <td style={{ ...td, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: reservation.roomColor || '#3b82f6', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reservation.room || roomNameById(reservation.roomId)}</span>
                      </div>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{renderDateLabel(reservation.date)}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{startTime && endTime ? `${startTime}–${endTime}` : reservation.time || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getRequesterName(reservation)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}><StatusBadge status={reservation.status} /></td>

                    {hasActions && (
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                          {canAct && (
                            <button style={buttonGhost} onClick={() => openDetail(reservation)} title="Ver detalle">👁 Detalle</button>
                          )}
                          {canEditReservation(reservation) && (
                            <button style={buttonGhost} onClick={() => startEdit(reservation)} title="Editar">✎ Editar</button>
                          )}
                          {canAct && reservation.status === 'pending' && (
                            <>
                              <button style={buttonSuccess} onClick={() => handleApprove(reservation.id)} title="Confirmar">✓ Aprobar</button>
                              <button style={buttonDanger} onClick={() => handleReject(reservation.id)} title="Rechazar">✕</button>
                            </>
                          )}
                          {!canEditReservation(reservation) && !canAct && <span style={{ color: '#445', fontSize: 12 }}>—</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#667' }}>
          {filtered.length} reserva{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      <ModalBlock open={Boolean(detailing)} onClose={closeDetail} title="Detalle de reserva" width="760px">
        {detailing && (
          <div>
            {(() => {
              const { startTime, endTime } = getTimeParts(detailing);
              const requesterEmail = detailing.rDth449?.requesterEmail || detailing.requesterEmail || '—';
              const servesSnackRaw = detailing.rDth449?.servesSnack ?? detailing.servesSnack;
              const servesSnack = servesSnackRaw === true || servesSnackRaw === 'yes'
                ? 'Sí, requiere refrigerio'
                : (servesSnackRaw === false || servesSnackRaw === 'no' ? 'No requiere refrigerio' : 'No especificado');
              const snackTime = detailing.rDth449?.snackTime || detailing.snackTime;
              const snackEndTime = detailing.rDth449?.snackEndTime || detailing.snackEndTime;
              const snackLabel = snackTime
                ? `${snackTime}${snackEndTime ? `–${snackEndTime}` : ''}`
                : '—';
              const resources = detailing.resources || detailing.rDth449?.equipment || detailing.equipment || [];
              const resourcesText = Array.isArray(resources)
                ? resources.map(mapEquipmentLabel).filter(Boolean).join(', ')
                : String(resources || '—');
              const notesText = detailing.rDth449?.observations
                || detailing.observations
                || detailing.notes
                || detailing.description
                || '—';
              const optionalNotes = detailing.rDth449?.optionalNotes || detailing.optionalNotes;
              const otherNeeds = detailing.rDth449?.otherNeeds || detailing.otherNeeds;
              const createdAt = formatDateTime(detailing.createdAt);
              const updatedAt = formatDateTime(detailing.updatedAt);
              const formStartDate = detailing.rDth449?.startDate || detailing.checkIn;
              const formStartTime = detailing.rDth449?.startTime || detailing.rdth449StartTime || '—';
              const formEndTime = detailing.rDth449?.endTime || detailing.rdth449EndTime || '—';

              return (
                <>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Título</p>
                        <p style={{ fontWeight: 600 }}>{detailing.title || detailing.rDth449?.courseName || '—'}</p>
                      </div>
                      <StatusBadge status={detailing.status} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Solicitante</p>
                      <p style={{ fontWeight: 600 }}>{getRequesterName(detailing)}</p>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 6 }}>{requesterEmail}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Sala</p>
                      <p style={{ fontWeight: 600 }}>{detailing.room || roomNameById(detailing.roomId)}</p>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 6 }}>{detailing.rDth449?.location || '—'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Fecha</p>
                      <p>{renderDateLabel(detailing.date)}</p>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 6 }}>Inicio: {formStartDate ? renderDateLabel(formStartDate) : '—'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Horario</p>
                      <p>{startTime && endTime ? `${startTime}–${endTime}` : (detailing.time || '—')}</p>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 6 }}>Formulario: {formStartTime}–{formEndTime}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Refrigerio / Cafetería</p>
                      <p>{servesSnack}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Horario de refrigerio</p>
                      <p>{snackLabel}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Departamento / Dirección</p>
                      <p>{detailing.rDth449?.department || detailing.department || '—'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Empresa</p>
                      <p>{detailing.rDth449?.company || detailing.company || '—'}</p>
                    </div>
                  </div>

                  {resourcesText && resourcesText !== '—' && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 6 }}>Recursos solicitados</p>
                      <p>{resourcesText}</p>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 6 }}>Observaciones y notas</p>
                    <p>{notesText}</p>
                    {optionalNotes && <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 8 }}>Nota opcional: {optionalNotes}</p>}
                    {otherNeeds && <p style={{ fontSize: 12, color: '#8b98b2', marginTop: 8 }}>Participantes/otros requerimientos: {otherNeeds}</p>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Creada</p>
                      <p>{createdAt}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#8b98b2', marginBottom: 4 }}>Última actualización</p>
                      <p>{updatedAt}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </ModalBlock>

      <ModalBlock open={Boolean(editing)} onClose={closeEdit} title="Editar reserva" width="640px">
        {editForm && (
          <div>
            {editError && <Alert type="error">{editError}</Alert>}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Título *</label>
              <input style={inputStyle} value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Sala *</label>
                <select style={inputStyle} value={editForm.roomId} onChange={(event) => setEditForm({ ...editForm, roomId: event.target.value })}>
                  <option value="">— Seleccionar —</option>
                  {allRooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Fecha *</label>
                <input style={inputStyle} type="date" value={editForm.date} onChange={(event) => setEditForm({ ...editForm, date: event.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Hora inicio *</label>
                <input style={inputStyle} type="time" step="60" value={editForm.startTime} onChange={(event) => setEditForm({ ...editForm, startTime: event.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Hora fin *</label>
                <input style={inputStyle} type="time" step="60" value={editForm.endTime} onChange={(event) => setEditForm({ ...editForm, endTime: event.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Configuración *</label>
                <select style={inputStyle} value={editForm.setupType} onChange={(event) => setEditForm({ ...editForm, setupType: event.target.value })}>
                  <option value={SETUP_TYPES.MESAS_SILLAS}>Mesas y sillas</option>
                  <option value={SETUP_TYPES.SOLO_SILLAS}>Solo sillas</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Asistentes *</label>
                <input style={inputStyle} type="number" min="1" value={editForm.attendees} onChange={(event) => setEditForm({ ...editForm, attendees: event.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" style={buttonGhost} onClick={closeEdit}>Cancelar</button>
              <button type="button" style={{ ...buttonSuccess, background: '#6366f1' }} onClick={saveEdit}>Guardar cambios</button>
            </div>
          </div>
        )}
      </ModalBlock>
    </div>
  );
};

export default ReservationsTable;
