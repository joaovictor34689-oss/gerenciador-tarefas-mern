const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function requireAuth(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Faça login para continuar.' });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || !mongoose.isObjectIdOrHexString(payload.sub)) {
      return res.status(401).json({ message: 'Token inválido. Faça login novamente.' });
    }
    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = requireAuth;
