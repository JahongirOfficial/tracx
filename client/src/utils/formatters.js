export const formatMoney = (amount, currency = 'UZS', short = false) => {
  const num = parseFloat(amount) || 0;
  if (short && num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M ${currency}`;
  }
  if (short && num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K ${currency}`;
  }
  return new Intl.NumberFormat('uz-UZ').format(Math.round(num)) + ' ' + currency;
};

export const formatDate = (date, short = false) => {
  if (!date) return '—';
  const d = new Date(date);
  if (short) {
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Format stored phone digits (9 digits) to display: +998 XX XXX XX XX
 * Also handles already-formatted strings.
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '');
  // Handle with or without country code
  const local = digits.startsWith('998') ? digits.slice(3) : digits;
  if (local.length !== 9) return phone; // can't format, return as-is
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
};

/**
 * Format raw plate string (e.g. "01A123AA") to display: "01 A 123 AA"
 */
export const formatPlate = (plate) => {
  if (!plate) return '—';
  const clean = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  let out = '';
  for (let i = 0; i < clean.length; i++) {
    if (i === 2 || i === 3 || i === 6) out += ' ';
    out += clean[i];
  }
  return out.trim() || plate;
};

export const formatOdometer = (km) => {
  if (!km) return '0 km';
  return new Intl.NumberFormat('uz-UZ').format(km) + ' km';
};

export const getDaysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
