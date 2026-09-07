import { useState } from 'react';
import { useReservations } from '../context/ReservationsContext';
import { SETUP_TYPES } from '../utils/constants';
import { isUniqueCodeAvailable, markUniqueCodeAsUsed } from '../services/uniqueCodeService';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  code: '',
  uniqueCode: '',
  isUrgentRequest: false,
  roomId: '',
  date: today(),
  startTime: '',
  endTime: '',
  setupType: SETUP_TYPES.MESAS_SILLAS,
  servesSnack: '',
  snackTime: '',
  snackEndTime: '',
  selectedEquipment: [],
  rdth449CourseName: '',
  rdth449RequesterName: '',
  rdth449RequesterEmail: '',
  createdByUserId: '',
  rdth449Department: '',
  rdth449AttendeesCount: '',
  rdth449StartDate: today(),
  rdth449EndDate: today(),
  rdth449StartTime: '',
  rdth449EndTime: '',
  rdth449Location: '',
  rdth449Company: '',
  rdth449GeneralObjective: '',
  rdth449SpecificObjectives: '',
  rdth449Skills: '',
  rdth449OtherNeeds: '',
  rdth449Observations: '',
  rdth449HiringType: '',
  rdth449EventCorresponds: '',
  rdth449OptionalNotes: '',
  rdth449Confirmed: false,
};

export const useReservationForm = (presets = {}) => {
  const [form, setForm] = useState({ ...initialForm, ...presets });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { addReservation } = useReservations();

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Validación visual en tiempo real
    const err = validate();
    setError(err || '');
    if (field !== 'selectedEquipment') {
      setSuccess('');
    }
  };

  const validate = () => {
    if (!form.rdth449CourseName.trim()) return 'El nombre del curso o evento es obligatorio.';
    if (!form.rdth449RequesterName.trim()) return 'El nombre del solicitante es obligatorio.';
    if (!form.rdth449RequesterEmail.trim()) return 'El correo electrónico es obligatorio.';
    if (!form.rdth449Department.trim()) return 'La dirección/departamento es obligatoria.';
    if (!form.roomId) return 'Selecciona una sala.';
    if (!form.rdth449StartDate) return 'La fecha es obligatoria.';
    if (!form.rdth449EndDate) return 'La fecha fin es obligatoria.';
    {
      const day = new Date(`${form.rdth449StartDate}T00:00:00`).getDay();
      if (day === 0 || day === 6) return 'No se permiten reservas en fin de semana. Selecciona un día entre lunes y viernes.';
    }
    {
      const endDay = new Date(`${form.rdth449EndDate}T00:00:00`).getDay();
      if (endDay === 0 || endDay === 6) return 'La fecha fin no puede ser fin de semana. Selecciona un día entre lunes y viernes.';
    }
    if (form.rdth449EndDate < form.rdth449StartDate) {
      return 'La fecha fin debe ser igual o posterior a la fecha inicio.';
    }
    if (!form.rdth449StartTime || !form.rdth449EndTime) return 'El horario de inicio y término son obligatorios.';
    const startHour = parseInt((form.rdth449StartTime || '00:00').split(':')[0], 10);
    const endHour = parseInt((form.rdth449EndTime || '00:00').split(':')[0], 10);
    const durationHours = endHour - startHour;
    if (durationHours <= 0) return 'El horario de término debe ser posterior al horario de inicio.';
    if (!form.rdth449AttendeesCount || parseInt(form.rdth449AttendeesCount) < 1) return 'El número de asistentes es obligatorio.';
    if (!form.rdth449GeneralObjective.trim()) return 'Los antecedentes (objetivo general) son obligatorios.';
    if (!form.rdth449SpecificObjectives.trim()) return 'Los objetivos específicos son obligatorios.';
    if (!form.rdth449Skills.trim()) return 'Los conocimientos y destrezas son obligatorios.';
    if (!form.rdth449Observations.trim()) return 'Las observaciones y requerimientos son obligatorios.';
    if (!form.rdth449Confirmed) return 'Debes confirmar que el formulario R-DTH-449 está completo.';
    if (form.servesSnack === 'yes') {
      if (durationHours <= 3) return 'El área de cafetería solo está disponible para capacitaciones con duración mayor a 3 horas.';
      if (!form.snackTime || !form.snackEndTime) return 'Si necesitas cafetería, indica el horario de refrigerio.';
    }
    if (form.isUrgentRequest && !(form.uniqueCode || form.code || '').trim()) {
      return 'Para marcar la reserva como urgente debes ingresar el código único del Administrador.';
    }
    if (form.isUrgentRequest) {
      const codeToValidate = (form.uniqueCode || form.code || '').trim().toUpperCase();
      if (!isUniqueCodeAvailable(codeToValidate)) {
        return 'El código único no es válido o ya fue utilizado. Genera uno nuevo en Códigos Únicos.';
      }
    }
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      alert('Error: ' + err);
      return false;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const priorityCode = form.isUrgentRequest
      ? (form.uniqueCode || form.code || '').trim().toUpperCase()
      : '';

    if (form.isUrgentRequest) {
      const consumeResult = markUniqueCodeAsUsed(priorityCode);
      if (!consumeResult.ok) {
        setLoading(false);
        setError('El código único ya no está disponible. Verifica o genera uno nuevo.');
        return false;
      }
    }

    const reservation = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guest: form.rdth449RequesterName,
      requester: form.rdth449RequesterName,
      requestedBy: form.rdth449RequesterEmail,
      createdByUserId: form.createdByUserId || form.rdth449RequesterEmail,
      title: form.rdth449CourseName,
      room: form.rdth449Location,
      roomId: form.roomId,
      date: form.rdth449StartDate,
      checkIn: form.rdth449StartDate,
      checkOut: form.rdth449EndDate,
      startTime: form.rdth449StartTime,
      endTime: form.rdth449EndTime,
      status: 'pending',
      attendees: parseInt(form.rdth449AttendeesCount),
      setupType: form.setupType,
      requesterEmail: form.rdth449RequesterEmail,
      department: form.rdth449Department,
      description: form.rdth449GeneralObjective,
      objectives: form.rdth449SpecificObjectives,
      skills: form.rdth449Skills,
      observations: form.rdth449Observations,
      servesSnack: form.servesSnack,
      snackTime: form.snackTime,
      snackEndTime: form.snackEndTime,
      company: form.rdth449Company,
      hiringType: form.rdth449HiringType,
      eventCorresponds: form.rdth449EventCorresponds,
      optionalNotes: form.rdth449OptionalNotes,
      otherNeeds: form.rdth449OtherNeeds,
      code: priorityCode,
      uniqueCode: priorityCode,
      isUrgent: Boolean(form.isUrgentRequest && priorityCode),
      equipment: form.selectedEquipment || [],
    };

    addReservation(reservation);
    setLoading(false);
    setSuccess('¡Solicitud de reserva enviada con equipamiento incluido! Será revisada por el administrador.');
    return true;
  };

  const reset = (presets = {}) => {
    setForm({ ...initialForm, ...presets });
    setError('');
    setSuccess('');
  };

  return { form, update, submit, reset, error, success, loading };
};
