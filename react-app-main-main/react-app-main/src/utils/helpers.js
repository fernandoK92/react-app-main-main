export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return d.toLocaleDateString('es-EC', options);
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr;
};
