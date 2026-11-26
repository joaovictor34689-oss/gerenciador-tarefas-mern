function errorHandler(error, req, res, next) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Os dados enviados não são válidos.' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Já existe um registro com esses dados.' });
  }

  console.error('Erro não tratado na API:', error.name);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
