import { useState, useEffect } from 'react';

export function useDateTime() {
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      setTimeStr(
        now.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return { dateStr, timeStr };
}
