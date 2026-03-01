const env = require('../config/env');

const getDefaultRate = () => parseFloat(env.DEFAULT_USD_RATE);

const convertToUZS = (amount, currency, exchangeRate = null) => {
  if (currency === 'UZS') return parseFloat(amount);
  const rate = exchangeRate ? parseFloat(exchangeRate) : getDefaultRate();
  return parseFloat(amount) * rate;
};

module.exports = { convertToUZS, getDefaultRate };
