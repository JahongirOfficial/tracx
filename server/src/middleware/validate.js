const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'body' ? req.body
    : source === 'params' ? req.params
    : source === 'query' ? req.query
    : req.body;

  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors,
    });
  }

  if (source === 'body') req.body = result.data;
  else if (source === 'params') req.params = result.data;
  else if (source === 'query') req.query = result.data;

  next();
};

module.exports = validate;
