const prisma = require('../config/database');
const { FUEL_TYPES, LIGHT_TYPES, HEAVY_TYPES } = require('../validators/flight.validator');

const LIGHT_EXPENSE_TYPES = [...FUEL_TYPES, ...LIGHT_TYPES];

const recalculateFlightFinances = async (flightId) => {
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    include: {
      legs: { where: { status: { not: 'cancelled' } } },
      expenses: true,
    },
  });

  if (!flight) return;

  // 1. DAROMAD
  let totalIncome = 0;
  for (const leg of flight.legs) {
    totalIncome += parseFloat(leg.netPayment);
  }

  // 2. XARAJATLAR
  let fuelExpenses = 0;
  let tripExpenses = 0;
  let heavyExpenses = 0;
  let driverOwnExpenses = 0;

  for (const expense of flight.expenses) {
    const amt = parseFloat(expense.amountInUZS);
    if (FUEL_TYPES.includes(expense.type)) {
      fuelExpenses += amt;
    } else if (HEAVY_TYPES.includes(expense.type)) {
      heavyExpenses += amt;
    } else {
      tripExpenses += amt;
    }
    // Haydovchi o'z cho'ntagidan to'lagan yengil xarajatlar
    if (expense.paidFromOwn && !HEAVY_TYPES.includes(expense.type)) {
      driverOwnExpenses += amt;
    }
  }

  // Haydovchi joyida to'lagan kapital xarajatlar — qo'lidagi puldan ayiriladi
  let heavyPaidByDriver = 0;
  for (const expense of flight.expenses) {
    if (HEAVY_TYPES.includes(expense.type) && expense.paidFromOwn) {
      heavyPaidByDriver += parseFloat(expense.amountInUZS);
    }
  }

  const lightExpenses = fuelExpenses + tripExpenses;
  const totalExpenses = lightExpenses + heavyExpenses;

  // 3. FOYDA — heavy chiqarilmaydi!
  const netProfit = totalIncome - lightExpenses;
  const driverProfitPercent = parseFloat(flight.driverProfitPercent);
  const driverProfitAmount = netProfit > 0 ? (netProfit * driverProfitPercent) / 100 : 0;
  const businessProfit = netProfit > 0 ? netProfit - driverProfitAmount : netProfit;
  const driverOwes = businessProfit > 0 ? businessProfit : 0;

  // 4. HAYDOVCHI QOLIDAGI PUL
  // Naqd yo'nalishlar + naqd yo'l puli - o'z cho'ntagidan to'lagan xarajatlar
  let cashTotal = 0;
  for (const leg of flight.legs) {
    if (leg.paymentType === 'cash') {
      cashTotal += parseFloat(leg.netPayment);
    }
  }
  // cashRoadMoney = jami roadMoney - faqat o'tkazma yo'l pullari
  // (dastlabki yo'l puli va naqd to'lovlar cash hisoblanadi)
  const roadMoneyPayments = await prisma.roadMoneyPayment.findMany({
    where: { flightId },
  });
  let transferRoadMoney = 0;
  for (const p of roadMoneyPayments) {
    if (p.paymentType === 'transfer') {
      transferRoadMoney += parseFloat(p.amount);
    }
  }
  const roadMoney = parseFloat(flight.roadMoney);
  const cashRoadMoney = roadMoney - transferRoadMoney;
  // Haydovchi qo'lidagi pul = naqd yig'ilgan + naqd yo'l puli - yengil xarajatlar - kapital (haydovchi to'lagan) - olingan pul
  const driverCashInHand = cashTotal + cashRoadMoney - lightExpenses - heavyPaidByDriver - parseFloat(flight.driverPaidAmount);
  // Yo'l puli balansi = berilgan yo'l puli - sarf qilingan xarajatlar
  const finalBalance = roadMoney - lightExpenses;

  // 5. TO'LOV STATUSI
  const driverPaidAmount = parseFloat(flight.driverPaidAmount);
  let paymentStatus = 'pending';
  if (driverOwes > 0) {
    if (driverPaidAmount >= driverOwes) paymentStatus = 'paid';
    else if (driverPaidAmount > 0) paymentStatus = 'partial';
  } else {
    paymentStatus = 'paid';
  }

  // 6. YANGILASH
  await prisma.flight.update({
    where: { id: flightId },
    data: {
      totalIncome,
      fuelExpenses,
      tripExpenses,
      lightExpenses,
      heavyExpenses,
      totalExpenses,
      netProfit,
      driverProfitAmount,
      businessProfit,
      driverOwes,
      driverCashInHand,
      finalBalance,
      driverOwnExpenses,
      paymentStatus,
    },
  });
};

module.exports = { recalculateFlightFinances };
