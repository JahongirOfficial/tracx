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
  const driverProfitAmount = (netProfit * driverProfitPercent) / 100;
  const businessProfit = netProfit - driverProfitAmount;
  const driverOwes = businessProfit;

  // 4. HAYDOVCHI QOLIDAGI PUL
  let cashAndTransferTotal = 0;
  for (const leg of flight.legs) {
    if (['cash', 'transfer'].includes(leg.paymentType)) {
      cashAndTransferTotal += parseFloat(leg.netPayment);
    }
  }
  const roadMoney = parseFloat(flight.roadMoney);
  const driverCashInHand = cashAndTransferTotal + roadMoney - lightExpenses - driverProfitAmount;
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
