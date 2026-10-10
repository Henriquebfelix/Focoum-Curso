/**
 * Formatador padronizado de durações e métricas do FocoUm.
 */

/**
 * Converte minutos em formato legível conciso: "2h30", "45 min", "2h", "0 min".
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (mins === 0) return '0 min';
  if (mins < 60) return `${mins} min`;

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${String(remainingMins).padStart(2, '0')}`;
}

/**
 * Formata a média diária a partir de valores reais: "21 min/dia", "1h15/dia", "2h/dia".
 * @param {number} totalMinutes
 * @param {number} days
 * @returns {string}
 */
export function formatDailyAverage(totalMinutes, days = 7) {
  const safeDays = Math.max(1, days);
  const total = Math.max(0, Number(totalMinutes) || 0);
  const avgMins = Math.round(total / safeDays);

  if (avgMins === 0) return '0 min/dia';
  if (avgMins < 60) return `${avgMins} min/dia`;

  const hours = Math.floor(avgMins / 60);
  const remainingMins = avgMins % 60;
  if (remainingMins === 0) {
    return `${hours}h/dia`;
  }
  return `${hours}h${String(remainingMins).padStart(2, '0')}/dia`;
}

/**
 * Retorna objeto Date seguro a partir de timestamp Firebase ou ISO string.
 * @param {any} raw
 * @returns {Date}
 */
export function getSafeSessionDate(raw) {
  if (!raw) return new Date();
  if (typeof raw?.toDate === 'function') return raw.toDate();
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Extrai minutos de uma sessão de foco.
 * @param {object} session
 * @returns {number}
 */
export function getSessionMinutes(session) {
  if (!session) return 0;
  if (typeof session.durationMinutes === 'number') return session.durationMinutes;
  if (typeof session.durationSeconds === 'number') {
    return Math.max(1, Math.round(session.durationSeconds / 60));
  }
  return 0;
}

/**
 * Gera os últimos 7 dias considerando o fuso horário local do usuário.
 * Retorna array ordenado do dia mais antigo para hoje.
 * @param {Date} [referenceDate]
 * @returns {Array<{ start: Date, end: Date, dayName: string, dateStr: string, fullDateKey: string }>}
 */
export function getLocalLast7Days(referenceDate = new Date()) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const ref = new Date(referenceDate);

  return Array.from({ length: 7 }).map((_, i) => {
    // 6 dias atrás até hoje
    const offset = 6 - i;
    const target = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - offset, 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - offset, 23, 59, 59, 999);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');

    return {
      start: target,
      end,
      dayName: daysOfWeek[target.getDay()],
      dateStr: `${target.getDate()}/${target.getMonth() + 1}`,
      fullDateKey: `${year}-${month}-${day}`
    };
  });
}

/**
 * Verifica se uma data pertence a um dia local específico (ano, mês, dia).
 * @param {Date} date
 * @param {Date} dayRef
 * @returns {boolean}
 */
export function isSameLocalDay(date, dayRef) {
  return (
    date.getFullYear() === dayRef.getFullYear() &&
    date.getMonth() === dayRef.getMonth() &&
    date.getDate() === dayRef.getDate()
  );
}
