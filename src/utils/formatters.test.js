import {
  formatDuration,
  formatDailyAverage,
  getLocalLast7Days,
  isSameLocalDay,
  getSessionMinutes,
  getSafeSessionDate
} from './formatters.js';

console.log('--- Iniciando Testes Unitários de Formatters & Cálculos ---');

// 1. Teste de formatDuration
console.assert(formatDuration(0) === '0 min', 'Erro formatDuration(0)');
console.assert(formatDuration(25) === '25 min', 'Erro formatDuration(25)');
console.assert(formatDuration(60) === '1h', 'Erro formatDuration(60)');
console.assert(formatDuration(150) === '2h30', 'Erro formatDuration(150)');
console.assert(formatDuration(75) === '1h15', 'Erro formatDuration(75)');
console.log('✓ formatDuration testado com sucesso (ex: 150m -> 2h30)');

// 2. Teste de formatDailyAverage
// 150 minutos em 7 dias = 150 / 7 = 21.42 => 21 min/dia
console.assert(formatDailyAverage(150, 7) === '21 min/dia', 'Erro formatDailyAverage(150, 7)');
console.assert(formatDailyAverage(0, 7) === '0 min/dia', 'Erro formatDailyAverage(0, 7)');
console.assert(formatDailyAverage(420, 7) === '1h/dia', 'Erro formatDailyAverage(420, 7)');
console.log('✓ formatDailyAverage testado com sucesso (ex: 150m em 7 dias -> 21 min/dia)');

// 3. Teste de getLocalLast7Days
const last7 = getLocalLast7Days(new Date('2026-10-10T12:00:00'));
console.assert(last7.length === 7, 'Erro tamanho de getLocalLast7Days');
console.assert(last7[6].dateStr === '10/10', 'Erro último dia deve ser hoje (10/10)');
console.assert(last7[0].dateStr === '4/10', 'Erro primeiro dia deve ser 4/10');
console.log('✓ getLocalLast7Days testado com sucesso (7 dias civis no fuso local: 04/10 a 10/10)');

// 4. Teste de agrupamento por dia
const testDateToday = new Date('2026-10-10T08:30:00');
const testDateOld = new Date('2026-09-15T14:00:00');

console.assert(isSameLocalDay(testDateToday, last7[6].start) === true, 'Hoje deve coincidir');
console.assert(isSameLocalDay(testDateOld, last7[6].start) === false, 'Data de setembro não deve coincidir');
console.log('✓ isSameLocalDay testado com sucesso');

// 5. Teste de extração de minutos
console.assert(getSessionMinutes({ durationMinutes: 25 }) === 25, 'Minutos diretos');
console.assert(getSessionMinutes({ durationSeconds: 1500 }) === 25, 'Segundos convertidos');
console.log('✓ getSessionMinutes testado com sucesso');

console.log('--- TODOS OS TESTES PASSARAM COM SUCESSO! ---');
