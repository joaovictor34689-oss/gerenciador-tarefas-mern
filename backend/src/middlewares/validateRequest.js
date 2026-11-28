const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Confira os dados enviados.',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }

  return next();
}

module.exports = validateRequest;
