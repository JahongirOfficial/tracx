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

  for (const expense of flight.expenses) {
    const amt = parseFloat(expense.amountInUZS);
    if (FUEL_TYPES.includes(expense.type)) {
      fuelExpenses += amt;
    } else if (HEAVY_TYPES.includes(expense.type)) {
      heavyExpenses += amt;
    } else {
      tripExpenses += amt;
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
  // Haydovchi qo'lida faqat mijozlardan yig'ilgan naqd/o'tkazma pul
  let cashAndTransferTotal = 0;
  for (const leg of flight.legs) {
    if (['cash', 'transfer'].includes(leg.paymentType)) {
      cashAndTransferTotal += parseFloat(leg.netPayment);
    }
  }
  const roadMoney = parseFloat(flight.roadMoney);
  // Driver cash in hand = collected cash - what driver owes business
  const driverCashInHand = cashAndTransferTotal - driverOwes;
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
      paymentStatus,
    },
  });
};

module.exports = { recalculateFlightFinances };
