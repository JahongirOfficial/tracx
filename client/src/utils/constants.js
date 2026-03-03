export const EXPENSE_TYPES = [
  { value: 'fuel', label: 'Yoqilg\'i', class: 'light', emoji: '⛽' },
  { value: 'fuel_metan', label: 'Metan', class: 'light', emoji: '🔵' },
  { value: 'fuel_propan', label: 'Propan', class: 'light', emoji: '🟡' },
  { value: 'fuel_benzin', label: 'Benzin', class: 'light', emoji: '⛽' },
  { value: 'fuel_diesel', label: 'Dizel', class: 'light', emoji: '⛽' },
  { value: 'food', label: 'Ovqat', class: 'light', emoji: '🍽️' },
  { value: 'toll', label: 'Yo\'l to\'lovi', class: 'light', emoji: '🛣️' },
  { value: 'wash', label: 'Yuvish', class: 'light', emoji: '🚿' },
  { value: 'fine', label: 'Jarima', class: 'light', emoji: '📋' },
  { value: 'repair_small', label: 'Mayda ta\'mir', class: 'light', emoji: '🔧' },
  { value: 'parking', label: 'Parkovka', class: 'light', emoji: '🅿️' },
  { value: 'hotel', label: 'Mehmonxona', class: 'light', emoji: '🏨' },
  { value: 'phone', label: 'Telefon', class: 'light', emoji: '📱' },
  { value: 'platon', label: 'Platon', class: 'light', emoji: '🛤️' },
  { value: 'border', label: 'Chegara', class: 'light', emoji: '🛂' },
  { value: 'other', label: 'Boshqa', class: 'light', emoji: '📌' },
  { value: 'repair_major', label: 'Katta ta\'mir', class: 'heavy', emoji: '🔩' },
  { value: 'tire', label: 'Shina', class: 'heavy', emoji: '🛞' },
  { value: 'accident', label: 'Baxtsiz hodisa', class: 'heavy', emoji: '💥' },
  { value: 'insurance', label: 'Sug\'urta', class: 'heavy', emoji: '🛡️' },
  { value: 'oil', label: 'Motor yog\'i', class: 'heavy', emoji: '🛢️' },
  { value: 'border_customs', label: 'Bojxona', class: 'heavy', emoji: '📦' },
];

export const PAYMENT_TYPES = [
  { value: 'cash', label: 'Naqd' },
  { value: 'peritsena', label: 'Peritsena' },
  { value: 'card', label: 'Karta' },
  { value: 'transfer', label: 'O\'tkazma' },
  { value: 'other', label: 'Boshqa' },
];

export const FLIGHT_STATUSES = [
  { value: 'active', label: 'Faol', color: 'blue' },
  { value: 'completed', label: 'Yakunlangan', color: 'green' },
  { value: 'cancelled', label: 'Bekor qilingan', color: 'red' },
];

export const DRIVER_STATUSES = [
  { value: 'free', label: 'Bo\'sh', color: 'green' },
  { value: 'busy', label: 'Band', color: 'orange' },
  { value: 'offline', label: 'Offline', color: 'gray' },
];

export const VEHICLE_STATUSES = [
  { value: 'excellent', label: 'A\'lo', color: 'green' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'attention', label: 'E\'tibor kerak', color: 'orange' },
  { value: 'critical', label: 'Kritik', color: 'red' },
];

export const LEG_STATUSES = [
  { value: 'pending', label: 'Kutilmoqda', color: 'gray' },
  { value: 'in_progress', label: 'Jarayonda', color: 'blue' },
  { value: 'completed', label: 'Yakunlangan', color: 'green' },
  { value: 'cancelled', label: 'Bekor', color: 'red' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'To\'lanmagan', color: 'red' },
  { value: 'partial', label: 'Qisman', color: 'orange' },
  { value: 'paid', label: 'To\'liq', color: 'green' },
];

export const MAINTENANCE_TYPES = [
  { value: 'oil_change', label: 'Moy almashtirish' },
  { value: 'tire_change', label: 'Shina almashtirish' },
  { value: 'repair', label: 'Ta\'mirlash' },
  { value: 'inspection', label: 'Tekshiruv' },
];

export const EMPLOYEE_PERMISSION_GROUPS = [
  {
    group: 'Reyslar',
    permissions: [
      { value: 'view_flights',    label: 'Ko\'rish' },
      { value: 'create_flight',   label: 'Yaratish' },
      { value: 'edit_flight',     label: 'Tahrirlash' },
      { value: 'delete_flight',   label: "O'chirish" },
      { value: 'complete_flight', label: 'Yakunlash' },
      { value: 'cancel_flight',   label: 'Bekor qilish' },
    ],
  },
  {
    group: "Yo'nalishlar",
    permissions: [
      { value: 'view_legs',  label: 'Ko\'rish' },
      { value: 'add_leg',    label: 'Qo\'shish' },
      { value: 'edit_leg',   label: 'Tahrirlash' },
      { value: 'delete_leg', label: "O'chirish" },
    ],
  },
  {
    group: 'Xarajatlar',
    permissions: [
      { value: 'view_expenses',   label: 'Ko\'rish' },
      { value: 'add_expense',     label: 'Qo\'shish' },
      { value: 'edit_expense',    label: 'Tahrirlash' },
      { value: 'delete_expense',  label: "O'chirish" },
    ],
  },
  {
    group: 'Haydovchilar',
    permissions: [
      { value: 'view_drivers',   label: 'Ko\'rish' },
      { value: 'create_driver',  label: 'Yaratish' },
      { value: 'edit_driver',    label: 'Tahrirlash' },
      { value: 'delete_driver',  label: "O'chirish" },
      { value: 'pay_salary',     label: 'Maosh to\'lash' },
    ],
  },
  {
    group: 'Mashinalar',
    permissions: [
      { value: 'view_vehicles',   label: 'Ko\'rish' },
      { value: 'create_vehicle',  label: 'Yaratish' },
      { value: 'edit_vehicle',    label: 'Tahrirlash' },
      { value: 'delete_vehicle',  label: "O'chirish" },
      { value: 'assign_driver',   label: 'Haydovchi biriktirish' },
      { value: 'add_maintenance', label: 'Xarajat qo\'shish' },
    ],
  },
  {
    group: 'Hisobotlar & Moliya',
    permissions: [
      { value: 'view_reports',        label: 'Hisobotlar' },
      { value: 'view_finance',        label: 'Moliya ko\'rish' },
      { value: 'add_driver_payment',  label: 'To\'lov kiritish' },
    ],
  },
  {
    group: 'Xodimlar',
    permissions: [
      { value: 'view_employees',    label: 'Ko\'rish' },
      { value: 'create_employee',   label: 'Yaratish' },
      { value: 'edit_employee',     label: 'Tahrirlash' },
      { value: 'delete_employee',   label: "O'chirish" },
    ],
  },
];

export const EMPLOYEE_POSITIONS = [
  { value: 'dispatcher', label: 'Dispetcher' },
  { value: 'accountant', label: 'Buxgalter' },
  { value: 'manager', label: 'Menejer' },
  { value: 'logist', label: 'Logist' },
  { value: 'operator', label: 'Operator' },
  { value: 'other', label: 'Boshqa' },
];
