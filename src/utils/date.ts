const pad = (n: number) => String(n).padStart(2, '0');

export const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const addDays = (k: string, n: number) => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

/** The 7 day keys (Monday first) of the week containing `k`. */
export const weekKeys = (k: string) => {
  const d = fromKey(k);
  const offset = (d.getDay() + 6) % 7;
  const monday = addDays(k, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const monthOf = (k: string) => k.slice(0, 7); // yyyy-mm

export const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const monthDays = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${ym}-${pad(i + 1)}`);
};

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const longDayLabel = (k: string) =>
  fromKey(k).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

export const parseNum = (text: string): number | undefined => {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

export const fmtMoney = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

export const fmtNum = (n: number) => Math.round(n).toLocaleString('es-ES');
