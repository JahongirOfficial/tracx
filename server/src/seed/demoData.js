/**
 * Demo data seed — creates:
 *   1 businessman (demo / demo2024)
 *  10 drivers with real Uzbek names
 *  10 vehicles with Uzbek plate numbers
 *  10 completed flights with legs + expenses
 *   2 active  flights (in progress)
 *
 * Run: node src/seed/demoData.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { recalculateFlightFinances } = require('../services/flight.service');

const prisma = new PrismaClient();

/* ─── Helpers ────────────────────────────────────────── */
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ─── 10 realistic Uzbek drivers ─────────────────────── */
const DRIVERS = [
  { fullName: 'Xasan Yusupov',     username: 'xasan_yusu',   phone: '+998901234561', perTripRate: 35 },
  { fullName: 'Nodir Karimov',     username: 'nodir_kari',   phone: '+998901234562', perTripRate: 30 },
  { fullName: 'Dilshod Toshmatov', username: 'dilshod_tosh', phone: '+998901234563', perTripRate: 25 },
  { fullName: 'Bobur Nazarov',     username: 'bobur_naza',   phone: '+998901234564', perTripRate: 35 },
  { fullName: 'Alisher Mirzayev', username: 'alisher_mirz', phone: '+998901234565', perTripRate: 30 },
  { fullName: 'Sardor Holiqov',    username: 'sardor_holi',  phone: '+998901234566', perTripRate: 25 },
  { fullName: 'Javlon Qodirov',    username: 'javlon_qodi',  phone: '+998901234567', perTripRate: 35 },
  { fullName: 'Mansur Ergashev',   username: 'mansur_erga',  phone: '+998901234568', perTripRate: 30 },
  { fullName: 'Ulugbek Rahimov',   username: 'ulugbek_rahi', phone: '+998901234569', perTripRate: 25 },
  { fullName: 'Behruz Tursunov',   username: 'behruz_turs',  phone: '+998901234570', perTripRate: 35 },
];

/* ─── 10 vehicles with Uzbek plates ──────────────────── */
const VEHICLES = [
  { plateNumber: '01A123AA', brand: 'Scania',   model: 'R400',    year: 2018, color: 'Qizil',   odometer: 312000, oilKm: 310000 },
  { plateNumber: '10B456BB', brand: 'Volvo',    model: 'FH16',    year: 2020, color: 'Oq',      odometer: 185000, oilKm: 175000 },
  { plateNumber: '30C789CC', brand: 'MAN',      model: 'TGX',     year: 2019, color: 'Kulrang',  odometer: 240000, oilKm: 232000 },
  { plateNumber: '70D234DD', brand: 'Mercedes', model: 'Actros',  year: 2021, color: 'Qora',    odometer: 98000,  oilKm: 95000  },
  { plateNumber: '26E567EE', brand: 'DAF',      model: 'XF',      year: 2019, color: 'Yashil',  odometer: 278000, oilKm: 270000 },
  { plateNumber: '40F890FF', brand: 'Renault',  model: 'T520',    year: 2020, color: 'Oq',      odometer: 143000, oilKm: 140000 },
  { plateNumber: '50G345GG', brand: 'Iveco',    model: 'Stralis', year: 2018, color: 'Ko\'k',   odometer: 356000, oilKm: 350000 },
  { plateNumber: '60H678HH', brand: 'Scania',   model: 'S500',    year: 2022, color: 'Kulrang',  odometer: 62000,  oilKm: 60000  },
  { plateNumber: '75I901II', brand: 'Volvo',    model: 'FM',      year: 2019, color: 'Qizil',   odometer: 198000, oilKm: 190000 },
  { plateNumber: '20J012JJ', brand: 'MAN',      model: 'TGS',     year: 2020, color: 'Sariq',   odometer: 127000, oilKm: 120000 },
];

/* ─── Completed flight scenarios ─────────────────────── */
const COMPLETED_FLIGHTS = [
  {
    driverIdx: 0, vehicleIdx: 0,
    flightType: 'international', roadMoney: 500_000, driverProfitPercent: 35,
    startOdometer: 310000, endOdometer: 314500,
    startedAt: daysAgo(40), completedAt: daysAgo(33),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Moskva', cargo: 'Meva-sabzavot', weight: 18, payment: 15_000_000, paymentType: 'cash', fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 1_800_000, currency: 'UZS', desc: 'Dizel yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 250_000,   currency: 'UZS', desc: 'Yo\'lda ovqat',   timing: 'during' },
      { type: 'toll',        amount: 120_000,   currency: 'UZS', desc: 'Yo\'l to\'lovi',  timing: 'during' },
      { type: 'border',      amount: 800_000,   currency: 'UZS', desc: 'Chegara',         timing: 'during' },
    ],
  },
  {
    driverIdx: 1, vehicleIdx: 1,
    flightType: 'domestic', roadMoney: 200_000, driverProfitPercent: 30,
    startOdometer: 183000, endOdometer: 185800,
    startedAt: daysAgo(35), completedAt: daysAgo(30),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Samarqand', cargo: 'Qurilish mollari', weight: 20, payment: 3_500_000, paymentType: 'cash',     fee: 0 },
      { fromCity: 'Samarqand', toCity: 'Buxoro',    cargo: 'Oziq-ovqat',       weight: 15, payment: 2_800_000, paymentType: 'transfer', fee: 3 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 420_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 80_000,  currency: 'UZS', desc: 'Ovqat',     timing: 'during' },
    ],
  },
  {
    driverIdx: 2, vehicleIdx: 2,
    flightType: 'international', roadMoney: 400_000, driverProfitPercent: 25,
    startOdometer: 238000, endOdometer: 242000,
    startedAt: daysAgo(30), completedAt: daysAgo(24),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Novosibirsk', cargo: 'Paxta',       weight: 22, payment: 18_000_000, paymentType: 'cash',       fee: 0 },
      { fromCity: 'Novosibirsk', toCity: 'Toshkent', cargo: 'Elektronika', weight: 8,  payment: 9_000_000,  paymentType: 'peritsena',  fee: 5 },
    ],
    expenses: [
      { type: 'fuel_diesel',   amount: 2_200_000, currency: 'UZS', desc: 'Dizel',      timing: 'during' },
      { type: 'border_customs', amount: 1_200_000, currency: 'UZS', desc: 'Bojxona',    timing: 'during' },
      { type: 'hotel',          amount: 300_000,   currency: 'UZS', desc: 'Mehmonxona', timing: 'during' },
    ],
  },
  {
    driverIdx: 3, vehicleIdx: 3,
    flightType: 'domestic', roadMoney: 150_000, driverProfitPercent: 35,
    startOdometer: 96000, endOdometer: 98400,
    startedAt: daysAgo(28), completedAt: daysAgo(25),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Farg\'ona',    cargo: 'Tekstil',  weight: 12, payment: 2_200_000, paymentType: 'cash',     fee: 0 },
      { fromCity: 'Farg\'ona',  toCity: 'Namangan',    cargo: 'Idish',    weight: 10, payment: 1_800_000, paymentType: 'transfer', fee: 2 },
      { fromCity: 'Namangan', toCity: 'Toshkent',    cargo: 'Bo\'sh',   weight: 0,  payment: 800_000,   paymentType: 'cash',     fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 380_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'wash',        amount: 50_000,  currency: 'UZS', desc: 'Yuvish',    timing: 'during' },
    ],
  },
  {
    driverIdx: 4, vehicleIdx: 4,
    flightType: 'international', roadMoney: 600_000, driverProfitPercent: 30,
    startOdometer: 274000, endOdometer: 278200,
    startedAt: daysAgo(25), completedAt: daysAgo(18),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Sankt-Peterburg', cargo: 'Qishloq xo\'jaligi', weight: 20, payment: 22_000_000, paymentType: 'cash', fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel',  amount: 2_800_000, currency: 'UZS', desc: 'Dizel',      timing: 'during' },
      { type: 'food',         amount: 400_000,   currency: 'UZS', desc: 'Ovqat',      timing: 'during' },
      { type: 'toll',         amount: 250_000,   currency: 'UZS', desc: 'To\'lovlar', timing: 'during' },
      { type: 'border',       amount: 900_000,   currency: 'UZS', desc: 'Chegara',    timing: 'during' },
      { type: 'parking',      amount: 80_000,    currency: 'UZS', desc: 'Parkovka',   timing: 'during' },
    ],
  },
  {
    driverIdx: 5, vehicleIdx: 5,
    flightType: 'domestic', roadMoney: 250_000, driverProfitPercent: 25,
    startOdometer: 140000, endOdometer: 143200,
    startedAt: daysAgo(22), completedAt: daysAgo(19),
    legs: [
      { fromCity: 'Toshkent',  toCity: 'Urganch',   cargo: 'Sement',     weight: 25, payment: 4_500_000, paymentType: 'cash', fee: 0 },
      { fromCity: 'Urganch',   toCity: 'Nukus',      cargo: 'Qum-shag\'al', weight: 20, payment: 3_200_000, paymentType: 'cash', fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 650_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 120_000, currency: 'UZS', desc: 'Ovqat',     timing: 'during' },
      { type: 'fine',        amount: 200_000, currency: 'UZS', desc: 'Jarima',    timing: 'during' },
    ],
  },
  {
    driverIdx: 6, vehicleIdx: 6,
    flightType: 'international', roadMoney: 500_000, driverProfitPercent: 35,
    startOdometer: 350000, endOdometer: 356100,
    startedAt: daysAgo(20), completedAt: daysAgo(13),
    legs: [
      { fromCity: 'Toshkent',  toCity: 'Yekatеrinburg', cargo: 'Rezina',   weight: 15, payment: 16_000_000, paymentType: 'cash',      fee: 0 },
      { fromCity: 'Yekaterinburg', toCity: 'Toshkent',  cargo: 'Mashina ehtiyot qismlari', weight: 10, payment: 8_500_000, paymentType: 'peritsena', fee: 4 },
    ],
    expenses: [
      { type: 'fuel_diesel',  amount: 2_100_000, currency: 'UZS', desc: 'Dizel',       timing: 'during' },
      { type: 'border',       amount: 700_000,   currency: 'UZS', desc: 'Chegara',     timing: 'during' },
      { type: 'hotel',        amount: 250_000,   currency: 'UZS', desc: 'Hotel',       timing: 'during' },
      { type: 'repair_small', amount: 450_000,   currency: 'UZS', desc: 'Mayda ta\'mir', timing: 'during' },
    ],
  },
  {
    driverIdx: 7, vehicleIdx: 7,
    flightType: 'domestic', roadMoney: 200_000, driverProfitPercent: 30,
    startOdometer: 60000, endOdometer: 62400,
    startedAt: daysAgo(15), completedAt: daysAgo(12),
    legs: [
      { fromCity: 'Toshkent',  toCity: 'Termiz',    cargo: 'Pivo',      weight: 18, payment: 5_000_000, paymentType: 'cash',     fee: 0 },
      { fromCity: 'Termiz',    toCity: 'Qashqadaryo', cargo: 'Paxtamoyi', weight: 14, payment: 3_800_000, paymentType: 'transfer', fee: 3 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 520_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 95_000,  currency: 'UZS', desc: 'Ovqat',     timing: 'during' },
      { type: 'toll',        amount: 45_000,  currency: 'UZS', desc: 'Yo\'l to\'lovi', timing: 'during' },
    ],
  },
  {
    driverIdx: 8, vehicleIdx: 8,
    flightType: 'international', roadMoney: 400_000, driverProfitPercent: 25,
    startOdometer: 194000, endOdometer: 198300,
    startedAt: daysAgo(10), completedAt: daysAgo(4),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Qozon',   cargo: 'Gilam',    weight: 16, payment: 13_500_000, paymentType: 'cash', fee: 0 },
      { fromCity: 'Qozon',    toCity: 'Toshkent', cargo: 'Shisha',   weight: 12, payment: 6_000_000,  paymentType: 'cash', fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel',    amount: 1_950_000, currency: 'UZS', desc: 'Dizel',      timing: 'during' },
      { type: 'border_customs', amount: 600_000,   currency: 'UZS', desc: 'Bojxona',    timing: 'during' },
      { type: 'food',           amount: 280_000,   currency: 'UZS', desc: 'Ovqat',      timing: 'during' },
      { type: 'parking',        amount: 60_000,    currency: 'UZS', desc: 'Parkovka',   timing: 'during' },
    ],
  },
  {
    driverIdx: 9, vehicleIdx: 9,
    flightType: 'domestic', roadMoney: 180_000, driverProfitPercent: 35,
    startOdometer: 124000, endOdometer: 127100,
    startedAt: daysAgo(8), completedAt: daysAgo(5),
    legs: [
      { fromCity: 'Toshkent',  toCity: 'Jizzax',   cargo: 'Un',       weight: 20, payment: 2_800_000, paymentType: 'cash', fee: 0 },
      { fromCity: 'Jizzax',    toCity: 'Sirdaryo',  cargo: 'Sholi',    weight: 18, payment: 2_200_000, paymentType: 'cash', fee: 0 },
      { fromCity: 'Sirdaryo',  toCity: 'Toshkent',  cargo: 'Paxta',   weight: 15, payment: 1_900_000, paymentType: 'cash', fee: 0 },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 390_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 70_000,  currency: 'UZS', desc: 'Ovqat',     timing: 'during' },
      { type: 'wash',        amount: 40_000,  currency: 'UZS', desc: 'Yuvish',    timing: 'during' },
    ],
  },
];

/* ─── 2 active (in-progress) flights ─────────────────── */
const ACTIVE_FLIGHTS = [
  {
    driverIdx: 0, vehicleIdx: 0,
    flightType: 'international', roadMoney: 500_000, driverProfitPercent: 35,
    startOdometer: 314500,
    startedAt: daysAgo(2),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Moskva', cargo: 'Meva-sabzavot', weight: 20, payment: 16_000_000, paymentType: 'cash', fee: 0, status: 'completed' },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 1_600_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
      { type: 'food',        amount: 200_000,   currency: 'UZS', desc: 'Ovqat',     timing: 'during' },
    ],
  },
  {
    driverIdx: 3, vehicleIdx: 3,
    flightType: 'domestic', roadMoney: 200_000, driverProfitPercent: 35,
    startOdometer: 98400,
    startedAt: daysAgo(1),
    legs: [
      { fromCity: 'Toshkent', toCity: 'Samarqand', cargo: 'Elektronika', weight: 8, payment: 4_200_000, paymentType: 'cash', fee: 0, status: 'pending' },
    ],
    expenses: [
      { type: 'fuel_diesel', amount: 280_000, currency: 'UZS', desc: 'Yoqilg\'i', timing: 'during' },
    ],
  },
];

/* ─── Main seed function ──────────────────────────────── */
async function seedDemo() {
  console.log('🌱 Demo ma\'lumotlarni yuklash boshlanmoqda...\n');

  /* ── 1. Businessman ── */
  const password = await bcrypt.hash('demo2024', 10);
  const trialEnd = new Date(Date.now() + 30 * 86_400_000); // 30 days from now

  let biz = await prisma.businessman.findUnique({ where: { username: 'demo' } });
  if (!biz) {
    biz = await prisma.businessman.create({
      data: {
        username: 'demo',
        password,
        fullName: 'Abdullayev Jasur',
        phone: '+998901111111',
        companyName: 'JA Transport LLC',
        plan: 'basic',
        subscriptionEnd: trialEnd,
      },
    });
    console.log(`✅ Biznesmen yaratildi: demo / demo2024  (ID: ${biz.id})`);
  } else {
    console.log(`ℹ️  Biznesmen allaqachon mavjud: demo`);
  }

  const bizId = biz.id;
  const driverPassword = await bcrypt.hash('driver2024', 10);

  /* ── 2. Drivers ── */
  const createdDrivers = [];
  for (const d of DRIVERS) {
    let driver = await prisma.driver.findUnique({ where: { username: d.username } });
    if (!driver) {
      driver = await prisma.driver.create({
        data: {
          businessmanId: bizId,
          username: d.username,
          password: driverPassword,
          fullName: d.fullName,
          phone: d.phone,
          paymentType: 'per_trip',
          perTripRate: d.perTripRate,
          status: 'free',
          currentBalance: rnd(0, 500_000),
        },
      });
      console.log(`✅ Haydovchi: ${d.fullName} (${d.username})`);
    } else {
      console.log(`ℹ️  Haydovchi mavjud: ${d.username}`);
    }
    createdDrivers.push(driver);
  }

  /* ── 3. Vehicles ── */
  const createdVehicles = [];
  for (const v of VEHICLES) {
    let vehicle = await prisma.vehicle.findFirst({
      where: { businessmanId: bizId, plateNumber: v.plateNumber },
    });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          businessmanId: bizId,
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color,
          currentOdometer: v.odometer,
          lastOilChangeKm: v.oilKm,
          oilChangeIntervalKm: 10_000,
          status: 'normal',
        },
      });
      console.log(`✅ Mashina: ${v.brand} ${v.model} — ${v.plateNumber}`);
    } else {
      console.log(`ℹ️  Mashina mavjud: ${v.plateNumber}`);
    }
    createdVehicles.push(vehicle);
  }

  /* ── 4. Completed flights ── */
  console.log('\n📦 Yakunlangan reyslar yaratilmoqda...');
  for (let i = 0; i < COMPLETED_FLIGHTS.length; i++) {
    const cfg = COMPLETED_FLIGHTS[i];
    const driver = createdDrivers[cfg.driverIdx];
    const vehicle = createdVehicles[cfg.vehicleIdx];

    const flight = await prisma.flight.create({
      data: {
        businessmanId: bizId,
        driverId: driver.id,
        vehicleId: vehicle.id,
        flightType: cfg.flightType,
        roadMoney: cfg.roadMoney,
        driverProfitPercent: cfg.driverProfitPercent,
        startOdometer: cfg.startOdometer,
        endOdometer: cfg.endOdometer,
        status: 'completed',
        startedAt: cfg.startedAt,
        completedAt: cfg.completedAt,
      },
    });

    for (const leg of cfg.legs) {
      const feeAmt = (leg.payment * leg.fee) / 100;
      await prisma.leg.create({
        data: {
          flightId: flight.id,
          fromCity: leg.fromCity,
          toCity: leg.toCity,
          cargo: leg.cargo,
          weight: leg.weight,
          payment: leg.payment,
          paymentType: leg.paymentType,
          transferFeePercent: leg.fee,
          transferFeeAmount: feeAmt,
          netPayment: leg.payment - feeAmt,
          status: 'completed',
        },
      });
    }

    for (const exp of cfg.expenses) {
      const amtUZS = exp.currency === 'USD' ? exp.amount * 12800 : exp.amount;
      await prisma.expense.create({
        data: {
          flightId: flight.id,
          type: exp.type,
          expenseClass: ['repair_major', 'tire', 'accident', 'insurance'].includes(exp.type) ? 'heavy' : 'light',
          amount: exp.amount,
          currency: exp.currency,
          amountInUZS: amtUZS,
          description: exp.desc,
          timing: exp.timing,
          addedBy: 'businessman',
          addedById: bizId,
        },
      });
    }

    await recalculateFlightFinances(flight.id);
    console.log(`  ✅ Reys ${i + 1}: ${driver.fullName} — ${vehicle.plateNumber} (yakunlangan)`);
  }

  /* ── 5. Active flights ── */
  console.log('\n✈️  Faol reyslar yaratilmoqda...');
  for (let i = 0; i < ACTIVE_FLIGHTS.length; i++) {
    const cfg = ACTIVE_FLIGHTS[i];
    const driver = createdDrivers[cfg.driverIdx];
    const vehicle = createdVehicles[cfg.vehicleIdx];

    const flight = await prisma.flight.create({
      data: {
        businessmanId: bizId,
        driverId: driver.id,
        vehicleId: vehicle.id,
        flightType: cfg.flightType,
        roadMoney: cfg.roadMoney,
        driverProfitPercent: cfg.driverProfitPercent,
        startOdometer: cfg.startOdometer,
        status: 'active',
        startedAt: cfg.startedAt,
      },
    });

    for (const leg of cfg.legs) {
      const feeAmt = (leg.payment * (leg.fee || 0)) / 100;
      await prisma.leg.create({
        data: {
          flightId: flight.id,
          fromCity: leg.fromCity,
          toCity: leg.toCity,
          cargo: leg.cargo,
          weight: leg.weight,
          payment: leg.payment,
          paymentType: leg.paymentType,
          transferFeePercent: leg.fee || 0,
          transferFeeAmount: feeAmt,
          netPayment: leg.payment - feeAmt,
          status: leg.status || 'pending',
        },
      });
    }

    for (const exp of cfg.expenses) {
      const amtUZS = exp.currency === 'USD' ? exp.amount * 12800 : exp.amount;
      await prisma.expense.create({
        data: {
          flightId: flight.id,
          type: exp.type,
          expenseClass: 'light',
          amount: exp.amount,
          currency: exp.currency,
          amountInUZS: amtUZS,
          description: exp.desc,
          timing: exp.timing,
          addedBy: 'businessman',
          addedById: bizId,
        },
      });
    }

    // Mark driver as busy
    await prisma.driver.update({ where: { id: driver.id }, data: { status: 'busy' } });
    await recalculateFlightFinances(flight.id);
    console.log(`  ✅ Faol reys ${i + 1}: ${driver.fullName} — ${vehicle.plateNumber} (faol)`);
  }

  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('━'.repeat(45));
  console.log('🔑 Kirish ma\'lumotlari:');
  console.log('   Biznesmen  → demo / demo2024');
  console.log('   Haydovchi  → xasan_yusu / driver2024  (va boshqalar)');
  console.log('━'.repeat(45));
}

seedDemo()
  .catch((e) => { console.error('❌ Xato:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
