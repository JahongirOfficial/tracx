/**
 * Seed: "biznes" foydalanuvchisi uchun to'liq demo ma'lumotlar
 * Run: node src/seed/biznesDemo.js
 *
 * Yaratadi:
 *  - 1 biznesmen  (biznes / 20100804)
 *  - 10 haydovchi
 *  - 10 mashina (ba'zilari texnik xizmat kerak)
 *  - 15 yakunlangan reys + 2 faol reys
 *  - Har reys uchun yo'nalishlar va xarajatlar
 *  - Balans tranzaksiyalari (to'ldirish + kunlik yechimlar)
 *  - Ish haqqi to'lovlari
 *  - Texnik xizmat yozuvlari
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { recalculateFlightFinances } = require('../services/flight.service');

const prisma = new PrismaClient();

const daysAgo  = (d) => new Date(Date.now() - d * 86_400_000);
const daysFrom = (d) => new Date(Date.now() + d * 86_400_000);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ── Haydovchilar ─────────────────────────────────────── */
const DRIVERS = [
  { fullName: 'Mansur Raximov',    username: 'biznes_mansur',  phone: '+998901110001', perTripRate: 35, salary: 0 },
  { fullName: 'Jasur Norqo\'ldiev', username: 'biznes_jasur',   phone: '+998901110002', perTripRate: 30, salary: 0 },
  { fullName: 'Sherzod Aliyev',    username: 'biznes_sherzod', phone: '+998901110003', perTripRate: 25, salary: 0 },
  { fullName: 'Doniyor Tursunov',  username: 'biznes_doniyor', phone: '+998901110004', perTripRate: 35, salary: 0 },
  { fullName: 'Firdavs Xasanov',   username: 'biznes_firdavs', phone: '+998901110005', perTripRate: 30, salary: 0 },
  { fullName: 'Otabek Yuldashev',  username: 'biznes_otabek',  phone: '+998901110006', perTripRate: 25, salary: 0 },
  { fullName: 'Sanjar Qodirov',    username: 'biznes_sanjar',  phone: '+998901110007', perTripRate: 35, salary: 0 },
  { fullName: 'Bekzod Sobirov',    username: 'biznes_bekzod',  phone: '+998901110008', perTripRate: 30, salary: 0 },
  { fullName: 'Husan Ergashev',    username: 'biznes_husan',   phone: '+998901110009', perTripRate: 25, salary: 0 },
  { fullName: 'Zafar Mirzayev',    username: 'biznes_zafar',   phone: '+998901110010', perTripRate: 35, salary: 0 },
];

/* ── Mashinalar ───────────────────────────────────────── */
const VEHICLES = [
  { plate: 'BIZ001AA', brand: 'Scania',   model: 'R450',    year: 2020, color: 'Oq',     odo: 245000, oilAt: 240000, interval: 10000 },
  { plate: 'BIZ002BB', brand: 'Volvo',    model: 'FH16',    year: 2019, color: 'Kulrang', odo: 312000, oilAt: 305000, interval: 10000 },
  { plate: 'BIZ003CC', brand: 'MAN',      model: 'TGX 480', year: 2021, color: 'Qora',   odo: 87000,  oilAt: 85000,  interval: 10000 },
  { plate: 'BIZ004DD', brand: 'Mercedes', model: 'Actros',  year: 2018, color: 'Yashil', odo: 420000, oilAt: 415000, interval: 10000 },
  { plate: 'BIZ005EE', brand: 'DAF',      model: 'XF 530',  year: 2022, color: 'Oq',     odo: 42000,  oilAt: 40000,  interval: 10000 },
  { plate: 'BIZ006FF', brand: 'Renault',  model: 'T 480',   year: 2020, color: 'Ko\'k',  odo: 178000, oilAt: 175000, interval: 10000 },
  { plate: 'BIZ007GG', brand: 'Iveco',    model: 'Stralis', year: 2019, color: 'Qizil',  odo: 290000, oilAt: 283000, interval: 10000 },
  { plate: 'BIZ008HH', brand: 'Scania',   model: 'S 500',   year: 2021, color: 'Kulrang', odo: 134000, oilAt: 130000, interval: 10000 },
  { plate: 'BIZ009II', brand: 'Volvo',    model: 'FM 460',  year: 2018, color: 'Sariq',  odo: 381000, oilAt: 378000, interval: 10000 },
  { plate: 'BIZ010JJ', brand: 'MAN',      model: 'TGS 360', year: 2020, color: 'Oq',     odo: 156000, oilAt: 148000, interval: 10000 },
];

/* ── 15 ta yakunlangan reys ─────────────────────────────*/
const COMPLETED = [
  {
    di:0, vi:0, type:'international', road:600000, profit:35,
    oStart:240000, oEnd:244800, start:daysAgo(60), end:daysAgo(53),
    legs:[
      {from:'Toshkent',to:'Moskva',cargo:'Meva-sabzavot',kg:20,pay:18000000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:2200000,d:'Dizel yoqilg\'i'},
      {t:'food',a:320000,d:'Ovqat xarajati'},
      {t:'toll',a:150000,d:'Yo\'l to\'lovi'},
      {t:'border',a:900000,d:'Chegara xizmati'},
    ],
  },
  {
    di:1, vi:1, type:'domestic', road:200000, profit:30,
    oStart:307000, oEnd:309500, start:daysAgo(58), end:daysAgo(55),
    legs:[
      {from:'Toshkent',to:'Samarqand',cargo:'Qurilish mollari',kg:22,pay:3800000,pType:'cash',fee:0},
      {from:'Samarqand',to:'Buxoro',cargo:'Oziq-ovqat',kg:18,pay:2900000,pType:'transfer',fee:3},
    ],
    exp:[
      {t:'fuel_diesel',a:480000,d:'Yoqilg\'i'},
      {t:'food',a:90000,d:'Ovqat'},
      {t:'wash',a:60000,d:'Mashina yuvish'},
    ],
  },
  {
    di:2, vi:2, type:'international', road:500000, profit:25,
    oStart:82000, oEnd:86500, start:daysAgo(55), end:daysAgo(48),
    legs:[
      {from:'Toshkent',to:'Sankt-Peterburg',cargo:'Paxta',kg:22,pay:21000000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:2800000,d:'Dizel'},
      {t:'border_customs',a:1100000,d:'Bojxona'},
      {t:'hotel',a:350000,d:'Mehmonxona'},
      {t:'food',a:420000,d:'Ovqat'},
    ],
  },
  {
    di:3, vi:3, type:'domestic', road:180000, profit:35,
    oStart:415000, oEnd:417200, start:daysAgo(50), end:daysAgo(47),
    legs:[
      {from:'Toshkent',to:'Farg\'ona',cargo:'Tekstil',kg:15,pay:2500000,pType:'cash',fee:0},
      {from:'Farg\'ona',to:'Namangan',cargo:'Idish-tovoq',kg:12,pay:2000000,pType:'transfer',fee:2},
      {from:'Namangan',to:'Toshkent',cargo:'Bo\'sh',kg:0,pay:900000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:420000,d:'Yoqilg\'i'},
      {t:'food',a:85000,d:'Ovqat'},
    ],
  },
  {
    di:4, vi:4, type:'international', road:550000, profit:30,
    oStart:38000, oEnd:42300, start:daysAgo(45), end:daysAgo(38),
    legs:[
      {from:'Toshkent',to:'Novosibirsk',cargo:'Gilam',kg:18,pay:17500000,pType:'cash',fee:0},
      {from:'Novosibirsk',to:'Toshkent',cargo:'Elektronika',kg:10,pay:9000000,pType:'peritsena',fee:5},
    ],
    exp:[
      {t:'fuel_diesel',a:2600000,d:'Dizel'},
      {t:'border',a:800000,d:'Chegara'},
      {t:'hotel',a:280000,d:'Hotel'},
      {t:'toll',a:200000,d:'To\'lovlar'},
    ],
  },
  {
    di:5, vi:5, type:'domestic', road:220000, profit:25,
    oStart:172000, oEnd:175000, start:daysAgo(42), end:daysAgo(39),
    legs:[
      {from:'Toshkent',to:'Urganch',cargo:'Sement',kg:25,pay:4800000,pType:'cash',fee:0},
      {from:'Urganch',to:'Nukus',cargo:'Shag\'al',kg:20,pay:3500000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:720000,d:'Yoqilg\'i'},
      {t:'food',a:130000,d:'Ovqat'},
      {t:'fine',a:200000,d:'Jarima'},
    ],
  },
  {
    di:6, vi:6, type:'international', road:480000, profit:35,
    oStart:283000, oEnd:288500, start:daysAgo(38), end:daysAgo(31),
    legs:[
      {from:'Toshkent',to:'Yekaterinburg',cargo:'Rezina',kg:16,pay:15000000,pType:'cash',fee:0},
      {from:'Yekaterinburg',to:'Toshkent',cargo:'Ehtiyot qism',kg:12,pay:8000000,pType:'peritsena',fee:4},
    ],
    exp:[
      {t:'fuel_diesel',a:2400000,d:'Dizel'},
      {t:'border',a:750000,d:'Chegara'},
      {t:'repair_small',a:380000,d:'Kichik ta\'mir'},
      {t:'hotel',a:220000,d:'Hotel'},
    ],
  },
  {
    di:7, vi:7, type:'domestic', road:190000, profit:30,
    oStart:128000, oEnd:130500, start:daysAgo(35), end:daysAgo(32),
    legs:[
      {from:'Toshkent',to:'Termiz',cargo:'Pivo',kg:20,pay:5200000,pType:'cash',fee:0},
      {from:'Termiz',to:'Qashqadaryo',cargo:'Paxtamoyi',kg:16,pay:4000000,pType:'transfer',fee:3},
    ],
    exp:[
      {t:'fuel_diesel',a:560000,d:'Yoqilg\'i'},
      {t:'food',a:100000,d:'Ovqat'},
      {t:'toll',a:50000,d:'Yo\'l to\'lovi'},
    ],
  },
  {
    di:8, vi:8, type:'international', road:520000, profit:25,
    oStart:375000, oEnd:379800, start:daysAgo(30), end:daysAgo(23),
    legs:[
      {from:'Toshkent',to:'Qozon',cargo:'Gilam',kg:18,pay:14000000,pType:'cash',fee:0},
      {from:'Qozon',to:'Toshkent',cargo:'Shisha',kg:14,pay:6500000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:2100000,d:'Dizel'},
      {t:'border_customs',a:650000,d:'Bojxona'},
      {t:'food',a:300000,d:'Ovqat'},
      {t:'parking',a:70000,d:'Parkovka'},
    ],
  },
  {
    di:9, vi:9, type:'domestic', road:170000, profit:35,
    oStart:148000, oEnd:151200, start:daysAgo(28), end:daysAgo(25),
    legs:[
      {from:'Toshkent',to:'Jizzax',cargo:'Un',kg:22,pay:3000000,pType:'cash',fee:0},
      {from:'Jizzax',to:'Sirdaryo',cargo:'Sholi',kg:18,pay:2400000,pType:'cash',fee:0},
      {from:'Sirdaryo',to:'Toshkent',cargo:'Paxta',kg:15,pay:2100000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:420000,d:'Yoqilg\'i'},
      {t:'food',a:75000,d:'Ovqat'},
    ],
  },
  {
    di:0, vi:1, type:'international', road:580000, profit:35,
    oStart:309500, oEnd:314200, start:daysAgo(24), end:daysAgo(17),
    legs:[
      {from:'Toshkent',to:'Moskva',cargo:'Quruq meva',kg:19,pay:19000000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:2300000,d:'Dizel'},
      {t:'border',a:950000,d:'Chegara'},
      {t:'food',a:350000,d:'Ovqat'},
      {t:'toll',a:180000,d:'Yo\'l to\'lovi'},
    ],
  },
  {
    di:2, vi:3, type:'domestic', road:160000, profit:25,
    oStart:417200, oEnd:419000, start:daysAgo(22), end:daysAgo(20),
    legs:[
      {from:'Toshkent',to:'Andijon',cargo:'Mebel',kg:10,pay:2800000,pType:'cash',fee:0},
      {from:'Andijon',to:'Toshkent',cargo:'Bo\'sh',kg:0,pay:800000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:340000,d:'Yoqilg\'i'},
      {t:'food',a:65000,d:'Ovqat'},
    ],
  },
  {
    di:4, vi:5, type:'international', road:500000, profit:30,
    oStart:175000, oEnd:179500, start:daysAgo(18), end:daysAgo(11),
    legs:[
      {from:'Toshkent',to:'Novosibirsk',cargo:'Paxta',kg:21,pay:20000000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:2500000,d:'Dizel'},
      {t:'border_customs',a:1000000,d:'Bojxona'},
      {t:'hotel',a:300000,d:'Mehmonxona'},
    ],
  },
  {
    di:6, vi:7, type:'domestic', road:210000, profit:35,
    oStart:130500, oEnd:133000, start:daysAgo(14), end:daysAgo(11),
    legs:[
      {from:'Toshkent',to:'Samarqand',cargo:'Qurilish',kg:24,pay:4500000,pType:'cash',fee:0},
      {from:'Samarqand',to:'Buxoro',cargo:'Oziq-ovqat',kg:20,pay:3800000,pType:'transfer',fee:2},
    ],
    exp:[
      {t:'fuel_diesel',a:580000,d:'Yoqilg\'i'},
      {t:'food',a:110000,d:'Ovqat'},
      {t:'wash',a:55000,d:'Yuvish'},
    ],
  },
  {
    di:8, vi:9, type:'domestic', road:175000, profit:25,
    oStart:151200, oEnd:153800, start:daysAgo(10), end:daysAgo(7),
    legs:[
      {from:'Toshkent',to:'Qo\'qon',cargo:'Og\'ir yuk',kg:22,pay:3200000,pType:'cash',fee:0},
      {from:'Qo\'qon',to:'Farg\'ona',cargo:'Tekstil',kg:18,pay:2700000,pType:'transfer',fee:3},
      {from:'Farg\'ona',to:'Toshkent',cargo:'Bo\'sh',kg:0,pay:1100000,pType:'cash',fee:0},
    ],
    exp:[
      {t:'fuel_diesel',a:460000,d:'Yoqilg\'i'},
      {t:'food',a:80000,d:'Ovqat'},
      {t:'toll',a:40000,d:'To\'lov'},
    ],
  },
];

/* ── 2 faol reys ─────────────────────────────────────── */
const ACTIVE = [
  {
    di:1, vi:2, type:'international', road:550000, profit:30,
    oStart:86500, start:daysAgo(3),
    legs:[
      {from:'Toshkent',to:'Sankt-Peterburg',cargo:'Paxta',kg:20,pay:20000000,pType:'cash',fee:0,st:'pending'},
    ],
    exp:[
      {t:'fuel_diesel',a:1800000,d:'Dizel'},
      {t:'food',a:250000,d:'Ovqat'},
    ],
  },
  {
    di:5, vi:6, type:'domestic', road:190000, profit:25,
    oStart:288500, start:daysAgo(1),
    legs:[
      {from:'Toshkent',to:'Urganch',cargo:'Sement',kg:25,pay:5000000,pType:'cash',fee:0,st:'pending'},
    ],
    exp:[
      {t:'fuel_diesel',a:350000,d:'Yoqilg\'i'},
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   MAIN SEED
───────────────────────────────────────────────────────── */
async function seed() {
  console.log('\n🌱 "biznes" uchun seed boshlandi...\n');

  /* ── 1. Biznesmen ── */
  const hashed    = await bcrypt.hash('20100804', 10);
  const driverPwd = await bcrypt.hash('driver123', 10);

  let biz = await prisma.businessman.findUnique({ where: { username: 'biznes' } });
  if (!biz) {
    biz = await prisma.businessman.create({
      data: {
        username: 'biznes',
        password: hashed,
        fullName: 'Abdullayev Jasur Baxtiyorovich',
        phone: '+998991234567',
        companyName: 'Jasur Trans LLC',
        plan: 'pro',
        balance: 350000,
        trialEndsAt: daysAgo(5), // trial tugagan
        subscriptionEnd: daysFrom(25),
        registrationDate: daysAgo(90),
      },
    });
    console.log(`✅ Biznesmen: biznes / 20100804  (ID: ${biz.id})`);
  } else {
    console.log(`ℹ️  Biznesmen mavjud: ${biz.username}, ID: ${biz.id}`);
  }
  const bizId = biz.id;

  /* ── 2. Haydovchilar ── */
  console.log('\n👤 Haydovchilar...');
  const drivers = [];
  for (const d of DRIVERS) {
    let dr = await prisma.driver.findUnique({ where: { username: d.username } });
    if (!dr) {
      dr = await prisma.driver.create({
        data: {
          businessmanId: bizId,
          username: d.username,
          password: driverPwd,
          fullName: d.fullName,
          phone: d.phone,
          paymentType: 'per_trip',
          perTripRate: d.perTripRate,
          status: 'free',
          currentBalance: rnd(50000, 600000),
        },
      });
      console.log(`  ✅ ${d.fullName}`);
    } else {
      console.log(`  ℹ️  Mavjud: ${d.username}`);
    }
    drivers.push(dr);
  }

  /* ── 3. Mashinalar ── */
  console.log('\n🚛 Mashinalar...');
  const vehicles = [];
  for (const v of VEHICLES) {
    let veh = await prisma.vehicle.findFirst({ where: { businessmanId: bizId, plateNumber: v.plate } });
    if (!veh) {
      veh = await prisma.vehicle.create({
        data: {
          businessmanId: bizId,
          plateNumber: v.plate,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color,
          currentOdometer: v.odo,
          lastOilChangeKm: v.oilAt,
          oilChangeIntervalKm: v.interval,
          status: (v.odo - v.oilAt) >= v.interval * 0.9 ? 'oil_change' : 'normal',
        },
      });
      console.log(`  ✅ ${v.brand} ${v.model} — ${v.plate}`);
    } else {
      console.log(`  ℹ️  Mavjud: ${v.plate}`);
    }
    vehicles.push(veh);
  }

  /* ── 4. Texnik xizmat yozuvlari ── */
  console.log('\n🔧 Texnik xizmat...');
  const maintData = [
    { vi:0, type:'oil_change',   desc:'Yog\' almashtirildi 10W-40',   cost:180000, oAt:240000 },
    { vi:1, type:'tire_change',  desc:'2 ta old g\'ildirak almashtirildi', cost:850000, oAt:305000 },
    { vi:3, type:'repair_major', desc:'Dvigatel ta\'miri',             cost:2200000, oAt:415000 },
    { vi:4, type:'oil_change',   desc:'Yog\' va filtr almashtirish',   cost:195000, oAt:40000  },
    { vi:6, type:'tire_change',  desc:'4 ta g\'ildirak almashtirildi', cost:1600000, oAt:283000 },
    { vi:8, type:'oil_change',   desc:'Yog\' almashtirildi',           cost:175000, oAt:378000 },
  ];
  for (const m of maintData) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicles[m.vi].id,
        type: m.type,
        description: m.desc,
        cost: m.cost,
        odometerAt: m.oAt,
        performedAt: daysAgo(rnd(5, 25)),
      },
    });
  }
  console.log(`  ✅ ${maintData.length} ta texnik xizmat yozuvi`);

  /* ── 5. Yakunlangan reyslar ── */
  console.log('\n✈️  Yakunlangan reyslar...');
  for (let i = 0; i < COMPLETED.length; i++) {
    const c = COMPLETED[i];
    const dr = drivers[c.di];
    const vh = vehicles[c.vi];

    const fl = await prisma.flight.create({
      data: {
        businessmanId: bizId,
        driverId: dr.id,
        vehicleId: vh.id,
        flightType: c.type,
        roadMoney: c.road,
        driverProfitPercent: c.profit,
        startOdometer: c.oStart,
        endOdometer: c.oEnd,
        status: 'completed',
        startedAt: c.start,
        completedAt: c.end,
      },
    });

    for (const lg of c.legs) {
      const fee = (lg.pay * lg.fee) / 100;
      await prisma.leg.create({
        data: {
          flightId: fl.id,
          fromCity: lg.from,
          toCity: lg.to,
          cargo: lg.cargo,
          weight: lg.kg,
          payment: lg.pay,
          paymentType: lg.pType,
          transferFeePercent: lg.fee,
          transferFeeAmount: fee,
          netPayment: lg.pay - fee,
          status: 'completed',
        },
      });
    }

    for (const ex of c.exp) {
      const heavy = ['repair_major','tire_change','accident','insurance'].includes(ex.t);
      await prisma.expense.create({
        data: {
          flightId: fl.id,
          type: ex.t,
          expenseClass: heavy ? 'heavy' : 'light',
          amount: ex.a,
          currency: 'UZS',
          amountInUZS: ex.a,
          description: ex.d,
          timing: 'during',
          addedBy: 'businessman',
          addedById: bizId,
        },
      });
    }

    await recalculateFlightFinances(fl.id);
    console.log(`  ✅ Reys ${i+1}: ${dr.fullName} → ${c.legs[0].from}→${c.legs[0].to}`);
  }

  /* ── 6. Faol reyslar ── */
  console.log('\n🔴 Faol reyslar...');
  for (let i = 0; i < ACTIVE.length; i++) {
    const a = ACTIVE[i];
    const dr = drivers[a.di];
    const vh = vehicles[a.vi];

    const fl = await prisma.flight.create({
      data: {
        businessmanId: bizId,
        driverId: dr.id,
        vehicleId: vh.id,
        flightType: a.type,
        roadMoney: a.road,
        driverProfitPercent: a.profit,
        startOdometer: a.oStart,
        status: 'active',
        startedAt: a.start,
      },
    });

    for (const lg of a.legs) {
      const fee = (lg.pay * (lg.fee||0)) / 100;
      await prisma.leg.create({
        data: {
          flightId: fl.id,
          fromCity: lg.from,
          toCity: lg.to,
          cargo: lg.cargo,
          weight: lg.kg,
          payment: lg.pay,
          paymentType: lg.pType,
          transferFeePercent: lg.fee||0,
          transferFeeAmount: fee,
          netPayment: lg.pay - fee,
          status: lg.st || 'pending',
        },
      });
    }

    for (const ex of a.exp) {
      await prisma.expense.create({
        data: {
          flightId: fl.id,
          type: ex.t,
          expenseClass: 'light',
          amount: ex.a,
          currency: 'UZS',
          amountInUZS: ex.a,
          description: ex.d,
          timing: 'during',
          addedBy: 'businessman',
          addedById: bizId,
        },
      });
    }

    await prisma.driver.update({ where: { id: dr.id }, data: { status: 'busy' } });
    await recalculateFlightFinances(fl.id);
    console.log(`  ✅ Faol reys ${i+1}: ${dr.fullName} — ${a.legs[0].from}→${a.legs[0].to}`);
  }

  /* ── 7. Balans tranzaksiyalari ── */
  console.log('\n💰 Balans tranzaksiyalari...');
  const txs = [
    // Trial boshlandi
    { type:'trial_start',  amount:0,       before:0,      after:0,      desc:"Bepul sinov davri boshlandi (30 kun)", daysBack:90 },
    // Birinchi to'ldirish
    { type:'topup',        amount:500000,   before:0,      after:500000, desc:"Balans to'ldirildi: 500,000 UZS (Payme)", daysBack:60 },
    // Kunlik yechimlar
    { type:'daily_charge', amount:-10000,   before:500000, after:490000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:59 },
    { type:'daily_charge', amount:-10000,   before:490000, after:480000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:58 },
    { type:'daily_charge', amount:-10000,   before:480000, after:470000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:57 },
    { type:'daily_charge', amount:-10000,   before:470000, after:460000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:56 },
    { type:'daily_charge', amount:-10000,   before:460000, after:450000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:55 },
    { type:'daily_charge', amount:-10000,   before:450000, after:440000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:54 },
    { type:'daily_charge', amount:-10000,   before:440000, after:430000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:53 },
    // Ikkinchi to'ldirish
    { type:'topup',        amount:300000,   before:430000, after:730000, desc:"Balans to'ldirildi: 300,000 UZS (Payme)", daysBack:52 },
    { type:'daily_charge', amount:-10000,   before:730000, after:720000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:51 },
    { type:'daily_charge', amount:-10000,   before:720000, after:710000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:50 },
    { type:'daily_charge', amount:-10000,   before:710000, after:700000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:49 },
    { type:'daily_charge', amount:-10000,   before:700000, after:690000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:48 },
    { type:'daily_charge', amount:-10000,   before:690000, after:680000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:47 },
    { type:'daily_charge', amount:-10000,   before:680000, after:670000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:46 },
    { type:'daily_charge', amount:-10000,   before:670000, after:660000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:45 },
    // Uchinchi to'ldirish
    { type:'topup',        amount:200000,   before:660000, after:860000, desc:"Balans to'ldirildi: 200,000 UZS (Payme)", daysBack:40 },
    { type:'daily_charge', amount:-10000,   before:860000, after:850000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:39 },
    { type:'daily_charge', amount:-10000,   before:850000, after:840000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:38 },
    { type:'daily_charge', amount:-10000,   before:840000, after:830000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:37 },
    { type:'daily_charge', amount:-10000,   before:830000, after:820000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:36 },
    { type:'daily_charge', amount:-10000,   before:820000, after:810000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:35 },
    { type:'daily_charge', amount:-10000,   before:810000, after:800000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:34 },
    { type:'daily_charge', amount:-10000,   before:800000, after:790000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:33 },
    { type:'daily_charge', amount:-10000,   before:790000, after:780000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:32 },
    { type:'daily_charge', amount:-10000,   before:780000, after:770000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:31 },
    { type:'daily_charge', amount:-10000,   before:770000, after:760000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:30 },
    // To'rtinchi to'ldirish
    { type:'topup',        amount:500000,   before:760000, after:1260000,desc:"Balans to'ldirildi: 500,000 UZS (Payme)", daysBack:25 },
    { type:'daily_charge', amount:-10000,   before:1260000,after:1250000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:24 },
    { type:'daily_charge', amount:-10000,   before:1250000,after:1240000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:23 },
    { type:'daily_charge', amount:-10000,   before:1240000,after:1230000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:22 },
    { type:'daily_charge', amount:-10000,   before:1230000,after:1220000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:21 },
    { type:'daily_charge', amount:-10000,   before:1220000,after:1210000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:20 },
    { type:'daily_charge', amount:-10000,   before:1210000,after:1200000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:19 },
    { type:'daily_charge', amount:-10000,   before:1200000,after:1190000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:18 },
    { type:'daily_charge', amount:-10000,   before:1190000,after:1180000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:17 },
    { type:'daily_charge', amount:-10000,   before:1180000,after:1170000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:16 },
    { type:'daily_charge', amount:-10000,   before:1170000,after:1160000,desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:15 },
    // Beshinchi to'ldirish (oxirgi)
    { type:'topup',        amount:500000,   before:1160000,after:660000, desc:"Balans to'ldirildi: 500,000 UZS (Payme)", daysBack:10 },
    // Oxirgi 10 kun
    { type:'daily_charge', amount:-10000,   before:660000, after:650000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:9 },
    { type:'daily_charge', amount:-10000,   before:650000, after:640000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:8 },
    { type:'daily_charge', amount:-10000,   before:640000, after:630000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:7 },
    { type:'daily_charge', amount:-10000,   before:630000, after:620000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:6 },
    { type:'daily_charge', amount:-10000,   before:620000, after:610000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:5 },
    { type:'daily_charge', amount:-10000,   before:610000, after:600000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:4 },
    { type:'daily_charge', amount:-10000,   before:600000, after:590000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:3 },
    { type:'daily_charge', amount:-10000,   before:590000, after:580000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:2 },
    { type:'daily_charge', amount:-230000,  before:580000, after:350000, desc:"Kunlik to'lov: 10 ta mashina × 1,000 UZS", daysBack:1 },
  ];

  const existing = await prisma.balanceTransaction.count({ where: { businessmanId: bizId } });
  if (existing === 0) {
    for (const tx of txs) {
      await prisma.balanceTransaction.create({
        data: {
          businessmanId: bizId,
          type: tx.type,
          amount: tx.amount,
          balanceBefore: tx.before,
          balanceAfter: tx.after,
          vehicleCount: tx.type === 'daily_charge' ? 10 : null,
          description: tx.desc,
          createdAt: daysAgo(tx.daysBack),
        },
      });
    }
    // Hozirgi balansni to'g'rilash
    await prisma.businessman.update({ where: { id: bizId }, data: { balance: 350000 } });
    console.log(`  ✅ ${txs.length} ta balans tranzaksiyasi`);
  } else {
    console.log(`  ℹ️  Tranzaksiyalar mavjud (${existing} ta)`);
  }

  /* ── 8. Ish haqqi to'lovlari ── */
  console.log('\n💸 Ish haqqi to\'lovlari...');
  const salaryData = [
    { di:0, amount:850000,  note:'Fevral oyi ish haqi',   at:daysAgo(35) },
    { di:1, amount:720000,  note:'Fevral oyi ish haqi',   at:daysAgo(35) },
    { di:2, amount:600000,  note:'Fevral oyi ish haqi',   at:daysAgo(35) },
    { di:3, amount:900000,  note:'Fevral oyi + bonus',    at:daysAgo(35) },
    { di:4, amount:750000,  note:'Fevral oyi ish haqi',   at:daysAgo(35) },
    { di:0, amount:1100000, note:'Mart oyi ish haqi',     at:daysAgo(5)  },
    { di:1, amount:950000,  note:'Mart oyi ish haqi',     at:daysAgo(5)  },
    { di:3, amount:1200000, note:'Mart oyi ish haqi + bonus', at:daysAgo(5) },
  ];
  const existingSalaries = await prisma.salaryPayment.count({
    where: { driverId: { in: drivers.map(d => d.id) } }
  });
  if (existingSalaries === 0) {
    for (const s of salaryData) {
      await prisma.salaryPayment.create({
        data: {
          driverId: drivers[s.di].id,
          amount: s.amount,
          note: s.note,
          paidAt: s.at,
        },
      });
    }
    console.log(`  ✅ ${salaryData.length} ta ish haqi to'lovi`);
  } else {
    console.log(`  ℹ️  Ish haqi to'lovlari mavjud`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('═'.repeat(50));
  console.log('🔑 Biznesmen:   biznes / 20100804');
  console.log('🔑 Haydovchi:   biznes_mansur / driver123  (va boshqalar)');
  console.log(`📊 Reyslar:     ${COMPLETED.length} yakunlangan + ${ACTIVE.length} faol`);
  console.log('🚛 Mashinalar:  10 ta');
  console.log('👤 Haydovchilar: 10 ta');
  console.log('💰 Balans:      350,000 UZS (~35 kun)');
  console.log('═'.repeat(50) + '\n');
}

seed()
  .catch((e) => { console.error('❌ Xato:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
